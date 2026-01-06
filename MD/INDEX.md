# 📁 CẤU TRÚC DỰ ÁN - E-Robotic Let's Code

> **Lưu ý:** Để xem tổng quan dự án, hướng dẫn setup và công nghệ sử dụng, vui lòng xem [README.md](../README.md) ở thư mục gốc.

## 📂 Cấu trúc thư mục

```
E-RoboticLetsCode/
├── content/              # App quản lý nội dung học tập
│   ├── models.py         # Models: Program, Subcourse, Lesson, UserProgress
│   ├── admin.py          # Admin Panel
│   ├── views.py          # API Views
│   └── serializers.py    # API Serializers
├── user_auth/            # App quản lý phân quyền RBAC
│   ├── models.py         # Models: UserProfile, AuthAssignment
│   ├── admin.py          # Admin Panel cho RBAC
│   └── views.py          # Auth API Views
├── classes/              # App quản lý lớp học
│   ├── models.py         # Models: Class, Enrollment
│   └── views.py          # Class Management API
├── frontend/             # React/Next.js frontend
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── services/         # API services
│   └── lib/              # Utilities
├── MD/                   # Tài liệu dự án
├── custom_db/            # Custom database backend
├── settings.py           # Django settings
├── urls.py               # URL routing
└── manage.py             # Django management script
```

## 📚 Tài liệu

Xem [README.md](./README.md) trong thư mục này để xem danh sách đầy đủ các tài liệu.

## ✅ Checklist phát triển

- [x] Models & Admin Panel
- [x] REST API Endpoints
- [x] Authentication & Authorization (JWT + RBAC)
- [x] Frontend Pages (Login, My Courses, Lesson Detail, Class Management)
- [x] API Documentation
- [ ] Testing (Unit tests, Integration tests)
- [ ] Production Deployment

## 🔗 Liên kết nhanh

- [README.md](../README.md) - Hướng dẫn setup và tổng quan
- [QUICKSTART.md](./QUICKSTART.md) - Setup nhanh
- [API_REFERENCE.md](./API_REFERENCE.md) - Tài liệu API
- [README_ADMIN.md](./README_ADMIN.md) - Hướng dẫn Admin Panel
