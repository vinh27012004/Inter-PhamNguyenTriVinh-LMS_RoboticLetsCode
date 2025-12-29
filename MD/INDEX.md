# 📁 CẤU TRÚC DỰ ÁN - E-Robotic Let's Code

## Tổng quan

Hệ thống học LEGO SPIKE với Django Backend và React Frontend.

---

## 📂 Cấu trúc thư mục

```
E-RoboticLetsCode/
├── content/              # App quản lý nội dung học tập
├── user_auth/            # App quản lý phân quyền RBAC
├── classes/              # App quản lý lớp học
├── frontend/             # React/Next.js frontend
├── MD/                   # Tài liệu
└── settings.py           # Django settings
```

---

## 📚 Tài liệu

| File | Mô tả |
|------|-------|
| [QUICKSTART.md](./QUICKSTART.md) | 🚀 Hướng dẫn setup nhanh |
| [README.md](./README.md) | 📖 Tổng quan dự án |
| [README_ADMIN.md](./README_ADMIN.md) | 📋 Hướng dẫn Admin Panel |
| [API_REFERENCE.md](./API_REFERENCE.md) | 🔌 Tài liệu API |
| [LESSON_COMPONENTS_GUIDE.md](./LESSON_COMPONENTS_GUIDE.md) | 📝 Hướng dẫn Lesson Components |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | 🧪 Hướng dẫn testing |

---

## 🎯 Tính năng chính

### Backend (Django)
- ✅ Content Management (Program → Subcourse → Lesson)
- ✅ User Authentication & Authorization (RBAC)
- ✅ Class Management
- ✅ REST API với DRF
- ✅ JWT Authentication

### Frontend (React/Next.js)
- ✅ Trang đăng nhập
- ✅ Trang khóa học của tôi
- ✅ Trang bài học chi tiết
- ✅ Trang quản lý lớp (Teacher)

---

## 🚀 Quick Start

```powershell
# 1. Cài đặt dependencies
pip install -r requirements.txt
cd frontend && npm install

# 2. Tạo database
mysql -u root -p
CREATE DATABASE LetCodeEdu;

# 3. Migrations
python manage.py migrate

# 4. Tạo superuser
python manage.py createsuperuser

# 5. Chạy server
python manage.py runserver
cd frontend && npm run dev
```

---

## 📊 Stack

- **Backend**: Django 4.2+ + Django REST Framework
- **Database**: MySQL
- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Authentication**: JWT (djangorestframework-simplejwt)

---

## ✅ Checklist

- [x] Models & Admin Panel
- [x] REST API Endpoints
- [x] Authentication & Authorization
- [x] Frontend Pages
- [ ] Testing
- [ ] Production Deployment

---

**Xem [README.md](./README.md) để biết thêm chi tiết.**
