# E-Robotic Let's Code - Admin Panel Setup Guide

## 📁 Cấu trúc dự án đã tạo

```
E-RoboticLet'sCode/
├── content/                    # App quản lý nội dung học tập
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py              # Models: Program, Subcourse, Lesson, UserProgress
│   ├── admin.py               # Admin Panel với giao diện phân cấp ⭐
│   └── migrations/
│       └── __init__.py
│
├── user_auth/                  # App quản lý người dùng và phân quyền
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py              # Models: UserProfile, AuthAssignment
│   ├── admin.py               # Admin Panel cho RBAC ⭐
│   └── migrations/
│       └── __init__.py
│
├── setting.py                  # File cấu hình database
└── DatabaseLegoEducationLetCode.sql
```

## 🎯 Tính năng Admin Panel

### Content App (`content/admin.py`)

#### 1. **ProgramAdmin** - Quản lý Chương trình học
- ✅ Hiển thị danh sách với badge màu sắc cho trạng thái
- ✅ Inline `SubcourseInline` để thêm/sửa Khóa con ngay trong Program
- ✅ Đếm số lượng khóa con với link trực tiếp
- ✅ Tìm kiếm, lọc theo kit_type, status
- ✅ Sắp xếp với `sort_order` có thể edit trực tiếp

#### 2. **SubcourseAdmin** - Quản lý Khóa học con
- ✅ Inline `LessonInline` để thêm/sửa Bài học ngay trong Subcourse
- ✅ Hiển thị giá tiền định dạng VNĐ
- ✅ Đếm số lượng bài học với link trực tiếp
- ✅ Lọc theo Program, coding_language, status
- ✅ Fieldsets có thể thu gọn (collapse)

#### 3. **LessonAdmin** - Quản lý Bài học
- ✅ Icon hiển thị có video/file dự án hay không (✅/❌)
- ✅ Hiển thị thời lượng ước tính
- ✅ Tìm kiếm đa cấp (theo Program > Subcourse > Lesson)
- ✅ Fieldsets chia rõ: Mục tiêu, Nội dung, Media

#### 4. **UserProgressAdmin** - Theo dõi tiến độ
- ✅ Badge màu sắc cho trạng thái hoàn thành
- ✅ Date hierarchy để lọc theo thời gian
- ✅ Readonly metadata fields

### User Auth App (`user_auth/admin.py`)

#### 1. **Custom UserAdmin** - Tích hợp User mặc định
- ✅ Inline `UserProfileInline` (StackedInline)
- ✅ Inline `AuthAssignmentInline` để xem/gán quyền
- ✅ Badge màu sắc cho vai trò (STUDENT/TEACHER/ADMIN)

#### 2. **UserProfileAdmin** - Quản lý hồ sơ
- ✅ Hiển thị vai trò với badge màu sắc
- ✅ Tìm kiếm theo username, email, phone
- ✅ Readonly timestamps

#### 3. **AuthAssignmentAdmin** - Phân quyền RBAC ⭐⭐⭐
- ✅ Hiển thị target content (Program/Subcourse) với icon 📚/📖
- ✅ Badge trạng thái: ACTIVE/EXPIRED/REVOKED
- ✅ Badge hiệu lực (✓ Còn hiệu lực / ✗ Hết hiệu lực)
- ✅ **Admin Actions:**
  - Kích hoạt phân quyền hàng loạt
  - Thu hồi phân quyền hàng loạt
  - Kiểm tra và cập nhật phân quyền hết hạn
- ✅ Date hierarchy để lọc theo thời gian
- ✅ Validation: Phải chọn Program HOẶC Subcourse

## 🚀 Hướng dẫn chạy

### Bước 1: Cấu hình Database (settings.py)

Cập nhật file `settings.py` hoặc `setting.py` của bạn:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Your apps
    'content.apps.ContentConfig',       # ✅
    'user_auth.apps.UserAuthConfig',    # ✅
    
    # Third party
    'rest_framework',
    'corsheaders',
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'LetCodeEdu',          # ⚠️ Đổi theo database của bạn
        'USER': 'root',                 # ⚠️ Đổi username
        'PASSWORD': 'your_password',    # ⚠️ Đổi password
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        }
    }
}

LANGUAGE_CODE = 'vi'  # Tiếng Việt
TIME_ZONE = 'Asia/Ho_Chi_Minh'
```

### Bước 2: Tạo Migrations

```powershell
# Tạo migrations cho cả 2 apps
python manage.py makemigrations content
python manage.py makemigrations user_auth

