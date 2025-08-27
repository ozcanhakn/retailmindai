from fastapi import FastAPI, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
import json
import io
import base64
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')
import requests
import tiktoken
import os
import time
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import base64

app = FastAPI(title="RetailMind AI Analysis API")

# CORS ayarlarÄ±
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    file_id: str
    file_data: str  # base64 encoded file data
    analysis_types: List[str]

class AnalysisResponse(BaseModel):
    success: bool
    analysis: Dict[str, Any]
    message: str

class StartAnalysisRequest(BaseModel):
    file_id: str
    s3_url: str
    analysis_types: Optional[List[str]] = [
        'basic_stats', 'sales_analysis', 'product_analysis', 'customer_analysis'
    ]

class RagQueryRequest(BaseModel):
    file_id: str
    query: str
    top_k: int = 5

class RagQueryResponse(BaseModel):
    success: bool
    answer: str
    retrieved_chunks: list
    message: str


def generate_basic_stats(df: pd.DataFrame) -> Dict[str, Any]:
    """Temel istatistikler"""
    # Unique deÄŸerler iÃ§in hesaplama
    unique_products = 0
    unique_customers = 0
    unique_regions = 0
    
    # ÃœrÃ¼n kolonlarÄ±
    product_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['product', 'item', 'sku'])]
    if product_columns:
        unique_products = df[product_columns[0]].nunique()
    
    # MÃ¼ÅŸteri kolonlarÄ±  
    customer_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['customer', 'client', 'user'])]
    if customer_columns:
        unique_customers = df[customer_columns[0]].nunique()
    
    # BÃ¶lge kolonlarÄ±
    region_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['region', 'city', 'location', 'state'])]
    if region_columns:
        unique_regions = df[region_columns[0]].nunique()
    
    stats = {
        'total_rows': safe_int(len(df)),
        'total_columns': safe_int(len(df.columns)),
        'missing_values': safe_int(df.isnull().sum().sum()),
        'duplicate_rows': safe_int(df.duplicated().sum()),
        'column_types': df.dtypes.astype(str).to_dict(),
        'numeric_columns': df.select_dtypes(include=[np.number]).columns.tolist(),
        'categorical_columns': df.select_dtypes(include=['object']).columns.tolist(),
        'date_columns': detect_date_columns(df),
        'unique_products': unique_products,
        'unique_customers': unique_customers,
        'unique_regions': unique_regions
    }
    
    # Numerik kolonlar iÃ§in istatistikler
    if len(stats['numeric_columns']) > 0:
        numeric_stats = df[stats['numeric_columns']].describe()
        stats['numeric_summary'] = numeric_stats.to_dict()
    
    return stats

def detect_encoding(data: bytes) -> str:
    """Dosya encoding'ini tespit et"""
    encodings = ['utf-8', 'iso-8859-9', 'latin-1', 'cp1254']
    
    for encoding in encodings:
        try:
            data.decode(encoding)
            return encoding
        except UnicodeDecodeError:
            continue
    
    return 'utf-8'

def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Veri temizleme iÅŸlemleri"""
    # BoÅŸ satÄ±r/kolon temizliÄŸi
    df = df.dropna(how='all')
    df = df.dropna(axis=1, how='all')
    
    # BoÅŸluklarÄ± temizle
    for col in df.columns:
        if df[col].dtype == 'object':
            df[col] = df[col].astype(str).str.strip()
    
    # Numerik kolonlarÄ± tespit et ve dÃ¶nÃ¼ÅŸtÃ¼r
    for col in df.columns:
        if df[col].dtype == 'object':
            # SayÄ±sal deÄŸerleri tespit et
            numeric_values = pd.to_numeric(df[col], errors='coerce')
            if numeric_values.notna().sum() > len(df) * 0.5:  # %50'den fazla sayÄ±sal
                df[col] = numeric_values
    
    return df


def detect_date_columns(df: pd.DataFrame, threshold: float = 0.8) -> List[str]:
    """
    DataFrame'deki tarih kolonlarını tespit eder.
    
    Args:
        df: pandas DataFrame
        threshold: kolonun parse edilebilen değer oranı (% olarak) tarih kabul için
    
    Returns:
        List[str]: Tarih kolonlarının isimleri
    """
    date_columns: List[str] = []

    for col in df.columns:
        series = df[col]

        # 1️⃣ Eğer kolon datetime64 tipindeyse direkt ekle
        if pd.api.types.is_datetime64_any_dtype(series):
            date_columns.append(col)
            continue

        # 2️⃣ Eğer kolon object tipinde ise parse etmeye çalış
        if series.dtype == 'object':
            try:
                # Tüm değerleri datetime'a çevirmeye çalış, başarısız olanları NaT yap
                parsed = pd.to_datetime(series, errors='coerce', infer_datetime_format=True, dayfirst=True)
                
                # Parse edilebilen değer oranı
                non_null_ratio = parsed.notna().sum() / len(series)
                
                # Oran threshold'u geçtiyse tarih kolonudur
                if non_null_ratio >= threshold:
                    date_columns.append(col)
            except Exception:
                continue

    return date_columns


# === Heuristic + AI tabanlı kolon sınıflandırma ===
CANONICAL_TYPES = [
    'date', 'sales', 'price', 'revenue', 'amount', 'cost', 'quantity',
    'customer', 'product', 'sku', 'category', 'campaign', 'channel',
    'status', 'delivery', 'order', 'invoice', 'store', 'region', 'city'
]

# Prototip metinleri; AI varsa embedding ile benzerlik hesaplarız
_PROTOTYPE_TEXTS = {
    'sales': 'Sales revenue amount in currency; numeric; may be called sales, revenue, amount, total, subtotal, gross sales.',
    'price': 'Unit price per item; numeric; often called price, unit price, selling price.',
    'cost': 'Cost per item or cost of goods sold; numeric; called cost, COGS.',
    'quantity': 'Number of units purchased or sold; integer count; called quantity, qty, units, pieces.',
    'customer': 'Customer identifier or name; may be called customer, client, buyer, customer id.',
    'product': 'Product name or identifier; product, item, sku, upc, ean.',
    'sku': 'Stock keeping unit code; alphanumeric like ABC-123; sku, upc, ean.',
    'category': 'Product category or type; categorical labels.',
    'campaign': 'Marketing campaign name or id; promotion, promo, campaign.',
    'channel': 'Sales/marketing channel; source, medium, online/offline.',
    'status': 'Order or shipment status: shipped, delivered, pending, cancelled.',
    'order': 'Order identifier or number; order id, order no.',
    'invoice': 'Invoice identifier or number; invoice id, invoice no.',
    'delivery': 'Delivery or shipping info, often a date or method; delivery date, ship date.',
    'store': 'Store or location name or id; branch, shop.',
    'region': 'Region or state.',
    'city': 'City name.',
}

_PROTOTYPE_EMBEDDINGS: Dict[str, Optional[list]] = {key: None for key in _PROTOTYPE_TEXTS.keys()}

def _ensure_prototype_embeddings() -> bool:
    """Hazır metin prototipleri için embedding üretir. API yoksa False döner."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return False
    # Embedding'ler cache'lensin
    for label, text in _PROTOTYPE_TEXTS.items():
        if _PROTOTYPE_EMBEDDINGS[label] is None:
            try:
                _PROTOTYPE_EMBEDDINGS[label] = get_openai_embedding(text)
                time.sleep(0.05)
            except Exception:
                _PROTOTYPE_EMBEDDINGS[label] = None
    return any(v is not None for v in _PROTOTYPE_EMBEDDINGS.values())

def _series_sample_values(series: pd.Series, max_items: int = 8) -> List[str]:
    vals = series.dropna().astype(str).head(max_items).tolist()
    return vals

def _name_tokens(name: str) -> List[str]:
    name = name.lower().replace('_', ' ').replace('-', ' ')
    return [t for t in name.split() if t]

