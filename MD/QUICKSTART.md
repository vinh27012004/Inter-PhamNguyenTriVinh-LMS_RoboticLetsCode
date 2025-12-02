# 🚀 QUICK START - 5 PHÚT ĐỂ CHẠY ADMIN PANEL

## Bước 1: Cài đặt (30 giây)
```powershell
cd "d:\CODE\ThucTapDoanhNghiep\E-RoboticLet'sCode"
pip install -r requirements.txt
```

## Bước 2: Cấu hình Database (1 phút)
```powershell
# Tạo database trong MySQL
mysql -u root -p
```
```sql
CREATE DATABASE IF NOT EXISTS LetCodeEdu;
EXIT;
```

## Bước 3: Migrations (1 phút)
```powershell
python manage.py makemigrations content
python manage.py makemigrations user_auth
python manage.py migrate
```

## Bước 4: Tạo Superuser (1 phút)
```powershell
python manage.py createsuperuser
# Username: admin
# Email: admin@example.com
# Password: (nhập password của bạn)
```

## Bước 5: Chạy Server (10 giây)
```powershell
python manage.py runserver
```

## Bước 6: Truy cập Admin (10 giây)
Mở trình duyệt: **http://127.0.0.1:8000/admin/**

Login bằng tài khoản superuser vừa tạo.

---

## 🎯 Test ngay tính năng

### 1. Tạo Chương trình học đầu tiên
- Click **"Programs"** → **"Add Program"**
- Điền:
  - Title: `SPIKE Essential Cơ bản`
  - Kit type: `SPIKE_ESSENTIAL`
  - Status: `Published`
- Scroll xuống → Thêm Subcourse inline:
  - Title: `Module 1: Làm quen`
  - Coding language: `ICON_BLOCKS`
- **Save** → ✅ Xong!

### 2. Thêm Bài học
- Click vào **Subcourse** vừa tạo
- Scroll xuống → Thêm Lesson inline:
  - Title: `Bài 1: Hello Robot`
  - Estimated duration: `30`
- **Save** → ✅ Xong!

### 3. Gán quyền cho User
- Click **"Users"** → Chọn user
- Scroll xuống → **"Auth assignments"** inline
- Thêm:
  - Program: Chọn program vừa tạo
  - Status: `ACTIVE`
- **Save** → ✅ Xong!

---

## 📚 Files quan trọng

| File | Mô tả |
|------|-------|
| `README_ADMIN.md` | 📖 Tài liệu đầy đủ về Admin Panel |
| `SETUP_GUIDE.md` | 🔧 Hướng dẫn setup chi tiết |
| `CODE_SUMMARY.md` | 📊 Tóm tắt code & architecture |
| `ADMIN_DEMO_GUIDE.py` | 💡 Demo cách sử dụng từng tính năng |
| `TEST_CHECKLIST.py` | ✅ Checklist để test |
| `requirements.txt` | 📦 Dependencies cần cài |

---

## ❓ Troubleshooting nhanh

### Lỗi: "ModuleNotFoundError: No module named 'django'"
```powershell
pip install django mysqlclient djangorestframework django-cors-headers
```

### Lỗi: "django.db.utils.OperationalError: (2003, "Can't connect")"
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra username/password trong `setting.py`

### Lỗi: "Unknown database 'LetCodeEdu'"
```sql
CREATE DATABASE LetCodeEdu;
```

### Lỗi: "No such table: content_program"
```powershell
python manage.py migrate
```

---

## 🎉 Chúc mừng!

Bạn đã có một Admin Panel chuyên nghiệp với:
- ✅ Cấu trúc 3 tầng: Program → Subcourse → Lesson
- ✅ RBAC đầy đủ: User → Profile → Assignment
- ✅ Inline editing tiện lợi
- ✅ Color badges đẹp mắt
- ✅ Smart links navigation
- ✅ Batch operations

**Next step:** Viết REST API với Django REST Framework! 🚀
