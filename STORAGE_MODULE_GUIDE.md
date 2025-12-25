# 📦 MODULE QUẢN TRỊ OBJECT STORAGE - HƯỚNG DẪN

## 🎯 Tổng quan

Module này cho phép quản trị files trên Object Storage (S3-compatible) thông qua Django Backend và React Frontend.

---

## 🏗️ KIẾN TRÚC TỔNG THỂ

```
Frontend (React) 
    ↓ API calls
Django Backend (DRF)
    ↓ boto3
Object Storage (S3/MinIO/OB VN)
    ↑ metadata
MySQL Database
```

**Đặc điểm:**
- Frontend KHÔNG kết nối trực tiếp với Object Storage (bảo mật)
- Django xử lý tất cả operations qua boto3
- Database chỉ lưu metadata, không lưu binary
- Hỗ trợ Public/Private files với Presigned URL

---

## 🔧 BACKEND (Django)

### 1. **Models** (`storage_management/models.py`)

**StorageFile Model**: Lưu metadata của files
- `storage_key`: Đường dẫn trên Object Storage (unique)
- `file_name`, `file_type`, `file_size`: Thông tin file
- `visibility`: PUBLIC hoặc PRIVATE
- `folder_prefix`: Folder chứa file
- `lesson_id`: Liên kết với bài học (optional)
- `uploaded_by`, `uploaded_at`: Audit fields

**Giải thích**: Model này chỉ lưu thông tin về file, không lưu binary data. Giúp query nhanh và quản lý dễ dàng.

### 2. **Services** (`storage_management/services.py`)

**ObjectStorageService Class**: Wrapper cho boto3 operations

**Các methods:**
- `upload_file()`: Upload file lên Object Storage
- `list_files()`: List files theo prefix (folder)
- `delete_file()`: Xóa file khỏi Object Storage
- `generate_presigned_url()`: Tạo signed URL có thời hạn
- `get_file_url()`: Lấy URL (public hoặc presigned)
- `file_exists()`: Kiểm tra file có tồn tại

**Giải thích**: Service layer tách biệt logic Object Storage, dễ test và maintain. Sử dụng boto3 để tương tác với S3-compatible storage.

### 3. **Views** (`storage_management/views.py`)

**StorageFileViewSet**: DRF ViewSet với các endpoints:

- `POST /api/storage/files/upload/`: Upload file
- `GET /api/storage/files/`: List files (có filter)
- `GET /api/storage/files/{id}/`: Chi tiết file
- `DELETE /api/storage/files/{id}/`: Xóa file
- `POST /api/storage/files/generate-presigned-url/`: Tạo presigned URL
- `GET /api/storage/files/list-objects/`: List trực tiếp từ Object Storage

**Permissions**: 
- Read: Authenticated users
- Write (upload/delete): Chỉ admin (`IsAdminOrReadOnly`)

**Giải thích**: ViewSet tự động tạo CRUD endpoints. Custom actions cho upload và presigned URL.

### 4. **URLs** (`storage_management/urls.py`)

Router đăng ký ViewSet → tự động tạo REST endpoints.

**Giải thích**: DRF router giúp tạo URLs tự động, không cần viết từng path.

---

## ⚛️ FRONTEND (React)

### 1. **API Service** (`frontend/services/storage.js`)

Wrapper functions gọi Django API:

- `uploadFile(file, options)`: Upload file
- `listFiles(params)`: List files với filter
- `getFileDetail(id)`: Chi tiết file
- `deleteFile(id)`: Xóa file
- `generatePresignedURL(key, expiration)`: Tạo presigned URL
- `listObjects(prefix)`: List từ Object Storage

**Giải thích**: Tách biệt API calls, dễ reuse và maintain. Dùng axios instance đã config sẵn (auto-attach token).

### 2. **UI Component** (`frontend/app/storage/page.tsx`)

**Storage Management Page** với các tính năng:

- ✅ Upload file với options (folder, visibility, description)
- ✅ List files dạng table (filter theo prefix, type)
- ✅ Preview ảnh/video trong modal
- ✅ Copy URL / Presigned URL
- ✅ Xóa file (với confirmation)
- ✅ Hiển thị file size, type, visibility

**Giải thích**: Component dùng React hooks (useState, useEffect) để quản lý state. UI responsive với Tailwind CSS.

---

## 📊 DATABASE

### Schema

**StorageFile Table**:
- Chỉ lưu metadata (tên, size, type, URL, etc.)
- KHÔNG lưu binary data
- Indexes trên `storage_key`, `folder_prefix`, `file_type` để query nhanh

**Giải thích**: Database chỉ làm "catalog", file thực sự nằm trên Object Storage. Giúp database nhẹ và scalable.

---

## 🔐 BẢO MẬT & BEST PRACTICES

### 1. **Phân quyền**
- Upload/Delete: Chỉ admin
- View: Authenticated users
- Access keys không expose ra frontend

### 2. **Visibility**
- **PRIVATE**: Cần Presigned URL (có thời hạn 1-7 ngày)
- **PUBLIC**: Có thể truy cập trực tiếp qua URL

### 3. **Folder Structure**
```
media/
├── uploads/          # Files upload thông thường
├── lessons/          # Files cho bài học
│   ├── lesson-1/
│   │   ├── images/
│   │   ├── videos/
│   │   └── attachments/
│   └── lesson-2/
├── videos/           # Video bài học
└── images/           # Ảnh chung
```

### 4. **File Naming**
- Dùng UUID để tránh conflict
- Format: `{folder_prefix}{uuid}.{ext}`

---

## 🚀 SETUP & USAGE

### 1. **Cấu hình Environment Variables**

Tạo file `.env`:
```env
OBJECT_STORAGE_ACCESS_KEY=your_access_key
OBJECT_STORAGE_SECRET_KEY=your_secret_key
OBJECT_STORAGE_BUCKET=your_bucket_name
OBJECT_STORAGE_ENDPOINT=https://s3.amazonaws.com
OBJECT_STORAGE_REGION=auto
```

### 2. **Cài đặt Dependencies**

```bash
pip install boto3 python-dotenv
```

### 3. **Migration**

```bash
python manage.py makemigrations storage_management
python manage.py migrate
```

### 4. **Truy cập**

- **Admin Panel**: `/admin/storage_management/storagefile/`
- **API**: `/api/storage/files/`
- **Frontend**: `/storage`

---

## 📝 VÍ DỤ SỬ DỤNG

### Backend (Python)
```python
from storage_management.services import ObjectStorageService

service = ObjectStorageService()
result = service.upload_file(file, 'media/lessons/lesson-1/image.jpg')
```

### Frontend (React)
```typescript
import * as storageAPI from '@/services/storage';

// Upload
const result = await storageAPI.uploadFile(file, {
  folderPrefix: 'media/lessons/lesson-1/',
  visibility: 'PRIVATE',
});

// List
const files = await storageAPI.listFiles({
  prefix: 'media/lessons/',
  fileType: 'IMAGE',
});

// Presigned URL
const { url } = await storageAPI.generatePresignedURL(
  'media/lessons/lesson-1/video.mp4',
  3600  // 1 hour
);
```

---

## ✅ CHECKLIST TRIỂN KHAI

- [x] Django app `storage_management` với models, services, views
- [x] API endpoints: upload, list, delete, presigned URL
- [x] Permissions: Admin only cho upload/delete
- [x] React components: Upload, List, Preview, Delete
- [x] API service cho frontend
- [x] Cấu hình Object Storage trong settings.py
- [x] Documentation và examples

---

## 🎓 KẾT LUẬN

Module này cung cấp giải pháp hoàn chỉnh để quản trị Object Storage:
- ✅ Bảo mật (không expose keys)
- ✅ Scalable (metadata trong DB, files trên Object Storage)
- ✅ Dễ sử dụng (REST API + React UI)
- ✅ Flexible (hỗ trợ Public/Private, Presigned URL)