def _heuristic_class_candidates(col: str, series: pd.Series, date_cols: List[str]) -> Dict[str, float]:
    """Basit kurallar ile olası sınıflar ve skorları."""
    name = col.lower()
    tokens = _name_tokens(col)
    candidates: Dict[str, float] = {}
    n = max(len(series), 1)
    unique_ratio = series.nunique(dropna=True) / n
    is_numeric = pd.api.types.is_numeric_dtype(series)
    is_object = series.dtype == 'object'

    # Tarih
    if col in date_cols:
        candidates['date'] = 1.0

    # İsim temelli güçlü ipuçları
    def add(label: str, score: float):
        candidates[label] = max(candidates.get(label, 0.0), score)

    if any(t in tokens for t in ['sales', 'revenue', 'amount', 'subtotal', 'total']):
        add('sales', 0.9)
    if any(t in tokens for t in ['price', 'unit', 'unitprice', 'unit_price']):
        add('price', 0.9)
    if any(t in tokens for t in ['cost', 'cogs']):
        add('cost', 0.9)
    if any(t in tokens for t in ['qty', 'quantity', 'units', 'pieces']):
        add('quantity', 0.85)
    if any(t in tokens for t in ['customer', 'client', 'buyer', 'user']):
        add('customer', 0.9)
    if any(t in tokens for t in ['product', 'item']):
        add('product', 0.9)
    if any(t in tokens for t in ['sku', 'upc', 'ean']):
        add('sku', 0.9)
    if any(t in tokens for t in ['category', 'type', 'group']):
        add('category', 0.8)
    if any(t in tokens for t in ['campaign', 'promotion', 'promo']):
        add('campaign', 0.85)
    if any(t in tokens for t in ['channel', 'source', 'medium']):
        add('channel', 0.85)
    if any(t in tokens for t in ['status', 'state', 'condition']):
        add('status', 0.85)
    if any(t in tokens for t in ['delivery', 'shipping', 'ship']):
        add('delivery', 0.85)
    if any(t in tokens for t in ['order', 'po']):
        add('order', 0.8)
    if any(t in tokens for t in ['invoice', 'bill']):
        add('invoice', 0.8)
    if any(t in tokens for t in ['store', 'branch', 'shop']):
        add('store', 0.75)
    if any(t in tokens for t in ['region', 'state', 'zone']):
        add('region', 0.6)
    if any(t in tokens for t in ['city', 'town']):
        add('city', 0.6)

    # Değer dağılımına göre ipuçları
    if is_numeric:
        positive_ratio = (series > 0).mean() if n > 0 else 0.0
        if positive_ratio > 0.9 and 'price' not in candidates and 'cost' not in candidates:
            # Toplam tutar/satış olma ihtimali
            add('sales', max(0.5, candidates.get('sales', 0)))
        if unique_ratio < 0.2 and 'quantity' not in candidates and (series.round(0) == series).mean() > 0.8:
            add('quantity', max(0.6, candidates.get('quantity', 0)))
    elif is_object:
        # Alfanumerik kod yoğunluğu -> sku/product
        sample = series.dropna().astype(str).head(50)
        if not sample.empty:
            alnum_ratio = sample.str.match(r'^[A-Za-z0-9\-_/]{4,}$', na=False).mean()
            if alnum_ratio > 0.6:
                add('sku', max(0.7, candidates.get('sku', 0)))
        # İsim/yer isimleri -> müşteri/şehir
        if unique_ratio > 0.3 and 'customer' not in candidates and any(t in tokens for t in ['name', 'fullname']):
            add('customer', max(0.6, candidates.get('customer', 0)))

    return candidates

def _ai_classify_column(col: str, series: pd.Series) -> Optional[str]:
    """Kolon açıklamasından prototiplere en yakın sınıfı döndürür (AI varsa)."""
    if not _ensure_prototype_embeddings():
        return None
    desc_parts = [f"name: {col}"]
    dtype_group = 'numeric' if pd.api.types.is_numeric_dtype(series) else ('datetime' if pd.api.types.is_datetime64_any_dtype(series) else 'text')
    desc_parts.append(f"dtype: {dtype_group}")
    sample_vals = _series_sample_values(series)
    if sample_vals:
        desc_parts.append("samples: " + ", ".join(sample_vals))
    text = "; ".join(desc_parts)
    try:
        col_emb = get_openai_embedding(text)
    except Exception:
        return None
    # En yüksek kosinüs benzerliği olan sınıfı seç
    best_label = None
    best_score = -1.0
    for label, proto_emb in _PROTOTYPE_EMBEDDINGS.items():
        if proto_emb is None:
            continue
        try:
            score = cosine_similarity(col_emb, proto_emb)
        except Exception:
            continue
        if score > best_score:
            best_score = score
            best_label = label
    # Düşük güven skoru filtrele
    if best_score < 0.2:
        return None
    return best_label

def detect_semantic_columns(df: pd.DataFrame) -> Dict[str, List[str]]:
    """
    Heuristik + (varsa) AI ile kolon türlerini tespit eder.
    Çıktı: {type: [column_names]}
    """
    result: Dict[str, List[str]] = {t: [] for t in CANONICAL_TYPES}
    date_cols = detect_date_columns(df)
    for col in df.columns:
        series = df[col]
        # Heuristik adaylar
        heur = _heuristic_class_candidates(col, series, date_cols)
        # AI tahmini
        ai_label = _ai_classify_column(col, series)
        # Birleşim kuralı
        labels_ranked: List[tuple] = []
        for label, score in heur.items():
            labels_ranked.append((label, score + 0.0))
        if ai_label:
            labels_ranked.append((ai_label, 0.65))  # AI sinyali sabit ağırlık
        if not labels_ranked and col in date_cols:
            labels_ranked.append(('date', 1.0))
        if labels_ranked:
            labels_ranked.sort(key=lambda x: x[1], reverse=True)
            top_label = labels_ranked[0][0]
            # Eş anlamlıları toparla
            if top_label in ['revenue', 'amount']:
                top_label = 'sales'
            if top_label == 'sku':
                # sku hem product hem sku olarak işlenebilir
                if col not in result['product']:
                    result['product'].append(col)
            if col not in result.get(top_label, []):
                result[top_label].append(col)
        # Tarih kolonlarını da ekle
        if col in date_cols and col not in result['date']:
            result['date'].append(col)
    # Boş türleri silme (opsiyonel) -> burada tutalım
    return result

def extract_features_from_date(df: pd.DataFrame, date_col: str) -> pd.DataFrame:
    """Tarih kolonundan özellikler çıkar (sağlam parse)."""
    # Önce özel format: yyyy/dd/mm
    parsed = pd.to_datetime(df[date_col], errors='coerce', format='%Y/%d/%m')
    # Eğer başarısız ise genel parse'lara dön
    if parsed.isna().mean() > 0.5:
        parsed = pd.to_datetime(df[date_col], errors='coerce')
    if parsed.isna().mean() > 0.5:
        parsed = pd.to_datetime(df[date_col], errors='coerce', dayfirst=True)
    df[date_col] = parsed
    df[f'{date_col}_year'] = df[date_col].dt.year
    df[f'{date_col}_month'] = df[date_col].dt.month
    df[f'{date_col}_day'] = df[date_col].dt.day
    df[f'{date_col}_weekday'] = df[date_col].dt.weekday
    df[f'{date_col}_quarter'] = df[date_col].dt.quarter
    return df

