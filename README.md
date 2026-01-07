# E-Robotic Let's Code

## Mô tả dự án

E-Robotic Let's Code là hệ thống học tập trực tuyến cho việc học lập trình LEGO SPIKE (SPIKE Essential và SPIKE Prime). Hệ thống cung cấp nền tảng quản lý nội dung học tập với cấu trúc 3 tầng: Chương trình học (Program) → Khóa học con (Subcourse) → Bài học (Lesson).

### Chức năng chính:

- **Quản lý nội dung học tập**: Tổ chức nội dung theo cấu trúc phân cấp Program → Subcourse → Lesson với đầy đủ media, quiz, thử thách
- **Quản lý người dùng**: Hệ thống xác thực JWT với phân quyền RBAC (Student, Teacher, Admin)
- **Quản lý lớp học**: Tạo và quản lý lớp học, ghi danh học viên, theo dõi tiến độ học tập
- **Theo dõi tiến độ**: Hệ thống theo dõi tiến độ học tập của từng học viên, đánh dấu bài học đã hoàn thành
- **Giao diện người dùng**: Frontend hiện đại với Next.js, hỗ trợ xem bài học, làm quiz, thực hiện thử thách

## Hướng dẫn chạy source code

### Yêu cầu hệ thống

- Python 3.8 trở lên
- MySQL 5.7 trở lên
- Node.js 18 trở lên
- npm hoặc yarn

### Cài đặt Backend

1. **Cài đặt dependencies:**
```powershell
pip install -r requirements.txt
```

2. **Cấu hình database:**
   - Tạo database trong MySQL:
   ```sql
   CREATE DATABASE IF NOT EXISTS LetCodeEdu;
   ```
   - Cấu hình thông tin kết nối trong file `settings.py`:
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

3. **Chạy migrations:**
```powershell
python manage.py makemigrations
python manage.py migrate
```

4. **Tạo superuser (tùy chọn):**
```powershell
python manage.py createsuperuser
```

5. **Chạy server:**
```powershell
python manage.py runserver
```
Backend sẽ chạy tại: http://127.0.0.1:8000

### Cài đặt Frontend

1. **Di chuyển vào thư mục frontend:**
```powershell
cd frontend
```

2. **Cài đặt dependencies:**
```powershell
npm install
```

3. **Cấu hình environment variables:**
   - Tạo file `.env.local` trong thư mục `frontend/`:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
   ```

4. **Chạy development server:**
```powershell
npm run dev
```
Frontend sẽ chạy tại: http://localhost:3000

### Truy cập hệ thống

- **Admin Panel**: http://127.0.0.1:8000/admin/
- **API Endpoints**: http://127.0.0.1:8000/api/
- **Frontend**: http://localhost:3000

## Ngôn ngữ lập trình / Công nghệ sử dụng

### Backend
- **Framework**: Django 4.2+
- **API**: Django REST Framework (DRF)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: MySQL
- **CORS**: django-cors-headers
- **Filtering**: django-filter

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Code Highlighting**: Prism.js

### Database
- **RDBMS**: MySQL 5.7+
- **ORM**: Django ORM

## Thông tin thực tập sinh

**Họ và tên**: Phạm Nguyễn Trí VinhVinh

**MSSV**: 64132994

**Trường/Lớp**: 64-CNTT_CLC

---

## Tài liệu tham khảo

Chi tiết về cấu trúc dự án, API documentation và hướng dẫn sử dụng xem trong thư mục `MD/`:
- `MD/README.md` - Tổng quan tài liệu dự án
- `MD/QUICKSTART.md` - Hướng dẫn setup nhanh
- `MD/README_FRONTEND.md` - Hướng dẫn chi tiết về Frontend
- `MD/API_REFERENCE.md` - Tài liệu API
- `MD/README_ADMIN.md` - Hướng dẫn Admin Panel
- `MD/LESSON_COMPONENTS_GUIDE.md` - Hướng dẫn Lesson Components

