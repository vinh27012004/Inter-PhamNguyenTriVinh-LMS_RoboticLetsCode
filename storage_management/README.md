# Storage Management Module

Module quản trị Object Storage cho hệ thống học LEGO SPIKE.

## 📋 Kiến trúc tổng thể

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │ ──────> │   Django     │ ──────> │ Object      │
│  Frontend   │  API    │   Backend    │  boto3  │ Storage     │
│             │         │              │         │ (S3/MinIO)  │
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                              ▼
                        ┌──────────────┐
                        │    MySQL     │
                        │  (Metadata)  │
                        └──────────────┘
```

**Luồng hoạt động:**
1. Frontend gọi API Django (không kết nối trực tiếp với Object Storage)
2. Django xử lý request, gọi boto3 để tương tác với Object Storage
3. Metadata (tên file, size, URL, etc.) được lưu vào MySQL
4. File binary được lưu trên Object Storage

## 🔧 Cấu hình

### 1. Environment Variables (.env)

```env
OBJECT_STORAGE_ACCESS_KEY=your_access_key
OBJECT_STORAGE_SECRET_KEY=your_secret_key
OBJECT_STORAGE_BUCKET=your_bucket_name
OBJECT_STORAGE_ENDPOINT=https://s3.amazonaws.com  # hoặc MinIO endpoint
OBJECT_STORAGE_REGION=auto  # hoặc us-east-1, etc.
```

### 2. Cài đặt Dependencies

```bash
pip install boto3 python-dotenv
```

## 📁 Cấu trúc Folder trên Object Storage

```
bucket/
├── media/
│   ├── uploads/          # Files upload thông thường
│   ├── lessons/          # Files cho bài học
│   │   ├── lesson-1/
│   │   │   ├── images/
│   │   │   ├── videos/
│   │   │   └── attachments/
│   │   └── lesson-2/
│   ├── videos/           # Video bài học
│   └── images/           # Ảnh chung
```

## 🔐 Bảo mật

- **Private Files**: Cần Presigned URL (có thời hạn) để truy cập
- **Public Files**: Có thể truy cập trực tiếp qua URL
- **Permissions**: Chỉ admin mới được upload/xóa (xem `IsAdminOrReadOnly` permission)

## 📡 API Endpoints

### Upload File
```
POST /api/storage/files/upload/
Content-Type: multipart/form-data

Body:
- file: File object
- folder_prefix: (optional) media/lessons/lesson-1/
- visibility: (optional) PUBLIC | PRIVATE
- description: (optional) Mô tả
- lesson_id: (optional) ID bài học
```

### List Files
```
GET /api/storage/files/?prefix=media/lessons/&file_type=IMAGE&lesson_id=1
```

### Delete File
```
DELETE /api/storage/files/{id}/
```

### Generate Presigned URL
```
POST /api/storage/files/generate-presigned-url/
Body: {
  "storage_key": "media/lessons/lesson-1/image.jpg",
  "expiration": 3600  // seconds
}
```

### List Objects (trực tiếp từ Object Storage)
```
GET /api/storage/files/list-objects/?prefix=media/lessons/
```

## 🎨 Frontend Usage

### Import API Service
```typescript
import * as storageAPI from '@/services/storage';
```

### Upload File
```typescript
const file = event.target.files[0];
const result = await storageAPI.uploadFile(file, {
  folderPrefix: 'media/lessons/lesson-1/',
  visibility: 'PRIVATE',
  description: 'Ảnh minh họa bài học',
});
```

### List Files
```typescript
const files = await storageAPI.listFiles({
  prefix: 'media/lessons/',
  fileType: 'IMAGE',
});
```

### Generate Presigned URL
```typescript
const result = await storageAPI.generatePresignedURL(
  'media/lessons/lesson-1/video.mp4',
  3600  // 1 hour
);
const url = result.url;  // Use this URL to access file
```

## 📊 Database Schema

### StorageFile Model

- `storage_key`: Key/path trên Object Storage (unique)
- `file_name`: Tên file gốc
- `file_type`: IMAGE, VIDEO, PDF, AUDIO, OTHER
- `file_size`: Kích thước (bytes)
- `mime_type`: MIME type
- `visibility`: PUBLIC | PRIVATE
- `folder_prefix`: Folder chứa file
- `lesson_id`: ID bài học liên quan (optional)
- `uploaded_by`: User đã upload
- `uploaded_at`: Thời gian upload
- `public_url`: URL công khai (nếu PUBLIC)

## 🚀 Migration

```bash
python manage.py makemigrations storage_management
python manage.py migrate
```

## ✅ Best Practices

1. **Folder Structure**: Tổ chức folder theo chức năng (lessons/, videos/, images/)
2. **Naming**: Dùng UUID cho filename để tránh conflict
3. **Visibility**: Mặc định PRIVATE, chỉ PUBLIC khi cần thiết
4. **Presigned URL**: Dùng cho private files, có thời hạn (1-7 ngày)
5. **Metadata**: Luôn lưu metadata vào database để query nhanh