def analyze_sales_data(df: pd.DataFrame) -> Dict[str, Any]:
    """Satış verilerini analiz et"""
    analysis: Dict[str, Any] = {}
    # Satış kolonlarını tespit et
    sales_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['sales', 'revenue', 'amount', 'price'])]
    date_columns = detect_date_columns(df)

    # Satış istatistikleri (tarihten bağımsız)
    if sales_columns:
        sales_col = sales_columns[0]
        sales_numeric = pd.to_numeric(df[sales_col], errors='coerce').fillna(0)
        analysis['sales_stats'] = {
            'total_sales': safe_float(sales_numeric.sum()),
            'average_sales': safe_float(sales_numeric.mean()),
            'max_sales': safe_float(sales_numeric.max()),
            'min_sales': safe_float(sales_numeric.min()),
            'sales_count': safe_int(len(df))
        }

    # Trend yalnızca tarih tespit edilebildiyse
    if sales_columns and date_columns:
        sales_col = sales_columns[0]
        date_col = date_columns[0]
        df = extract_features_from_date(df, date_col)
        monthly_sales = df.groupby([f'{date_col}_year', f'{date_col}_month'])[sales_col].sum().reset_index()
        if not monthly_sales.empty:
            monthly_sales['date'] = pd.to_datetime({
                'year': monthly_sales[f'{date_col}_year'].astype(int),
                'month': monthly_sales[f'{date_col}_month'].astype(int),
                'day': 1
            }, errors='coerce')
            monthly_sales = monthly_sales.dropna(subset=['date'])
            analysis['monthly_trend'] = {
                'dates': monthly_sales['date'].dt.strftime('%Y-%m-%d').tolist(),
                'values': [safe_float(x) for x in monthly_sales[sales_col].astype(float).tolist()]
            }

    # Bölgesel satış dağılımı (region/city vb. isimli kolonlar bulunursa)
    if sales_columns:
        sales_col = sales_columns[0]
        region_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['region', 'city', 'location', 'state'])]
        if region_columns:
            region_col = region_columns[0]
            region_sales = df.groupby(region_col)[sales_col].sum().sort_values(ascending=False)
            total = region_sales.sum() or 1.0
            analysis['sales_by_region'] = {
                'regions': region_sales.index.astype(str).tolist(),
                'sales': [safe_float(x) for x in region_sales.values.tolist()],
                'percentages': [safe_float(x / total * 100) for x in region_sales.values.tolist()]
            }

    return analysis

def analyze_product_data(df: pd.DataFrame) -> Dict[str, Any]:
    """ÃœrÃ¼n verilerini analiz et"""
    analysis = {}
    
    # ÃœrÃ¼n, kategori ve satÄ±ÅŸ kolonlarÄ±nÄ± tespit et
    product_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['product', 'item', 'sku'])]
    category_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['category', 'type', 'group'])]
    sales_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['sales', 'revenue', 'amount'])]
    
    # Toplam satÄ±ÅŸ hesapla
    total_sales = 0
    if sales_columns:
        sales_col = sales_columns[0]
        # totalSales'Ä± float olarak hesapla
        total_sales = float(df[sales_col].sum())
    
    analysis['totalSales'] = total_sales  # Burada ekleniyor

    if product_columns and sales_columns:
        product_col = product_columns[0]
        
        # En Ã§ok satan Ã¼rÃ¼nler
        top_products = df.groupby(product_col)[sales_col].sum().sort_values(ascending=False).head(10)
        
        analysis['top_products'] = {
            'products': top_products.index.tolist(),
            'sales': [float(x) for x in top_products.values.tolist()]
        }
        
        # Kategori analizi
        if category_columns:
            category_col = category_columns[0]
            category_sales = df.groupby(category_col)[sales_col].sum().sort_values(ascending=False)
            
            analysis['category_analysis'] = {
                'categories': category_sales.index.tolist(),
                'sales': [float(x) for x in category_sales.values.tolist()]
            }
    
    return analysis

def analyze_customer_data(df: pd.DataFrame) -> Dict[str, Any]:
    """MÃ¼ÅŸteri verilerini analiz et"""
    analysis = {}
    
    # MÃ¼ÅŸteri kolonlarÄ±nÄ± tespit et
    customer_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['customer', 'client', 'user'])]
    sales_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['sales', 'revenue', 'amount'])]
    
    if customer_columns and sales_columns:
        customer_col = customer_columns[0]
        sales_col = sales_columns[0]
        
        # MÃ¼ÅŸteri bazlÄ± satÄ±ÅŸ analizi
        customer_sales = df.groupby(customer_col)[sales_col].agg(['sum', 'count', 'mean']).reset_index()
        customer_sales.columns = ['customer', 'total_sales', 'order_count', 'avg_order_value']
        
        # En iyi mÃ¼ÅŸteriler
        top_customers = customer_sales.nlargest(10, 'total_sales')
        
        analysis['top_customers'] = {
            'customers': top_customers['customer'].tolist(),
            'total_sales': [safe_float(x) for x in top_customers['total_sales'].tolist()],
            'order_count': [safe_int(x) for x in top_customers['order_count'].tolist()]
        }
        
        # RFM Analizi (basit versiyon)
        date_columns = detect_date_columns(df)
        if date_columns:
            date_col = date_columns[0]
            df[date_col] = pd.to_datetime(df[date_col])
            
            # Son satÄ±n alma tarihi
            last_purchase = df.groupby(customer_col)[date_col].max()
            days_since_purchase = (datetime.now() - last_purchase).dt.days
            
            # Frekans (satÄ±n alma sayÄ±sÄ±)
            frequency = df.groupby(customer_col).size()
            
            # Monetary (toplam harcama)
            monetary = df.groupby(customer_col)[sales_col].sum()
            
            rfm = pd.DataFrame({
                'recency': days_since_purchase,
                'frequency': frequency,
                'monetary': monetary
            })
            
            # RFM skorlarÄ±
            rfm['r_score'] = pd.qcut(rfm['recency'], q=4, labels=[4, 3, 2, 1])
            rfm['f_score'] = pd.qcut(rfm['frequency'], q=4, labels=[1, 2, 3, 4])
            rfm['m_score'] = pd.qcut(rfm['monetary'], q=4, labels=[1, 2, 3, 4])
            
            analysis['rfm_analysis'] = {
                'high_value_customers': safe_int(len(rfm[(rfm['r_score'] >= 3) & (rfm['f_score'] >= 3) & (rfm['m_score'] >= 3)])),
                'at_risk_customers': safe_int(len(rfm[(rfm['r_score'] <= 2) & (rfm['f_score'] >= 3) & (rfm['m_score'] >= 3)])),
                'new_customers': safe_int(len(rfm[(rfm['r_score'] >= 3) & (rfm['f_score'] <= 2) & (rfm['m_score'] <= 2)]))
            }
    
    return analysis

# NOT: Aşağıdaki minimal sürüm duplicate idi ve zengin analiz fonksiyonunu override ediyordu.
# Kaldırıldı; zengin sürüm (yukarıdaki analyze_product_data) kullanılacak.


def generate_basic_stats(df: pd.DataFrame) -> Dict[str, Any]:
    """Temel istatistikler"""
    stats = {
        'total_rows': safe_int(len(df)),
        'total_columns': safe_int(len(df.columns)),
        'missing_values': safe_int(df.isnull().sum().sum()),
        'duplicate_rows': safe_int(df.duplicated().sum()),
        'column_types': df.dtypes.astype(str).to_dict(),
        'numeric_columns': df.select_dtypes(include=[np.number]).columns.tolist(),
        'categorical_columns': df.select_dtypes(include=['object']).columns.tolist(),
        'date_columns': detect_date_columns(df)
    }
    
    # Numerik kolonlar iÃ§in istatistikler
    if len(stats['numeric_columns']) > 0:
        numeric_stats = df[stats['numeric_columns']].describe()
        stats['numeric_summary'] = numeric_stats.to_dict()
    
    return stats

# OpenAI API ile embedding fonksiyonu (veya ileride baÅŸka model)
def get_openai_embedding(text: str, model: str = "text-embedding-3-small") -> list:
    import requests
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise Exception("OPENAI_API_KEY environment variable is not set.")
    url = "https://api.openai.com/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "input": text,
        "model": model
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code != 200:
        raise Exception(f"OpenAI embedding error: {response.text}")
    return response.json()["data"][0]["embedding"]