# Chạy migrations
python manage.py migrate
```

### Bước 3: Tạo Superuser

```powershell
python manage.py createsuperuser
```

### Bước 4: Chạy Server

```powershell
python manage.py runserver
```

### Bước 5: Truy cập Admin Panel

Mở trình duyệt và truy cập:
```
http://127.0.0.1:8000/admin/
```

## 📊 Cấu trúc Database (3 tầng)

```
Program (Chương trình)
    ├── Subcourse 1 (Khóa con)
    │   ├── Lesson 1 (Bài học)
    │   ├── Lesson 2
    │   └── Lesson 3
    │
    └── Subcourse 2
        ├── Lesson 1
        └── Lesson 2

User (Người dùng)
    ├── UserProfile (Hồ sơ + Vai trò)
    └── AuthAssignment (Phân quyền)
        ├── → Program (Quyền toàn chương trình)
        └── → Subcourse (Quyền khóa con cụ thể)
```

## 🎨 Highlights của Admin Panel

### 1. **Inline Editing** (TabularInline/StackedInline)
- Thêm/sửa Subcourse trực tiếp trong Program
- Thêm/sửa Lesson trực tiếp trong Subcourse
- Tiết kiệm thời gian, tăng hiệu suất làm việc

### 2. **Color-Coded Badges**
- 🟢 PUBLISHED (Đã xuất bản)
- 🟠 DRAFT (Bản nháp)
- ⚫ ARCHIVED (Đã lưu trữ)
- 🔵 STUDENT / 🟡 TEACHER / 🔴 ADMIN

### 3. **Smart Links**
- Click vào "5 khóa con" → Xem danh sách khóa con của Program đó
- Click vào "10 bài học" → Xem danh sách bài học của Subcourse đó

### 4. **Admin Actions** (Batch Operations)
- Kích hoạt nhiều phân quyền cùng lúc
- Thu hồi nhiều phân quyền cùng lúc
- Tự động cập nhật trạng thái hết hạn

### 5. **Vietnamese Support**
- Tất cả `verbose_name` đều là tiếng Việt
- Admin site header: "E-Robotic Let's Code - Quản trị"

## 🔧 Tùy chỉnh thêm (Optional)

### Thêm Rich Text Editor (CKEditor)

```powershell
pip install django-ckeditor
```

Trong `models.py`:
```python
from ckeditor.fields import RichTextField

class Lesson(models.Model):
    content_text = RichTextField(verbose_name='Nội dung bài học')
```

### Thêm Image Upload

```powershell
pip install pillow
```

Cấu hình `MEDIA_ROOT` và `MEDIA_URL` trong settings.

## 📝 Next Steps

1. ✅ Chạy migrations
2. ✅ Tạo superuser
3. ✅ Test Admin Panel
4. 🔲 Viết API endpoints với Django REST Framework
5. 🔲 Tích hợp với Frontend (Next.js)
6. 🔲 Cấu hình Object Storage (AWS S3/Google Cloud Storage)
7. 🔲 Viết unit tests

## ⚠️ Lưu ý quan trọng

1. **AuthAssignment Validation:**
   - Phải chọn Program HOẶC Subcourse (không được cả hai hoặc không chọn gì)
   - Đã có constraint trong model: `auth_assignment_requires_program_or_subcourse`

2. **Slug Fields:**
   - Tất cả slug đều có `prepopulated_fields` để tự động tạo từ title
   - Nên cài đặt thêm `django-autoslug` nếu muốn tự động hóa hoàn toàn

3. **Permissions:**
   - Chỉ ADMIN/TEACHER mới có quyền truy cập Admin Panel
   - STUDENT chỉ truy cập qua API Frontend

## 🆘 Troubleshooting

### Lỗi: "Import django.db could not be resolved"
- ✅ Đây là lỗi Pylance khi chưa cài Django
- Chạy: `pip install django mysqlclient djangorestframework django-cors-headers`

### Lỗi: "Table doesn't exist"
- ✅ Chưa chạy migrations
- Chạy: `python manage.py makemigrations && python manage.py migrate`

### Lỗi: "No module named 'content'"
- ✅ Chưa thêm app vào INSTALLED_APPS
- Kiểm tra lại `settings.py`

---

**Chúc bạn code vui vẻ! 🎉**

*Nếu có câu hỏi hoặc cần hỗ trợ thêm, hãy hỏi nhé!*
