# 🚀 QUICK START - E-Robotic Let's Code

> **Lưu ý:** Để xem hướng dẫn setup chi tiết, vui lòng xem [README.md](../README.md) ở thư mục gốc.

## ⚡ Các bước nhanh (5 phút)

### 1. Cài đặt Dependencies
```powershell
pip install -r requirements.txt
cd frontend && npm install
```

### 2. Cấu hình Database
```sql
CREATE DATABASE IF NOT EXISTS LetCodeEdu;
```
Cấu hình trong `settings.py` (xem [README.md](../README.md) để biết chi tiết)

### 3. Migrations & Superuser
```powershell
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 4. Chạy Server
```powershell
# Terminal 1: Backend
python manage.py runserver

# Terminal 2: Frontend
cd frontend && npm run dev
```

### 5. Truy cập
- **Admin Panel**: http://127.0.0.1:8000/admin/
- **API**: http://127.0.0.1:8000/api/
- **Frontend**: http://localhost:3000

## 🎯 Test nhanh

1. Đăng nhập Admin Panel
2. Tạo Program → Subcourse → Lesson
3. Kiểm tra API tại `/api/content/programs/`

## 📚 Tài liệu chi tiết

- [README.md](../README.md) - Hướng dẫn setup đầy đủ
- [README_ADMIN.md](./README_ADMIN.md) - Hướng dẫn Admin Panel
- [API_REFERENCE.md](./API_REFERENCE.md) - Tài liệu API
- [README_FRONTEND.md](./README_FRONTEND.md) - Hướng dẫn Frontend