# Chunking fonksiyonu: metin ve tabloyu parÃ§alara bÃ¶ler
def chunk_analysis(analysis: dict, max_tokens: int = 256) -> list:
    """
    Analiz Ã¶zetlerini ve Ã¶rnek tablo satÄ±rlarÄ±nÄ± chunk'lara bÃ¶ler.
    """
    chunks = []
    # 1. Analiz Ã¶zetlerini metin olarak ekle
    for key, value in analysis.items():
        if isinstance(value, dict) or isinstance(value, list):
            # Convert numpy types to Python types before JSON serialization
            def convert_numpy_types(obj):
                if isinstance(obj, dict):
                    return {k: convert_numpy_types(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [convert_numpy_types(item) for item in obj]
                elif hasattr(obj, 'item'):  # numpy scalar types
                    val = obj.item()
                    # Handle infinite and NaN values
                    if isinstance(val, float):
                        if np.isnan(val) or np.isinf(val):
                            return None
                    return val
                elif hasattr(obj, 'isoformat'):  # pandas Timestamp
                    return obj.isoformat()
                elif hasattr(obj, 'strftime'):  # datetime objects
                    return obj.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    return obj
            
            converted_value = convert_numpy_types(value)
            text = json.dumps({key: converted_value}, ensure_ascii=False)
        else:
            # Convert numpy scalar to Python type
            if hasattr(value, 'item'):
                value = value.item()
            text = f"{key}: {value}"
        # Token sayÄ±sÄ±na gÃ¶re bÃ¶l
        while len(text) > 0:
            chunk = text[:max_tokens*4]  # kaba tahmin: 1 token ~ 4 karakter
            chunks.append({"type": "analysis", "content": chunk, "source": key})
            text = text[max_tokens*4:]
    # 2. Ã–rnek tablo satÄ±rlarÄ±nÄ± ekle
    if "data_preview" in analysis:
        for i, row in enumerate(analysis["data_preview"]):
            # Convert numpy types in row data
            def convert_row_types(obj):
                if isinstance(obj, dict):
                    return {k: convert_row_types(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [convert_row_types(item) for item in obj]
                elif hasattr(obj, 'item'):  # numpy scalar types
                    val = obj.item()
                    # Handle infinite and NaN values
                    if isinstance(val, float):
                        if np.isnan(val) or np.isinf(val):
                            return None
                    return val
                elif hasattr(obj, 'isoformat'):  # pandas Timestamp
                    return obj.isoformat()
                elif hasattr(obj, 'strftime'):  # datetime objects
                    return obj.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    return obj
            
            converted_row = convert_row_types(row)
            row_text = json.dumps(converted_row, ensure_ascii=False)
            chunks.append({"type": "row", "content": row_text, "source": f"row_{i}"})
    return chunks

# Embedding'leri (ÅŸimdilik) bir dict'te sakla
global_vector_store = {}

def create_chart_base64(fig):
    """Matplotlib figure'Ä±nÄ± base64 string'e Ã§evir"""
    img_buffer = BytesIO()
    fig.savefig(img_buffer, format='png', dpi=100, bbox_inches='tight')
    img_buffer.seek(0)
    img_str = base64.b64encode(img_buffer.getvalue()).decode()
    plt.close(fig)  # Memory leak'i Ã¶nle
    return img_str

def create_sales_charts(df: pd.DataFrame, sales_col: str, date_col: str) -> Dict[str, str]:
    """SatÄ±ÅŸ chart'larÄ±nÄ± oluÅŸtur"""
    charts = {}
    
    # 1. AylÄ±k satÄ±ÅŸ trendi - Line Chart
    monthly_sales = df.groupby(df[date_col].dt.to_period('M'))[sales_col].sum()
    fig, ax = plt.subplots(figsize=(10, 6))
    monthly_sales.plot(kind='line', marker='o', ax=ax)
    ax.set_title('AylÄ±k SatÄ±ÅŸ Trendi', fontsize=14, fontweight='bold')
    ax.set_xlabel('Ay')
    ax.set_ylabel('SatÄ±ÅŸ TutarÄ±')
    ax.grid(True, alpha=0.3)
    charts['monthly_trend'] = create_chart_base64(fig)
    
    # 2. GÃ¼nlÃ¼k satÄ±ÅŸ daÄŸÄ±lÄ±mÄ± - Bar Chart
    daily_sales = df.groupby(df[date_col].dt.day_name())[sales_col].sum()
    day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    daily_sales = daily_sales.reindex(day_order, fill_value=0)
    
    fig, ax = plt.subplots(figsize=(10, 6))
    daily_sales.plot(kind='bar', ax=ax, color='skyblue')
    ax.set_title('GÃ¼nlÃ¼k SatÄ±ÅŸ DaÄŸÄ±lÄ±mÄ±', fontsize=14, fontweight='bold')
    ax.set_xlabel('GÃ¼n')
    ax.set_ylabel('SatÄ±ÅŸ TutarÄ±')
    ax.tick_params(axis='x', rotation=45)
    charts['daily_distribution'] = create_chart_base64(fig)
    
    return charts

def create_customer_charts(df: pd.DataFrame, customer_col: str, sales_col: str) -> Dict[str, str]:
    """MÃ¼ÅŸteri chart'larÄ±nÄ± oluÅŸtur"""
    charts = {}
    
    # 1. En iyi mÃ¼ÅŸteriler - Bar Chart
    top_customers = df.groupby(customer_col)[sales_col].sum().nlargest(10)
    
    fig, ax = plt.subplots(figsize=(12, 8))
    top_customers.plot(kind='barh', ax=ax, color='lightcoral')
    ax.set_title('En Ä°yi 10 MÃ¼ÅŸteri', fontsize=14, fontweight='bold')
    ax.set_xlabel('Toplam SatÄ±ÅŸ')
    ax.set_ylabel('MÃ¼ÅŸteri')
    charts['top_customers'] = create_chart_base64(fig)
    
    # 2. MÃ¼ÅŸteri segmentleri - Pie Chart
    customer_sales = df.groupby(customer_col)[sales_col].sum()
    vip_threshold = customer_sales.quantile(0.9)
    
    segments = {
        'VIP': len(customer_sales[customer_sales >= vip_threshold]),
        'Regular': len(customer_sales[(customer_sales < vip_threshold) & (customer_sales > customer_sales.quantile(0.1))]),
        'Low Value': len(customer_sales[customer_sales <= customer_sales.quantile(0.1)])
    }
    
    fig, ax = plt.subplots(figsize=(8, 8))
    ax.pie(segments.values(), labels=segments.keys(), autopct='%1.1f%%', startangle=90)
    ax.set_title('MÃ¼ÅŸteri Segmentleri', fontsize=14, fontweight='bold')
    charts['customer_segments'] = create_chart_base64(fig)
    
    return charts

def create_product_charts(df: pd.DataFrame, product_col: str, sales_col: str, category_col: str = None) -> Dict[str, str]:
    """ÃœrÃ¼n chart'larÄ±nÄ± oluÅŸtur"""
    charts = {}
    
    # 1. En Ã§ok satan Ã¼rÃ¼nler - Bar Chart
    top_products = df.groupby(product_col)[sales_col].sum().nlargest(15)
    
    fig, ax = plt.subplots(figsize=(12, 8))
    top_products.plot(kind='barh', ax=ax, color='lightgreen')
    ax.set_title('En Ã‡ok Satan 15 ÃœrÃ¼n', fontsize=14, fontweight='bold')
    ax.set_xlabel('SatÄ±ÅŸ TutarÄ±')
    ax.set_ylabel('ÃœrÃ¼n')
    charts['top_products'] = create_chart_base64(fig)
    
    # 2. Kategori daÄŸÄ±lÄ±mÄ± - Pie Chart
    if category_col:
        category_sales = df.groupby(category_col)[sales_col].sum()
        
        fig, ax = plt.subplots(figsize=(10, 8))
        ax.pie(category_sales.values, labels=category_sales.index, autopct='%1.1f%%', startangle=90)
        ax.set_title('Kategori BazlÄ± SatÄ±ÅŸ DaÄŸÄ±lÄ±mÄ±', fontsize=14, fontweight='bold')
        charts['category_distribution'] = create_chart_base64(fig)
    
    return charts

def create_marketing_charts(df: pd.DataFrame, sales_col: str, campaign_col: str = None, channel_col: str = None) -> Dict[str, str]:
    """Pazarlama chart'larÄ±nÄ± oluÅŸtur"""
    charts = {}
    
    # 1. Kampanya performansÄ± - Bar Chart
    if campaign_col:
        campaign_performance = df.groupby(campaign_col)[sales_col].sum().sort_values(ascending=False)
        
        fig, ax = plt.subplots(figsize=(12, 6))
        campaign_performance.plot(kind='bar', ax=ax, color='gold')
        ax.set_title('Kampanya PerformansÄ±', fontsize=14, fontweight='bold')
        ax.set_xlabel('Kampanya')
        ax.set_ylabel('Toplam SatÄ±ÅŸ')
        ax.tick_params(axis='x', rotation=45)
        charts['campaign_performance'] = create_chart_base64(fig)
    
    # 2. Kanal performansÄ± - Donut Chart
    if channel_col:
        channel_performance = df.groupby(channel_col)[sales_col].sum()
        
        fig, ax = plt.subplots(figsize=(8, 8))
        wedges, texts, autotexts = ax.pie(channel_performance.values, labels=channel_performance.index, 
                                         autopct='%1.1f%%', startangle=90)
        ax.set_title('Kanal PerformansÄ±', fontsize=14, fontweight='bold')
        # Donut chart iÃ§in merkezde boÅŸluk oluÅŸtur
        centre_circle = plt.Circle((0,0), 0.70, fc='white')
        ax.add_artist(centre_circle)
        charts['channel_performance'] = create_chart_base64(fig)
    
    return charts

def create_operational_charts(df: pd.DataFrame, status_col: str = None, delivery_col: str = None) -> Dict[str, str]:
    """Operasyonel chart'larÄ±nÄ± oluÅŸtur"""
    charts = {}
    
    # 1. SipariÅŸ durumu - Pie Chart
    if status_col:
        status_distribution = df[status_col].value_counts()
        
        fig, ax = plt.subplots(figsize=(8, 8))
        ax.pie(status_distribution.values, labels=status_distribution.index, autopct='%1.1f%%', startangle=90)
        ax.set_title('SipariÅŸ Durumu DaÄŸÄ±lÄ±mÄ±', fontsize=14, fontweight='bold')
        charts['order_status'] = create_chart_base64(fig)
    
    # 2. Teslimat sÃ¼resi - Histogram
    if delivery_col and 'delivery_time_days' in df.columns:
        fig, ax = plt.subplots(figsize=(10, 6))
        ax.hist(df['delivery_time_days'].dropna(), bins=20, color='lightblue', alpha=0.7, edgecolor='black')
        ax.set_title('Teslimat SÃ¼resi DaÄŸÄ±lÄ±mÄ±', fontsize=14, fontweight='bold')
        ax.set_xlabel('Teslimat SÃ¼resi (GÃ¼n)')
        ax.set_ylabel('SipariÅŸ SayÄ±sÄ±')
        ax.grid(True, alpha=0.3)
        charts['delivery_time'] = create_chart_base64(fig)
    
    return charts

def safe_float(value):
    """Safely convert value to float, handling inf/nan"""
    try:
        val = float(value)
        if np.isnan(val) or np.isinf(val):
            return 0.0
        return val
    except:
        return 0.0

def safe_int(value):
    """Safely convert value to int"""
    try:
        val = int(value)
        if np.isnan(val) or np.isinf(val):
            return 0
        return val
    except:
        return 0

def advanced_sales_analysis(df: pd.DataFrame) -> Dict[str, Any]:
    """GeliÅŸmiÅŸ satÄ±ÅŸ analizi"""
    analysis = {}
    
    # SatÄ±ÅŸ kolonlarÄ±nÄ± tespit et
    sales_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['sales', 'revenue', 'amount', 'price'])]
    date_columns = detect_date_columns(df)
    
    if sales_columns and date_columns:
        sales_col = sales_columns[0]
        date_col = date_columns[0]
        
        # Tarih Ã¶zelliklerini Ã§Ä±kar
        df = extract_features_from_date(df, date_col)
        
        # 1. GÃ¼nlÃ¼k/HaftalÄ±k/AylÄ±k/YÄ±llÄ±k satÄ±ÅŸlar
        daily_sales = df.groupby(date_col)[sales_col].sum().reset_index()
        weekly_sales = df.groupby([f'{date_col}_year', pd.Grouper(key=date_col, freq='W')])[sales_col].sum().reset_index()
        monthly_sales = df.groupby([f'{date_col}_year', f'{date_col}_month'])[sales_col].sum().reset_index()
        yearly_sales = df.groupby(f'{date_col}_year')[sales_col].sum().reset_index()
        
        analysis['time_series'] = {
            'daily': {
                'dates': daily_sales[date_col].dt.strftime('%Y-%m-%d').tolist(),
                'values': [safe_float(x) for x in daily_sales[sales_col].tolist()]
            },
            'weekly': {
                'dates': weekly_sales[date_col].dt.strftime('%Y-%m-%d').tolist(),
                'values': [safe_float(x) for x in weekly_sales[sales_col].tolist()]
            },
            'monthly': {
                'dates': [f"{row[f'{date_col}_year']}-{row[f'{date_col}_month']:02d}" for _, row in monthly_sales.iterrows()],
                'values': [safe_float(x) for x in monthly_sales[sales_col].tolist()]
            },
            'yearly': {
                'years': yearly_sales[f'{date_col}_year'].tolist(),
                'values': [safe_float(x) for x in yearly_sales[sales_col].tolist()]
            }
        }
        
        # 2. Saat bazlÄ± satÄ±ÅŸ yoÄŸunluÄŸu
        if f'{date_col}_hour' not in df.columns:
            df[f'{date_col}_hour'] = df[date_col].dt.hour
        
        hourly_sales = df.groupby(f'{date_col}_hour')[sales_col].sum()
        analysis['hourly_heatmap'] = {
            'hours': hourly_sales.index.tolist(),
            'values': [safe_float(x) for x in hourly_sales.values.tolist()]
        }
        
        # 3. SipariÅŸ baÅŸÄ±na ortalama sepet tutarÄ± (AOV)
        order_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['order', 'invoice', 'transaction'])]
        if order_columns:
            order_col = order_columns[0]
            aov_by_date = df.groupby(date_col).agg({
                sales_col: 'sum',
                order_col: 'nunique'
            }).reset_index()
            aov_by_date['aov'] = aov_by_date[sales_col] / aov_by_date[order_col]
            
            analysis['aov_trend'] = {
                'dates': aov_by_date[date_col].dt.strftime('%Y-%m-%d').tolist(),
                'values': [safe_float(x) for x in aov_by_date['aov'].tolist()]
            }
    
    return analysis

