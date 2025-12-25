# 🚀 QUICK START - Storage Management Module

## Bước 1: Cài đặt Dependencies

```bash
pip install boto3 python-dotenv
```

## Bước 2: Cấu hình Environment Variables

Tạo file `.env` trong thư mục gốc:

```env
OBJECT_STORAGE_ACCESS_KEY=your_access_key_here
OBJECT_STORAGE_SECRET_KEY=your_secret_key_here
OBJECT_STORAGE_BUCKET=your_bucket_name
OBJECT_STORAGE_ENDPOINT=https://s3.amazonaws.com
OBJECT_STORAGE_REGION=auto
```

**Lưu ý:**
- AWS S3: `OBJECT_STORAGE_ENDPOINT=https://s3.amazonaws.com`
- MinIO: `OBJECT_STORAGE_ENDPOINT=http://localhost:9000`
- OB Việt Nam: `OBJECT_STORAGE_ENDPOINT=https://ob.vietnam.com`

## Bước 3: Migration Database

```bash
python manage.py makemigrations storage_management
python manage.py migrate
```

## Bước 4: Tạo Superuser (nếu chưa có)

```bash
python manage.py createsuperuser
```

## Bước 5: Chạy Server

```bash
python manage.py runserver
```

## Bước 6: Test API

### Upload File (cần admin token)

```bash
curl -X POST http://127.0.0.1:8000/api/storage/files/upload/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.jpg" \
  -F "folder_prefix=media/test/" \
  -F "visibility=PRIVATE"
```

### List Files

```bash
curl http://127.0.0.1:8000/api/storage/files/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Generate Presigned URL

```bash
curl -X POST http://127.0.0.1:8000/api/storage/files/generate-presigned-url/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "storage_key": "media/test/test.jpg",
    "expiration": 3600
  }'
```

## Bước 7: Truy cập Frontend

1. Chạy Next.js dev server:
```bash
cd frontend
npm run dev
```

2. Truy cập: `http://localhost:3000/storage`

3. Đăng nhập với tài khoản admin để upload/xóa files

## ✅ Checklist

- [ ] Đã cài boto3 và python-dotenv
- [ ] Đã cấu hình .env với Object Storage credentials
- [ ] Đã chạy migrations
- [ ] Đã tạo superuser
- [ ] Backend server chạy được
- [ ] Frontend server chạy được
- [ ] Có thể upload file qua API
- [ ] Có thể xem danh sách files
- [ ] Có thể generate presigned URL

## 🐛 Troubleshooting

### Lỗi: "Object Storage credentials chưa được cấu hình"
→ Kiểm tra file `.env` và đảm bảo các biến đã được set đúng

### Lỗi: "Access Denied" khi upload
→ Kiểm tra:
1. User đã đăng nhập chưa?
2. User có phải admin không? (`is_staff=True`)
3. Token có hợp lệ không?

### Lỗi: "Bucket not found"
→ Kiểm tra:
1. Bucket name trong `.env` đúng chưa?
2. Bucket đã được tạo trên Object Storage chưa?
3. Access key có quyền truy cập bucket không?

### Lỗi: "Connection refused" khi gọi Object Storage
→ Kiểm tra:
1. Endpoint URL đúng chưa?
2. Object Storage service đang chạy chưa?
3. Firewall/network có block không?

