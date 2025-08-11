from fastapi import FastAPI, HTTPException
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

app = FastAPI(title="RetailMind AI Analysis API")

# CORS ayarları
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
    """Veri temizleme işlemleri"""
    # Boş satır/kolon temizliği
    df = df.dropna(how='all')
    df = df.dropna(axis=1, how='all')
    
    # Boşlukları temizle
    for col in df.columns:
        if df[col].dtype == 'object':
            df[col] = df[col].astype(str).str.strip()
    
    # Numerik kolonları tespit et ve dönüştür
    for col in df.columns:
        if df[col].dtype == 'object':
            # Sayısal değerleri tespit et
            numeric_values = pd.to_numeric(df[col], errors='coerce')
            if numeric_values.notna().sum() > len(df) * 0.5:  # %50'den fazla sayısal
                df[col] = numeric_values
    
    return df

def detect_date_columns(df: pd.DataFrame) -> List[str]:
    """Tarih kolonlarını tespit et"""
    date_columns = []
    for col in df.columns:
        if df[col].dtype == 'object':
            try:
                pd.to_datetime(df[col], errors='raise')
                date_columns.append(col)
            except:
                continue
    return date_columns

def extract_features_from_date(df: pd.DataFrame, date_col: str) -> pd.DataFrame:
    """Tarih kolonundan özellikler çıkar"""
    df[date_col] = pd.to_datetime(df[date_col])
    df[f'{date_col}_year'] = df[date_col].dt.year
    df[f'{date_col}_month'] = df[date_col].dt.month
    df[f'{date_col}_day'] = df[date_col].dt.day
    df[f'{date_col}_weekday'] = df[date_col].dt.weekday
    df[f'{date_col}_quarter'] = df[date_col].dt.quarter
    return df

def analyze_sales_data(df: pd.DataFrame) -> Dict[str, Any]:
    """Satış verilerini analiz et"""
    analysis = {}
    
    # Satış kolonlarını tespit et
    sales_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['sales', 'revenue', 'amount', 'price'])]
    quantity_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['quantity', 'qty', 'count'])]
    date_columns = detect_date_columns(df)
    
    if sales_columns and date_columns:
        sales_col = sales_columns[0]
        date_col = date_columns[0]
        
        # Tarih özelliklerini çıkar
        df = extract_features_from_date(df, date_col)
        
        # Aylık satış trendi
        monthly_sales = df.groupby([f'{date_col}_year', f'{date_col}_month'])[sales_col].sum().reset_index()
        monthly_sales['date'] = pd.to_datetime(monthly_sales[[f'{date_col}_year', f'{date_col}_month']].assign(day=1))
        
        analysis['monthly_trend'] = {
            'dates': monthly_sales['date'].dt.strftime('%Y-%m-%d').tolist(),
            'values': monthly_sales[sales_col].tolist()
        }
        
        # Toplam satış istatistikleri
        analysis['sales_stats'] = {
            'total_sales': float(df[sales_col].sum()),
            'average_sales': float(df[sales_col].mean()),
            'max_sales': float(df[sales_col].max()),
            'min_sales': float(df[sales_col].min()),
            'sales_count': int(len(df))
        }
    
    return analysis

def analyze_product_data(df: pd.DataFrame) -> Dict[str, Any]:
    """Ürün verilerini analiz et"""
    analysis = {}
    
    # Ürün kolonlarını tespit et
    product_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['product', 'item', 'sku'])]
    category_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['category', 'type', 'group'])]
    sales_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['sales', 'revenue', 'amount'])]
    
    if product_columns and sales_columns:
        product_col = product_columns[0]
        sales_col = sales_columns[0]
        
        # En çok satan ürünler
        top_products = df.groupby(product_col)[sales_col].sum().sort_values(ascending=False).head(10)
        
        analysis['top_products'] = {
            'products': top_products.index.tolist(),
            'sales': top_products.values.tolist()
        }
        
        # Kategori analizi
        if category_columns:
            category_col = category_columns[0]
            category_sales = df.groupby(category_col)[sales_col].sum().sort_values(ascending=False)
            
            analysis['category_analysis'] = {
                'categories': category_sales.index.tolist(),
                'sales': category_sales.values.tolist()
            }
    
    return analysis