def advanced_customer_analysis(df: pd.DataFrame) -> Dict[str, Any]:
    """GeliÅŸmiÅŸ mÃ¼ÅŸteri analizi"""
    analysis = {}
    
    # MÃ¼ÅŸteri kolonlarÄ±nÄ± tespit et
    customer_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['customer', 'client', 'user'])]
    sales_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['sales', 'revenue', 'amount'])]
    date_columns = detect_date_columns(df)
    
    if customer_columns and sales_columns:
        customer_col = customer_columns[0]
        sales_col = sales_columns[0]
        
        # 1. Yeni vs Tekrar eden mÃ¼ÅŸteri analizi
        customer_order_count = df.groupby(customer_col).size()
        new_customers = len(customer_order_count[customer_order_count == 1])
        returning_customers = len(customer_order_count[customer_order_count > 1])
        
        analysis['customer_segments'] = {
            'new_customers': new_customers,
            'returning_customers': returning_customers,
            'total_customers': len(customer_order_count),
            'retention_rate': safe_float(returning_customers / len(customer_order_count) * 100)
        }
        
        # 2. MÃ¼ÅŸteri segmentleri (VIP, Regular, etc.)
        customer_sales = df.groupby(customer_col)[sales_col].sum().sort_values(ascending=False)
        total_sales = customer_sales.sum()
        
        # VIP mÃ¼ÅŸteriler (top 10%)
        vip_threshold = customer_sales.quantile(0.9)
        vip_customers = len(customer_sales[customer_sales >= vip_threshold])
        
        # Regular mÃ¼ÅŸteriler (middle 80%)
        regular_customers = len(customer_sales[(customer_sales < vip_threshold) & (customer_sales > customer_sales.quantile(0.1))])
        
        # Low-value mÃ¼ÅŸteriler (bottom 10%)
        low_value_customers = len(customer_sales[customer_sales <= customer_sales.quantile(0.1)])
        
        analysis['customer_tiers'] = {
            'vip_customers': vip_customers,
            'regular_customers': regular_customers,
            'low_value_customers': low_value_customers,
            'vip_threshold': safe_float(vip_threshold)
        }
        
        # 3. MÃ¼ÅŸteri YaÅŸam Boyu DeÄŸeri (CLV)
        if date_columns:
            date_col = date_columns[0]
            df[date_col] = pd.to_datetime(df[date_col])
            
            # MÃ¼ÅŸteri baÅŸÄ±na toplam satÄ±n alma ve ortalama sipariÅŸ deÄŸeri
            clv_data = df.groupby(customer_col).agg({
                sales_col: ['sum', 'mean', 'count'],
                date_col: ['min', 'max']
            }).reset_index()
            
            clv_data.columns = ['customer', 'total_spent', 'avg_order', 'order_count', 'first_order', 'last_order']
            clv_data['customer_lifetime_days'] = (clv_data['last_order'] - clv_data['first_order']).dt.days
            
            # CLV hesaplama (basit: toplam harcama / mÃ¼ÅŸteri yaÅŸÄ±)
            clv_data['clv'] = clv_data['total_spent'] / (clv_data['customer_lifetime_days'] + 1) * 365  # yÄ±llÄ±k
            
            analysis['clv_analysis'] = {
                'avg_clv': safe_float(clv_data['clv'].mean()),
                'top_clv_customers': clv_data.nlargest(10, 'clv')[['customer', 'clv']].to_dict('records'),
                'clv_distribution': {
                    'low': safe_float(clv_data['clv'].quantile(0.25)),
                    'medium': safe_float(clv_data['clv'].quantile(0.5)),
                    'high': safe_float(clv_data['clv'].quantile(0.75))
                }
            }
    
    return analysis

