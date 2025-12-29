# 🚀 QUICK START - E-Robotic Let's Code

Hướng dẫn setup và chạy dự án trong 5 phút.

## 📋 Yêu cầu

- Python 3.8+
- MySQL 5.7+
- Node.js 18+ (cho frontend)

## ⚡ Các bước nhanh

### 1. Cài đặt Dependencies

```powershell
# Backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### 2. Cấu hình Database

Tạo database trong MySQL:
```sql
CREATE DATABASE IF NOT EXISTS LetCodeEdu;
```

Cấu hình trong `settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'custom_db',
        'NAME': 'LetCodeEdu',
        'USER': 'root',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

### 3. Migrations

```powershell
python manage.py makemigrations
python manage.py migrate
```

### 4. Tạo Superuser

```powershell
python manage.py createsuperuser
```

### 5. Chạy Server

```powershell
# Backend
python manage.py runserver

# Frontend (terminal khác)
cd frontend
npm run dev
```

### 6. Truy cập

- **Admin Panel**: http://127.0.0.1:8000/admin/
- **API**: http://127.0.0.1:8000/api/
- **Frontend**: http://localhost:3000

## 🎯 Test nhanh

1. Đăng nhập Admin Panel
2. Tạo Program → Subcourse → Lesson
3. Kiểm tra API tại `/api/content/programs/`

## 📚 Tài liệu chi tiết

- [README.md](./README.md) - Tổng quan dự án
- [README_ADMIN.md](./README_ADMIN.md) - Hướng dẫn Admin Panel
- [API_REFERENCE.md](./API_REFERENCE.md) - Tài liệu API
