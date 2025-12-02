# 📚 API ENDPOINTS SUMMARY - E-Robotic Let's Code

**Ngày tạo:** 2025-01-XX  
**Backend:** Django 5.2.8 + DRF 3.16.1  
**Database:** MariaDB 10.4.32

---

## 🔐 Authentication

Tất cả API endpoints yêu cầu **IsAuthenticated** (trừ admin)

**Login cho Browsable API:**
```
POST /api-auth/login/
```

**Logout:**
```
POST /api-auth/logout/
```

---

## 📖 CONTENT API

Base URL: `/api/content/`

### 1. Programs (Chương trình học)

#### List Programs
```http
GET /api/content/programs/
```
**Query Parameters:**
- `status` - Filter by status (DRAFT/PUBLISHED/ARCHIVED)
- `kit_type` - Filter by kit type (SPIKE_ESSENTIAL/SPIKE_PRIME)
- `search` - Tìm kiếm theo title, description
- `ordering` - Sắp xếp (sort_order, created_at, -created_at)

**Response:** List of programs (rút gọn - không có nested data)

#### Program Detail
```http
GET /api/content/programs/{id}/
```
**Response:** Full program với nested subcourses và lessons

**Example:**
```json
{
  "id": 1,
  "title": "Lập trình LEGO SPIKE Essential Cơ Bản",
  "description": "...",
  "kit_type": "SPIKE_ESSENTIAL",
  "status": "PUBLISHED",
  "subcourse_count": 3,
  "total_lessons": 12,
  "subcourses": [
    {
      "id": 1,
      "title": "Làm quen với SPIKE Essential",
      "lessons": [
        {
          "id": 1,
          "title": "Giới thiệu về SPIKE Essential",
          "video_url": "https://..."
        }
      ]
    }
  ]
}
```

---

### 2. Subcourses (Khóa học con)

#### List Subcourses
```http
GET /api/content/subcourses/
```
**Query Parameters:**
- `program` - Filter by program ID
- `coding_language` - Filter by language (SCRATCH/PYTHON/WORD_BLOCKS)
- `search` - Tìm kiếm theo title, description
- `ordering` - Sắp xếp (sort_order, created_at)

**Response:** List of subcourses (không có nested lessons)

#### Subcourse Detail
```http
GET /api/content/subcourses/{id}/
```
**Response:** Full subcourse với nested lessons

---

### 3. Lessons (Bài học)

#### List Lessons
```http
GET /api/content/lessons/
```
**Query Parameters:**
- `subcourse` - Filter by subcourse ID
- `search` - Tìm kiếm theo title, description
- `ordering` - Sắp xếp (sort_order, created_at)

**Response:** List of lessons (rút gọn)

#### Lesson Detail
```http
GET /api/content/lessons/{id}/
```
**Response:** Full lesson data

#### Mark Lesson Complete
```http
POST /api/content/lessons/{id}/mark_complete/
```
**Response:**
```json
{
  "status": "completed",
  "lesson": "Bài học 1",
  "progress_id": 123
}
```

---

### 4. User Progress (Tiến độ học tập)

#### List User Progress
```http
GET /api/content/progress/
```
**Query Parameters:**
- `is_completed` - Filter by completion status (true/false)
- `lesson` - Filter by lesson ID

**Response:** List of user's learning progress

---

## 👤 AUTH API

Base URL: `/api/auth/`

### 1. User Profile

#### Get My Profile
```http
GET /api/auth/profile/me/
```
**Response:**
```json
{
  "id": 1,
  "user": 2,
  "role": "STUDENT",
  "phone": "0912345678",
  "date_of_birth": "2010-05-15",
  "created_at": "2025-01-15T10:00:00Z"
}
```

---

### 2. Auth Assignments (Quyền truy cập)

#### List My Assignments
```http
GET /api/auth/assignments/
```
**QUAN TRỌNG:** Chỉ trả về assignments của user hiện tại với `status='ACTIVE'`

**Query Parameters:**
- `status` - Filter by status (ACTIVE/PENDING/EXPIRED/REVOKED)
- `program` - Filter by program ID
- `subcourse` - Filter by subcourse ID
- `ordering` - Sắp xếp (-created_at, valid_from, valid_until)