def advanced_product_analysis(df: pd.DataFrame) -> Dict[str, Any]:
    """GeliÅŸmiÅŸ Ã¼rÃ¼n analizi"""
    analysis = {}
    
    # ÃœrÃ¼n kolonlarÄ±nÄ± tespit et
    product_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['product', 'item', 'sku'])]
    category_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['category', 'type', 'group'])]
    sales_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['sales', 'revenue', 'amount'])]
    price_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['price', 'cost'])]
    
    if product_columns and sales_columns:
        product_col = product_columns[0]
        sales_col = sales_columns[0]
        
        # 1. En Ã§ok satan Ã¼rÃ¼nler (Best Sellers)
        top_products = df.groupby(product_col)[sales_col].sum().sort_values(ascending=False).head(20)
        
        analysis['best_sellers'] = {
            'products': top_products.index.tolist(),
            'sales': [safe_float(x) for x in top_products.values.tolist()]
        }
        
        # 2. Kategori bazlÄ± satÄ±ÅŸ daÄŸÄ±lÄ±mÄ±
        if category_columns:
            category_col = category_columns[0]
            category_sales = df.groupby(category_col)[sales_col].sum().sort_values(ascending=False)
            
            analysis['category_distribution'] = {
                'categories': category_sales.index.tolist(),
                'sales': [safe_float(x) for x in category_sales.values.tolist()],
                'percentages': [safe_float(x / category_sales.sum() * 100) for x in category_sales.values.tolist()]
            }
        
        # 3. ÃœrÃ¼n karlÄ±lÄ±k analizi
        if price_columns and len(price_columns) >= 2:
            cost_col = price_columns[0]  # varsayÄ±m: ilk price kolonu cost
            price_col = price_columns[1] if len(price_columns) > 1 else price_columns[0]  # ikinci price kolonu selling price
            
            # Basit karlÄ±lÄ±k hesaplama
            product_profit = df.groupby(product_col).agg({
                sales_col: 'sum',
                cost_col: 'sum',
                price_col: 'sum'
            }).reset_index()
            
            product_profit['profit'] = product_profit[sales_col] - product_profit[cost_col]
            product_profit['profit_margin'] = (product_profit['profit'] / product_profit[sales_col] * 100).fillna(0)
            
            # En karlÄ± Ã¼rÃ¼nler
            top_profitable = product_profit.nlargest(10, 'profit_margin')
            
            analysis['profitability'] = {
                'top_profitable_products': top_profitable[[product_col, 'profit_margin', 'profit']].to_dict('records'),
                'avg_profit_margin': safe_float(product_profit['profit_margin'].mean()),
                'profit_distribution': {
                    'low': safe_float(product_profit['profit_margin'].quantile(0.25)),
                    'medium': safe_float(product_profit['profit_margin'].quantile(0.5)),
                    'high': safe_float(product_profit['profit_margin'].quantile(0.75))
                }
            }
        
        # 4. ÃœrÃ¼n yaÅŸam dÃ¶ngÃ¼sÃ¼ analizi (basit versiyon)
        date_columns = detect_date_columns(df)
        if date_columns:
            date_col = date_columns[0]
            df[date_col] = pd.to_datetime(df[date_col])
            
            # ÃœrÃ¼n baÅŸÄ±na ilk ve son satÄ±ÅŸ tarihi
            product_lifecycle = df.groupby(product_col).agg({
                date_col: ['min', 'max'],
                sales_col: 'sum'
            }).reset_index()
            
            product_lifecycle.columns = [product_col, 'first_sale', 'last_sale', 'total_sales']
            product_lifecycle['lifecycle_days'] = (product_lifecycle['last_sale'] - product_lifecycle['first_sale']).dt.days
            
            # ÃœrÃ¼n yaÅŸam dÃ¶ngÃ¼sÃ¼ kategorileri
            lifecycle_threshold = product_lifecycle['lifecycle_days'].quantile(0.5)
            
            new_products = len(product_lifecycle[product_lifecycle['lifecycle_days'] <= lifecycle_threshold])
            mature_products = len(product_lifecycle[(product_lifecycle['lifecycle_days'] > lifecycle_threshold) & 
                                                   (product_lifecycle['lifecycle_days'] <= lifecycle_threshold * 2)])
            declining_products = len(product_lifecycle[product_lifecycle['lifecycle_days'] > lifecycle_threshold * 2])
            
            analysis['product_lifecycle'] = {
                'new_products': new_products,
                'mature_products': mature_products,
                'declining_products': declining_products,
                'avg_lifecycle_days': safe_float(product_lifecycle['lifecycle_days'].mean())
            }
    
    return analysis

