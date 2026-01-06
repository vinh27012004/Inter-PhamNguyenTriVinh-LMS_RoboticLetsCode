# Tài liệu dự án - E-Robotic Let's Code

> **Lưu ý:** Để xem hướng dẫn setup và chạy dự án, vui lòng xem [README.md](../README.md) ở thư mục gốc.

## 📚 Danh sách tài liệu

### Hướng dẫn Setup & Development
- [QUICKSTART.md](./QUICKSTART.md) - Hướng dẫn setup nhanh
- [README_FRONTEND.md](./README_FRONTEND.md) - Hướng dẫn chi tiết về Frontend

### Tài liệu kỹ thuật
- [API_REFERENCE.md](./API_REFERENCE.md) - Tài liệu API đầy đủ
- [SERIALIZERS_SUMMARY.md](./SERIALIZERS_SUMMARY.md) - Tóm tắt Serializers
- [CODE_SUMMARY.md](./CODE_SUMMARY.md) - Tóm tắt cấu trúc code

### Hướng dẫn sử dụng
- [README_ADMIN.md](./README_ADMIN.md) - Hướng dẫn Admin Panel
- [LESSON_COMPONENTS_GUIDE.md](./LESSON_COMPONENTS_GUIDE.md) - Hướng dẫn Lesson Components
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Hướng dẫn Testing
- [INDEX.md](./INDEX.md) - Cấu trúc dự án

## 🏗️ Kiến trúc hệ thống

```
Frontend (React/Next.js)
    ↓ REST API
Backend (Django + DRF)
    ↓ ORM
Database (MySQL)
```

## 🎯 Tính năng chính

- **Content Management**: Program → Subcourse → Lesson (3-tier hierarchy)
- **User Management**: JWT Authentication với RBAC (Student, Teacher, Admin)
- **Class Management**: Quản lý lớp học và theo dõi tiến độ
- **Progress Tracking**: Theo dõi tiến độ học tập của học viên
