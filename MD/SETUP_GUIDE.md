# HƯỚNG DẪN SETUP NHANH - E-Robotic Let's Code

## 🚀 Các bước setup (5 phút)

### 1️⃣ Cài đặt Dependencies
```powershell
# Kích hoạt virtual environment (nếu có)
.\venv\Scripts\Activate.ps1

# Cài đặt packages
pip install -r requirements.txt
```

### 2️⃣ Cấu hình Database
Sửa file `setting.py` hoặc tạo file `settings.py` chính:

```python
# settings.py (hoặc trong project/settings.py)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Your apps ✅
    'content.apps.ContentConfig',
    'user_auth.apps.UserAuthConfig',
    
    # Third party
    'rest_framework',
    'corsheaders',
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'LetCodeEdu',       # ⚠️ TÊN DATABASE
        'USER': 'root',              # ⚠️ USERNAME MYSQL
        'PASSWORD': 'your_password', # ⚠️ PASSWORD MYSQL
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        }
    }
}

LANGUAGE_CODE = 'vi'
TIME_ZONE = 'Asia/Ho_Chi_Minh'
USE_I18N = True
USE_TZ = True
```

### 3️⃣ Tạo Database (MySQL)
```sql
-- Chạy trong MySQL Workbench hoặc Command Line
CREATE DATABASE IF NOT EXISTS LetCodeEdu;
```

### 4️⃣ Chạy Migrations
```powershell
# Tạo migrations
python manage.py makemigrations content
python manage.py makemigrations user_auth

# Apply migrations
python manage.py migrate
```

### 5️⃣ Tạo Superuser
```powershell
python manage.py createsuperuser
# Nhập: username, email, password
```

### 6️⃣ Chạy Server
```powershell
python manage.py runserver
```

### 7️⃣ Truy cập Admin Panel
Mở trình duyệt:
```
http://127.0.0.1:8000/admin/
```

---

## ✅ Kiểm tra nhanh

### Test Models
```powershell
python manage.py shell
```

```python
# Trong Django shell
from content.models import Program, Subcourse, Lesson
from user_auth.models import UserProfile, AuthAssignment

# Tạo Program test
program = Program.objects.create(
    title="SPIKE Essential Cơ bản",
    slug="spike-essential-co-ban",
    kit_type="SPIKE_ESSENTIAL",
    status="PUBLISHED",
    sort_order=1
)

# Tạo Subcourse test
subcourse = Subcourse.objects.create(
    program=program,
    title="Module 1: Làm quen với Robot",
    slug="module-1-lam-quen-voi-robot",
    coding_language="ICON_BLOCKS",
    status="PUBLISHED",
    sort_order=1
)

# Tạo Lesson test
lesson = Lesson.objects.create(
    subcourse=subcourse,
    title="Bài 1: Xây dựng robot đầu tiên",
    slug="bai-1-xay-dung-robot-dau-tien",
    status="PUBLISHED",
    sort_order=1
)

print("✅ Tạo dữ liệu test thành công!")
```

---

## 📋 Checklist

- [ ] Cài đặt dependencies từ requirements.txt
- [ ] Tạo database MySQL
- [ ] Cấu hình DATABASES trong settings.py
- [ ] Chạy makemigrations + migrate
- [ ] Tạo superuser
- [ ] Chạy server thành công
- [ ] Truy cập Admin Panel được
- [ ] Test tạo Program > Subcourse > Lesson

---

## 🆘 Common Issues

### Issue 1: ModuleNotFoundError: No module named 'content'
**Fix:** Đảm bảo thư mục `content/` và `user_auth/` cùng cấp với `manage.py`

### Issue 2: django.db.utils.OperationalError: (2003, "Can't connect to MySQL")
**Fix:** 
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra username/password trong settings.py

### Issue 3: django.db.utils.OperationalError: (1049, "Unknown database")
**Fix:** 
- Tạo database trong MySQL: `CREATE DATABASE LetCodeEdu;`

### Issue 4: No changes detected in 'content'
**Fix:**
- Xóa thư mục `content/migrations/` (giữ lại `__init__.py`)
- Chạy lại `python manage.py makemigrations`

---

**Good luck! 🚀**