def marketing_analysis(df: pd.DataFrame) -> Dict[str, Any]:
    """Pazarlama analizi"""
    analysis = {}
    
    # Pazarlama kolonlarÄ±nÄ± tespit et
    campaign_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['campaign', 'promotion', 'discount'])]
    channel_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['channel', 'source', 'medium'])]
    coupon_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['coupon', 'discount', 'promo'])]
    sales_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['sales', 'revenue', 'amount'])]
    
    if sales_columns:
        sales_col = sales_columns[0]
        
        # 1. Kampanya analizi
        if campaign_columns:
            campaign_col = campaign_columns[0]
            campaign_performance = df.groupby(campaign_col)[sales_col].agg(['sum', 'count', 'mean']).reset_index()
            campaign_performance.columns = ['campaign', 'total_sales', 'order_count', 'avg_order_value']
            
            analysis['campaign_performance'] = {
                'campaigns': campaign_performance['campaign'].tolist(),
                'total_sales': [safe_float(x) for x in campaign_performance['total_sales'].tolist()],
                'order_count': [safe_int(x) for x in campaign_performance['order_count'].tolist()],
                'avg_order_value': [safe_float(x) for x in campaign_performance['avg_order_value'].tolist()]
            }
        
        # 2. Kanal performansÄ±
        if channel_columns:
            channel_col = channel_columns[0]
            channel_performance = df.groupby(channel_col)[sales_col].sum().sort_values(ascending=False)
            
            analysis['channel_performance'] = {
                'channels': channel_performance.index.tolist(),
                'sales': [safe_float(x) for x in channel_performance.values.tolist()],
                'percentages': [safe_float(x / channel_performance.sum() * 100) for x in channel_performance.values.tolist()]
            }
        
        # 3. Kupon/Ä°ndirim kullanÄ±m analizi
        if coupon_columns:
            coupon_col = coupon_columns[0]
            coupon_usage = df.groupby(coupon_col)[sales_col].agg(['sum', 'count']).reset_index()
            coupon_usage.columns = ['coupon', 'total_sales', 'usage_count']
            
            analysis['coupon_analysis'] = {
                'coupons': coupon_usage['coupon'].tolist(),
                'total_sales': [safe_float(x) for x in coupon_usage['total_sales'].tolist()],
                'usage_count': [safe_int(x) for x in coupon_usage['usage_count'].tolist()]
            }
    
    return analysis

def operational_analysis(df: pd.DataFrame) -> Dict[str, Any]:
    """Operasyonel analiz"""
    analysis = {}
    
    # Operasyonel kolonlarÄ±nÄ± tespit et
    delivery_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['delivery', 'shipping', 'fulfillment'])]
    status_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['status', 'state', 'condition'])]
    date_columns = detect_date_columns(df)
    
    if date_columns:
        date_col = date_columns[0]
        df[date_col] = pd.to_datetime(df[date_col])
        
        # 1. Teslimat sÃ¼resi analizi
        if delivery_columns:
            delivery_col = delivery_columns[0]
            
            # Basit teslimat sÃ¼resi hesaplama (order date ile delivery date arasÄ±)
            if len(date_columns) > 1:
                delivery_date_col = date_columns[1]  # varsayÄ±m: ikinci tarih kolonu teslimat tarihi
                df[delivery_date_col] = pd.to_datetime(df[delivery_date_col])
                df['delivery_time_days'] = (df[delivery_date_col] - df[date_col]).dt.days
                
                delivery_stats = df['delivery_time_days'].describe()
                
                analysis['delivery_analysis'] = {
                    'avg_delivery_time': safe_float(delivery_stats['mean']),
                    'min_delivery_time': safe_float(delivery_stats['min']),
                    'max_delivery_time': safe_float(delivery_stats['max']),
                    'delivery_time_distribution': {
                        'fast': safe_float(delivery_stats['25%']),
                        'medium': safe_float(delivery_stats['50%']),
                        'slow': safe_float(delivery_stats['75%'])
                    }
                }
        
        # 2. SipariÅŸ durumu analizi
        if status_columns:
            status_col = status_columns[0]
            status_distribution = df[status_col].value_counts()
            
            analysis['order_status'] = {
                'statuses': status_distribution.index.tolist(),
                'counts': [safe_int(x) for x in status_distribution.values.tolist()],
                'percentages': [safe_float(x / len(df) * 100) for x in status_distribution.values.tolist()]
            }
    
    return analysis

