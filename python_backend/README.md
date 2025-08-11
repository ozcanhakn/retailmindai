# RetailMind AI Python Analysis Backend

Bu Python backend'i, yüklenen CSV/Excel dosyalarını analiz etmek için kullanılır.

## Kurulum

1. Python 3.8+ yüklü olduğundan emin olun
2. Gerekli paketleri yükleyin:
   ```bash
   pip install -r requirements.txt
   ```

## Çalıştırma

### Windows
```bash
start_server.bat
```

### Linux/Mac
```bash
pip install -r requirements.txt
python main.py
```

## Özellikler

- **Dosya Okuma**: CSV ve Excel dosyalarını destekler
- **Encoding Tespiti**: UTF-8, ISO-8859-9, Latin-1 encoding'lerini otomatik tespit eder
- **Veri Temizleme**: Boş satır/kolon temizliği, veri tipi dönüşümü
- **Satış Analizi**: Aylık trendler, toplam satış istatistikleri
- **Ürün Analizi**: En çok satan ürünler, kategori analizi
- **Müşteri Analizi**: RFM analizi, en iyi müşteriler
- **Temel İstatistikler**: Satır/sütun sayısı, eksik değerler, veri tipleri

## API Endpoints

- `POST /analyze`: Dosya analizi yapar

## Örnek Kullanım

```python
import requests

# Dosya analizi
response = requests.post('http://localhost:8000/analyze', json={
    'file_id': 'test_file',
    'file_data': 'base64_encoded_file_data',
    'analysis_types': ['basic_stats', 'sales_analysis', 'product_analysis', 'customer_analysis']
})

print(response.json())
```

## Port

Backend varsayılan olarak `http://localhost:8000` adresinde çalışır.