def analyze_customer_data(df: pd.DataFrame) -> Dict[str, Any]:
    """Müşteri verilerini analiz et"""
    analysis = {}
    
    # Müşteri kolonlarını tespit et
    customer_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['customer', 'client', 'user'])]
    sales_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['sales', 'revenue', 'amount'])]
    
    if customer_columns and sales_columns:
        customer_col = customer_columns[0]
        sales_col = sales_columns[0]
        
        # Müşteri bazlı satış analizi
        customer_sales = df.groupby(customer_col)[sales_col].agg(['sum', 'count', 'mean']).reset_index()
        customer_sales.columns = ['customer', 'total_sales', 'order_count', 'avg_order_value']
        
        # En iyi müşteriler
        top_customers = customer_sales.nlargest(10, 'total_sales')
        
        analysis['top_customers'] = {
            'customers': top_customers['customer'].tolist(),
            'total_sales': top_customers['total_sales'].tolist(),
            'order_count': top_customers['order_count'].tolist()
        }
        
        # RFM Analizi (basit versiyon)
        date_columns = detect_date_columns(df)
        if date_columns:
            date_col = date_columns[0]
            df[date_col] = pd.to_datetime(df[date_col])
            
            # Son satın alma tarihi
            last_purchase = df.groupby(customer_col)[date_col].max()
            days_since_purchase = (datetime.now() - last_purchase).dt.days
            
            # Frekans (satın alma sayısı)
            frequency = df.groupby(customer_col).size()
            
            # Monetary (toplam harcama)
            monetary = df.groupby(customer_col)[sales_col].sum()
            
            rfm = pd.DataFrame({
                'recency': days_since_purchase,
                'frequency': frequency,
                'monetary': monetary
            })
            
            # RFM skorları
            rfm['r_score'] = pd.qcut(rfm['recency'], q=4, labels=[4, 3, 2, 1])
            rfm['f_score'] = pd.qcut(rfm['frequency'], q=4, labels=[1, 2, 3, 4])
            rfm['m_score'] = pd.qcut(rfm['monetary'], q=4, labels=[1, 2, 3, 4])
            
            analysis['rfm_analysis'] = {
                'high_value_customers': len(rfm[(rfm['r_score'] >= 3) & (rfm['f_score'] >= 3) & (rfm['m_score'] >= 3)]),
                'at_risk_customers': len(rfm[(rfm['r_score'] <= 2) & (rfm['f_score'] >= 3) & (rfm['m_score'] >= 3)]),
                'new_customers': len(rfm[(rfm['r_score'] >= 3) & (rfm['f_score'] <= 2) & (rfm['m_score'] <= 2)])
            }
    
    return analysis

def generate_basic_stats(df: pd.DataFrame) -> Dict[str, Any]:
    """Temel istatistikler"""
    stats = {
        'total_rows': len(df),
        'total_columns': len(df.columns),
        'missing_values': df.isnull().sum().sum(),
        'duplicate_rows': df.duplicated().sum(),
        'column_types': df.dtypes.astype(str).to_dict(),
        'numeric_columns': df.select_dtypes(include=[np.number]).columns.tolist(),
        'categorical_columns': df.select_dtypes(include=['object']).columns.tolist(),
        'date_columns': detect_date_columns(df)
    }
    
    # Numerik kolonlar için istatistikler
    if len(stats['numeric_columns']) > 0:
        numeric_stats = df[stats['numeric_columns']].describe()
        stats['numeric_summary'] = numeric_stats.to_dict()
    
    return stats

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_file(request: AnalysisRequest):
    try:
        # Base64'ten dosya verisini çöz
        file_data = base64.b64decode(request.file_data)
        
        # Encoding tespit et
        encoding = detect_encoding(file_data)
        
        # Dosyayı oku
        try:
            # CSV olarak dene
            df = pd.read_csv(io.BytesIO(file_data), encoding=encoding)
        except:
            try:
                # Excel olarak dene
                df = pd.read_excel(io.BytesIO(file_data))
            except:
                raise HTTPException(status_code=400, detail="Desteklenmeyen dosya formatı")
        
        # Veri temizleme
        df = clean_dataframe(df)
        
        # Analiz sonuçları
        analysis_results = {
            'basic_stats': generate_basic_stats(df),
            'sales_analysis': analyze_sales_data(df),
            'product_analysis': analyze_product_data(df),
            'customer_analysis': analyze_customer_data(df),
            'data_preview': df.head(10).to_dict('records'),
            'columns': df.columns.tolist()
        }
        
        return AnalysisResponse(
            success=True,
            analysis=analysis_results,
            message="Analiz başarıyla tamamlandı"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