def store_performance_analysis(df: pd.DataFrame, store_col: str, sales_col: str, date_col: str) -> Dict[str, Any]:
    """
    MaÄŸaza bazlÄ± performans analizi:
    - Toplam satÄ±ÅŸ, ortalama satÄ±ÅŸ, satÄ±ÅŸ sayÄ±sÄ±
    - Zaman iÃ§indeki satÄ±ÅŸ trendi maÄŸaza bazÄ±nda
    """

    analysis = {}

    if store_col not in df.columns or sales_col not in df.columns or date_col not in df.columns:
        return {"error:" "MaÄŸaza bazlÄ± performans analizi iÃ§in gerekli kolonlar bulunamadÄ±"}

    # Toplam satÄ±ÅŸ, ortalama satÄ±ÅŸ ve satÄ±ÅŸ sayÄ±sÄ± maÄŸaza bazÄ±nda
    store_summary = df.groupby(store_col)[sales_col].agg(['sum', 'mean', 'count']).rename(
        columns={'sum': 'total_sales', 'mean': 'avg_sales', 'count': 'sales_count'}).reset_index()

    analysis['store_summary'] = store_summary.to_dict(orient='records')


    # zaman serisi: her maÄŸaza iÃ§in aylÄ±k satÄ±ÅŸ trendi
    df[date_col] = pd.to_datetime(df[date_col])
    df['year_month'] = df[date_col].dt.to_period('M').astype(str)

    monthly_trends = df.groupby([store_col, 'year_month'])[sales_col].sum().reset_index()

    # maÄŸaza bazlÄ± aylÄ±k satÄ±ÅŸ verisini dict yap.
    trends_dict = {}
    for store, group in monthly_trends.groupby(store_col):
        trends_dict[store] = {
            'months': group['year_month'].tolist(),
            'sales': [float(x) for x in group[sales_col].tolist()]
        }
        analysis['store_monthly_trends'] = trends_dict

        return analysis
    
    """
    Sezonluk satÄ±ÅŸ analizi:
    - ay bazÄ±nda ortalama satÄ±ÅŸ
    - haftnÄ±n gÃ¼nÃ¼ bazÄ±nda satÄ±ÅŸ eÄŸilimleri
    - Ã¶nemli tatil veya kampanya dÃ¶nemlerinin etkisi (Ã¶rnek: black friday)
    """

    analysis = {}

    if sales_col not in df.columns or date_col not in df.columns:
        return {"error": "Sezonluk satÄ±ÅŸ analizi iÃ§in gerekli kolonlar bulunamadÄ±"}

    df[date_col] = pd.to_datetime(df[date_col])

    # Ay bazÄ±nda ortalama satÄ±ÅŸ
    df['month'] = df[date_col].dt.month
    monthly_avg = df.groupby('month')[sales_col].mean().reset_index()
    analysis['monthly_avg_sales'] = {
        'months': monthly_avg['month'].tolist(),
        'avg_sales': [float(x) for x in monthly_avg[sales_col].tolist()]
    }

    # HaftanÄ±n gÃ¼nÃ¼ bazÄ±nda satÄ±ÅŸ
    df['weekday'] = df[date_col].dt.day_name()
    weekday_sales = df.groupby('weekday')[sales_col].sum()
    day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    weekday_sales = weekday_sales.reindex(day_order, fill_value=0)

    analysis['weekday_sales'] = {
        'days': weekday_sales.index.tolist(),
        'sales': [float(x) for x in weekday_sales.values.tolist()]
    }

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_file(request: AnalysisRequest):
    try:
        file_data = base64.b64decode(request.file_data)
        encoding = detect_encoding(file_data)
        try:
            df = pd.read_csv(io.BytesIO(file_data), encoding=encoding)
        except Exception:
            try:
                df = pd.read_excel(io.BytesIO(file_data))
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Desteklenmeyen dosya formatÄ± veya okuma hatasÄ±: {str(e)}")
        df = clean_dataframe(df)
        
        # Gelişmiş kolon tespiti (heuristik + AI)
        column_detection = detect_semantic_columns(df)
        date_columns = column_detection.get('date', []) or detect_date_columns(df)
        sales_columns = column_detection.get('sales', [])
        customer_columns = column_detection.get('customer', [])
        product_columns = column_detection.get('product', [])
        category_columns = column_detection.get('category', [])
        campaign_columns = column_detection.get('campaign', [])
        channel_columns = column_detection.get('channel', [])
        status_columns = column_detection.get('status', [])
        delivery_columns = column_detection.get('delivery', [])

        # Standart alias kolonları ekle: sales, customer, product, category, campaign, channel, status, delivery, order, invoice, price, cost, quantity, store, date
        alias_map = {
            'sales': sales_columns,
            'customer': customer_columns,
            'product': product_columns,
            'category': category_columns,
            'campaign': campaign_columns,
            'channel': channel_columns,
            'status': status_columns,
            'delivery': delivery_columns,
            'order': column_detection.get('order', []),
            'invoice': column_detection.get('invoice', []),
            'price': column_detection.get('price', []),
            'cost': column_detection.get('cost', []),
            'quantity': column_detection.get('quantity', []),
            'store': column_detection.get('store', []),
            'date': date_columns,
        }

        for alias, cols in alias_map.items():
            if alias not in df.columns and cols:
                src = cols[0]
                if alias == 'date':
                    # Güvenli parse
                    try:
                        df[alias] = pd.to_datetime(df[src], errors='coerce', infer_datetime_format=True)
                    except Exception:
                        df[alias] = pd.to_datetime(df[src], errors='coerce')
                elif alias in ['sales', 'price', 'cost', 'quantity']:
                    df[alias] = pd.to_numeric(df[src], errors='coerce')
                else:
                    df[alias] = df[src]
        
        # Chart oluÅŸturma
        charts = {}
        if sales_columns and date_columns:
            sales_col = sales_columns[0]
            date_col = date_columns[0]
            df[date_col] = pd.to_datetime(df[date_col])
            
            # SatÄ±ÅŸ chart'larÄ±
            charts['sales'] = create_sales_charts(df, sales_col, date_col)
            
            # MÃ¼ÅŸteri chart'larÄ±
            if customer_columns:
                customer_col = customer_columns[0]
                charts['customer'] = create_customer_charts(df, customer_col, sales_col)
            
            # ÃœrÃ¼n chart'larÄ±
            if product_columns:
                product_col = product_columns[0]
                category_col = category_columns[0] if category_columns else None
                charts['product'] = create_product_charts(df, product_col, sales_col, category_col)
            
            # Pazarlama chart'larÄ±
            campaign_col = campaign_columns[0] if campaign_columns else None
            channel_col = channel_columns[0] if channel_columns else None
            charts['marketing'] = create_marketing_charts(df, sales_col, campaign_col, channel_col)
            
            # Operasyonel chart'larÄ±
            status_col = status_columns[0] if status_columns else None
            delivery_col = delivery_columns[0] if delivery_columns else None
            charts['operational'] = create_operational_charts(df, status_col, delivery_col)
        
        analysis_results = {
            'basic_stats': generate_basic_stats(df),
            'sales_analysis': analyze_sales_data(df),
            'product_analysis': analyze_product_data(df),
            'customer_analysis': analyze_customer_data(df),
            'data_preview': df.head(10).to_dict('records'),
            'columns': df.columns.tolist(),
            'column_detection': column_detection,

            # GeliÅŸmiÅŸ analizler
            'advanced_sales': advanced_sales_analysis(df),
            'advanced_customer': advanced_customer_analysis(df),
            'advanced_product': advanced_product_analysis(df),
            'marketing_analysis': marketing_analysis(df),
            'operational_analysis': operational_analysis(df),
            # Chart'lar
            'charts': charts
        }
        # Her durumda chunk Ã¼ret ve store'a kaydet
        chunks = chunk_analysis(analysis_results)
        entries = []
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            for chunk in chunks:
                try:
                    emb = get_openai_embedding(chunk["content"])  # uses env inside
                    entries.append({"chunk": chunk, "embedding": emb})
                    time.sleep(0.3)
                except Exception as emb_err:
                    entries.append({"chunk": chunk, "embedding": None, "error": str(emb_err)})
            analysis_results["embedding_chunks_count"] = len(entries)
        else:
            # Embedding yoksa, yine de chunk'larÄ± embedding None ile sakla
            entries = [{"chunk": c, "embedding": None} for c in chunks]
            analysis_results["embedding_chunks_count"] = 0
            analysis_results["embedding_note"] = "OPENAI_API_KEY tanÄ±mlÄ± deÄŸil; embedding adÄ±mÄ± atlandÄ±."
        global_vector_store[request.file_id] = entries

        return AnalysisResponse(
            success=True,
            analysis=analysis_results,
            message="Analiz baÅŸarÄ±yla tamamlandÄ±"
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/start-analysis")
async def start_analysis(request: StartAnalysisRequest):
    """
    S3'ten dosya indirip analiz pipeline'Ä±nÄ± baÅŸlatÄ±r.
    """
    try:
        # S3'ten dosya indir (simÃ¼lasyon, gerÃ§ek ortamda boto3 ile yapÄ±lacak)
        s3_url = request.s3_url
        file_id = request.file_id
        analysis_types = request.analysis_types

        # GerÃ§ek ortamda: import boto3 ve S3 client ile dosya Ã§ek
        # Åžimdilik HTTP GET ile indiriyoruz (public S3 linki varsayÄ±mÄ±)
        response = requests.get(s3_url)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="S3 dosyasÄ± indirilemedi")
        file_data = response.content
        file_data_b64 = base64.b64encode(file_data).decode()

        # /analyze endpoint'ine analiz isteÄŸi gÃ¶nder
        analyze_payload = {
            'file_id': file_id,
            'file_data': file_data_b64,
            'analysis_types': analysis_types
        }
        analyze_response = requests.post('http://localhost:8000/analyze', json=analyze_payload)
        if analyze_response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Analiz hatasÄ±: {analyze_response.text}")
        return analyze_response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

@app.post("/rag-query", response_model=RagQueryResponse)
async def rag_query(request: RagQueryRequest):
    try:
        # 1. Sorgu iÃ§in embedding oluÅŸtur
        query_emb = get_openai_embedding(request.query)
        # 2. Ä°lgili embedding'leri al
        embeddings = global_vector_store.get(request.file_id, [])
        if not embeddings:
            return RagQueryResponse(success=False, answer="", retrieved_chunks=[], message="Embedding bulunamadÄ±.")
        # 3. Cosine similarity ile en yakÄ±n chunk'larÄ± bul
        scored = []
        for item in embeddings:
            if item["embedding"] is not None:
                sim = cosine_similarity(query_emb, item["embedding"])
                scored.append((sim, item["chunk"]))
        scored.sort(reverse=True, key=lambda x: x[0])
        top_chunks = [chunk for _, chunk in scored[:request.top_k]]
        # 4. Prompt'u oluÅŸtur
        context = "\n".join([chunk["content"] for chunk in top_chunks])
        prompt = f"Veri Ã¶zeti ve Ã¶rnekler:\n{context}\n\nSoru: {request.query}\nCevap:"  # TÃ¼rkÃ§e prompt
        # 5. OpenAI LLM ile cevap al
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise Exception("OPENAI_API_KEY environment variable is not set.")
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "Sen profesyonel bir satÄ±ÅŸ geliÅŸtirme uzmanÄ±sÄ±n. KÄ±sa, doÄŸru ve veri odaklÄ± cevap ver. AmacÄ±n, iÅŸletmenin satÄ±ÅŸlarÄ±nÄ± ve kÃ¢r oranÄ±nÄ± artÄ±rmak. EÄŸer emin deÄŸilsen 'veri yetersiz' de."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 512,
            "temperature": 0.7
        }
        response = requests.post(url, headers=headers, json=data)
        if response.status_code != 200:
            raise Exception(f"OpenAI LLM error: {response.text}")
        answer = response.json()["choices"][0]["message"]["content"]
        return RagQueryResponse(success=True, answer=answer, retrieved_chunks=top_chunks, message="RAG cevabÄ± baÅŸarÄ±yla Ã¼retildi.")
    except Exception as e:
        return RagQueryResponse(success=False, answer="", retrieved_chunks=[], message=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)