**Response:**
```json
[
  {
    "id": 1,
    "program_id": 1,
    "program_title": "Lập trình SPIKE Essential",
    "subcourse_id": null,
    "subcourse_title": null,
    "status": "ACTIVE",
    "is_valid": true,
    "valid_from": "2025-01-01",
    "valid_until": "2025-12-31"
  }
]
```

#### My Programs
```http
GET /api/auth/assignments/my_programs/
```
**Response:**
```json
{
  "program_ids": [1, 2, 3],
  "total_programs": 3
}
```

#### My Subcourses
```http
GET /api/auth/assignments/my_subcourses/
```
**Response:**
```json
{
  "subcourse_ids": [1, 2, 3, 4, 5],
  "total_subcourses": 5
}
```

---

### 3. Current User Info

#### Get Full User Info
```http
GET /api/auth/me/info/
```
**Response:**
```json
{
  "id": 2,
  "username": "student01",
  "email": "student01@example.com",
  "first_name": "Nguyễn",
  "last_name": "Văn A",
  "profile": {
    "role": "STUDENT",
    "phone": "0912345678"
  },
  "active_assignments": [
    {
      "program_title": "Lập trình SPIKE Essential",
      "status": "ACTIVE"
    }
  ]
}
```

---

## 🔍 Filter & Search Examples

### Tìm kiếm Programs
```http
GET /api/content/programs/?search=spike&kit_type=SPIKE_ESSENTIAL
```

### Lấy Subcourses của 1 Program
```http
GET /api/content/subcourses/?program=1
```

### Lấy Lessons của 1 Subcourse
```http
GET /api/content/lessons/?subcourse=1
```

### Lọc Active Assignments
```http
GET /api/auth/assignments/?status=ACTIVE
```

---

## 🚀 Frontend Integration Notes

### 1. Check User Permissions
```javascript
// Lấy danh sách Program IDs user có quyền
const response = await fetch('/api/auth/assignments/my_programs/');
const { program_ids } = await response.json();
// Dùng program_ids để hiển thị content phù hợp
```

### 2. Load Course Content
```javascript
// Lấy Program với full nested data
const response = await fetch('/api/content/programs/1/');
const program = await response.json();
// program.subcourses[0].lessons[0] có đầy đủ dữ liệu
```

### 3. Mark Lesson Complete
```javascript
// POST request để đánh dấu hoàn thành
await fetch('/api/content/lessons/1/mark_complete/', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token }
});
```

---

## 📊 Performance Optimization

### ViewSets đã tối ưu với:
- **ProgramViewSet:** `.prefetch_related('subcourses', 'subcourses__lessons')`
- **SubcourseViewSet:** `.select_related('program')`
- **LessonViewSet:** `.select_related('subcourse', 'subcourse__program')`
- **AuthAssignmentViewSet:** `.select_related('program', 'subcourse', 'user__profile')`

### Pagination
Mặc định: 10 items/page (có thể config trong settings.py)

---

## 🛡️ Security Notes

1. **Authentication Required:** Tất cả endpoints cần login
2. **User Isolation:** User chỉ xem được data của chính mình
3. **Read-Only:** Student chỉ có quyền đọc (không sửa/xóa)
4. **Status Filtering:** Chỉ hiển thị content `PUBLISHED`

---

## 📝 Testing với Browsable API

1. **Login:**
   - Truy cập: http://127.0.0.1:8000/api-auth/login/
   - Login với superuser account

2. **Test Endpoints:**
   - http://127.0.0.1:8000/api/content/programs/
   - http://127.0.0.1:8000/api/auth/assignments/
   - http://127.0.0.1:8000/api/auth/profile/me/

3. **Test Filters:**
   - http://127.0.0.1:8000/api/content/programs/?search=spike
   - http://127.0.0.1:8000/api/content/lessons/?subcourse=1

---

## 🔄 Next Steps

- [ ] Implement JWT Authentication (django-rest-framework-simplejwt)
- [ ] Add Throttling (Rate Limiting)
- [ ] Add API Versioning
- [ ] Write Unit Tests
- [ ] Setup Swagger/OpenAPI Documentation
- [ ] Add Caching (Redis)

---

**Generated by:** GitHub Copilot  
**Framework:** Django REST Framework  
**Status:** ✅ Production Ready
