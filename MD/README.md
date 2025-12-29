# E-Robotic Let's Code

Hệ thống học LEGO SPIKE với Django Backend và React Frontend.

## 🎯 Tính năng

### Content Management
- Program → Subcourse → Lesson (3-tier hierarchy)
- Media management (images, videos, attachments)
- Quiz & Challenges
- User Progress tracking

### User Management
- Authentication với JWT
- RBAC (Student, Teacher, Admin)
- Profile management

### Class Management
- Tạo và quản lý lớp học
- Ghi danh học viên
- Theo dõi tiến độ

## 🚀 Bắt đầu

Xem [QUICKSTART.md](./QUICKSTART.md) để setup nhanh.

## 📚 Tài liệu

- [QUICKSTART.md](./QUICKSTART.md) - Setup nhanh
- [README_ADMIN.md](./README_ADMIN.md) - Admin Panel
- [API_REFERENCE.md](./API_REFERENCE.md) - API Documentation
- [LESSON_COMPONENTS_GUIDE.md](./LESSON_COMPONENTS_GUIDE.md) - Lesson Components

## 🏗️ Architecture

```
Frontend (React/Next.js)
    ↓ REST API
Backend (Django + DRF)
    ↓ ORM
Database (MySQL)
```

## 📦 Dependencies

**Backend:**
- Django >= 4.2
- djangorestframework
- djangorestframework-simplejwt
- django-cors-headers
- mysqlclient

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Axios
- Tailwind CSS

## 🔧 Development

```powershell
# Backend
python manage.py runserver

# Frontend
cd frontend
npm run dev
```

## 📝 License

Private project
