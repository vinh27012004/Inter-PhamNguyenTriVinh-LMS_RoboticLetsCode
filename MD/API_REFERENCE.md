# API Reference - Robotics Learning Management System

## 📋 Tổng quan

Backend API cho hệ thống học Robotics với Django REST Framework.

**Base URL**: `/api/content/`

**Authentication**: 
- Session Authentication (cookie-based)
- Token Authentication (optional)

**Pagination**: 
- Default: 10 items/page
- Max: 100 items/page
- Query param: `?page_size=20`

---

## 🎯 Core Content APIs

### 1. Programs API

**Endpoints**:
```
GET    /api/content/programs/              # List all programs
GET    /api/content/programs/{slug}/       # Program detail
```

**Filters**:
- `?kit_type=SPIKE_PRIME` - Lọc theo loại kit
- `?status=PUBLISHED` - Lọc theo trạng thái

**Search**: `?search=robotics` - Tìm trong title, description

**Ordering**: `?ordering=sort_order,-created_at`

**Response Example** (List):
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Robotics Fundamentals",
      "slug": "robotics-fundamentals",
      "description": "Learn basic robotics concepts",
      "kit_type": "SPIKE_PRIME",
      "status": "PUBLISHED",
      "thumbnail_url": "https://...",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

**Response Example** (Detail):
```json
{
  "id": 1,
  "title": "Robotics Fundamentals",
  "slug": "robotics-fundamentals",
  "description": "Learn basic robotics concepts",
  "kit_type": "SPIKE_PRIME",
  "status": "PUBLISHED",
  "thumbnail_url": "https://...",
  "subcourses": [
    {
      "id": 1,
      "title": "Motors & Sensors",
      "slug": "motors-sensors",
      "lessons_count": 10
    }
  ],
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

### 2. Subcourses API

**Endpoints**:
```
GET    /api/content/subcourses/            # List all subcourses (public)
GET    /api/content/subcourses/{slug}/     # Subcourse detail (authenticated)
```

**Authentication**:
- List: Public (AllowAny)
- Detail: Requires authentication + enrollment check

**Filters**:
- `?program={program_id}` - Subcourses của 1 program
- `?coding_language=PYTHON` - Lọc theo ngôn ngữ
- `?status=PUBLISHED`

**Search**: `?search=motor` - Tìm trong title, description

**Response Example** (Detail):
```json
{
  "id": 1,
  "program": {
    "id": 1,
    "title": "Robotics Fundamentals",
    "slug": "robotics-fundamentals"
  },
  "title": "Motors & Sensors",
  "slug": "motors-sensors",
  "description": "Learn to control motors",
  "coding_language": "PYTHON",
  "price": 299000,
  "lessons": [
    {
      "id": 1,
      "title": "Introduction to Motors",
      "slug": "intro-motors",
      "is_locked": false
    }
  ]
}
```

---

### 3. Lessons API

**Endpoints**:
```
GET    /api/content/lessons/               # List all lessons (public)
GET    /api/content/lessons/{slug}/        # Lesson detail (authenticated)
POST   /api/content/lessons/{slug}/mark_complete/  # Mark as completed
```

**Authentication**:
- List: Public
- Detail: Requires authentication + enrollment check
- mark_complete: Requires authentication

**Filters**:
- `?subcourse={subcourse_id}` - Lessons của 1 subcourse
- `?status=PUBLISHED`

**Search**: `?search=motor control` - Tìm trong title, subtitle, content

**Mark Complete**:
```bash
POST /api/content/lessons/intro-motors/mark_complete/
Authorization: Token <your-token>

# Response
{
  "id": 1,
  "user": 1,
  "lesson": 1,
  "is_completed": true,
  "completed_at": "2025-12-11T10:30:00Z"
}
```

---

### 4. User Progress API

**Endpoints**:
```
GET    /api/content/progress/              # User's learning progress
GET    /api/content/progress/{id}/         # Progress detail
```

**Authentication**: Required (only own progress)

**Filters**:
- `?is_completed=true` - Chỉ bài đã hoàn thành
- `?lesson__subcourse__program={program_id}` - Progress theo program

**Ordering**: `?ordering=-created_at` - Mới nhất trước

---

## 🧩 Lesson Content APIs

### 5. Media API

**Endpoints**:
```
GET    /api/content/media/                 # List all media
GET    /api/content/media/{id}/            # Media detail
```

**Filters**:
- `?media_type=IMAGE` - Lọc theo loại (IMAGE, VIDEO, DOCUMENT, CODE)
- `?is_featured=true` - Media nổi bật

**Search**: `?search=robot diagram` - Tìm theo title, description, tags

---

### 6. Lesson Objectives API

**Endpoints**:
```
GET    /api/content/objectives/            # List objectives
GET    /api/content/objectives/{id}/       # Objective detail
```

**Filters**:
- `?lesson={lesson_id}` - Objectives của 1 lesson
- `?objective_type=KNOWLEDGE` - Lọc theo loại (KNOWLEDGE, SKILL, BEHAVIOR, COMPETENCY)

**Response Example**:
```json
{
  "id": 1,
  "lesson": 1,
  "objective_type": "KNOWLEDGE",
  "objective_text": "Hiểu nguyên lý hoạt động của động cơ DC",
  "sort_order": 1
}
```

---

### 7. Lesson Models API

**Endpoints**:
```
GET    /api/content/models/                # List models
GET    /api/content/models/{id}/           # Model detail
```

**Filters**:
- `?lesson={lesson_id}` - Models của 1 lesson

**Response Example**:
```json
{
  "id": 1,
  "lesson": 1,
  "model_name": "Motor Control Robot",
  "description": "Basic robot with 2 motors",
  "media": [
    {
      "id": 1,
      "title": "Robot Diagram",
      "media_type": "IMAGE",
      "file_url": "https://..."
    }
  ],
  "media_count": 3,
  "sort_order": 1
}
```

---

### 8. Preparations API

**Endpoints**:
```
GET    /api/content/preparations/          # List preparations
GET    /api/content/preparations/{id}/     # Preparation detail
```

**Filters**:
- `?lesson={lesson_id}` - Preparations của 1 lesson

**Response Example**:
```json
{
  "id": 1,
  "lesson": 1,
  "item_name": "SPIKE Prime Hub",
  "quantity": 1,
  "description": "Main control unit",
  "notes": "Make sure battery is charged",
  "media": [...],
  "sort_order": 1
}
```

---

### 9. Build Blocks API

**Endpoints**:
```
GET    /api/content/build-blocks/          # List build blocks
GET    /api/content/build-blocks/{id}/     # Build block detail
```

**Filters**:
- `?lesson={lesson_id}` - Build blocks của 1 lesson
- `?block_type=HARDWARE` - Lọc theo loại (HARDWARE, SOFTWARE, COMBINED)

**Response Example**:
```json
{
  "id": 1,
  "lesson": 1,
  "block_type": "HARDWARE",
  "title": "Attach Motor to Hub",
  "description": "Connect motor to port A",
  "code_snippet": null,
  "media": [...],
  "sort_order": 1
}
```

---

### 10. Content Blocks API

**Endpoints**:
```
GET    /api/content/content-blocks/        # List content blocks
GET    /api/content/content-blocks/{id}/   # Content block detail
```

**Filters**:
- `?lesson={lesson_id}` - Content của 1 lesson
- `?block_type=TEXT` - Lọc theo loại (TEXT, IMAGE, VIDEO, CODE, INTERACTIVE)

**Response Example**:
```json
{
  "id": 1,
  "lesson": 1,
  "block_type": "CODE",
  "title": "Motor Control Code",
  "content_text": "This code controls the motor speed",
  "code_snippet": "motor.run_for_rotations(2, 50)",
  "media": [...],
  "sort_order": 1
}
```

---

### 11. Attachments API

**Endpoints**:
```
GET    /api/content/attachments/           # List attachments
GET    /api/content/attachments/{id}/      # Attachment detail
```

**Filters**:
- `?lesson={lesson_id}` - Attachments của 1 lesson
- `?file_type=PDF` - Lọc theo loại (PDF, DOCX, ZIP, CODE, OTHER)

---

### 12. Challenges API

**Endpoints**:
```
GET    /api/content/challenges/            # List challenges
GET    /api/content/challenges/{id}/       # Challenge detail
```

**Filters**:
- `?lesson={lesson_id}` - Challenges của 1 lesson
- `?difficulty_level=MEDIUM` - Lọc theo độ khó (EASY, MEDIUM, HARD, ADVANCED)

**Response Example**:
```json
{
  "id": 1,
  "lesson": 1,
  "challenge_title": "Build a Line Follower",
  "description": "Create a robot that follows a black line",
  "difficulty_level": "MEDIUM",
  "estimated_time": 30,
  "hint": "Use color sensor to detect line",
  "success_criteria": "Robot follows line without stopping",
  "media": [...],
  "sort_order": 1
}
```

---

## 📝 Quiz & Assessment APIs

### 13. Quizzes API

**Endpoints**:
```
GET    /api/content/quizzes/               # List quizzes
GET    /api/content/quizzes/{id}/          # Quiz detail (with questions)
POST   /api/content/quizzes/{id}/submit/   # Submit quiz answers
```

**Filters**:
- `?lesson={lesson_id}` - Quizzes của 1 lesson
- `?quiz_type=KNOWLEDGE_CHECK` - Lọc theo loại

**Quiz Detail Response**:
```json
{
  "id": 1,
  "lesson": 1,
  "quiz_title": "Motors Knowledge Check",
  "quiz_type": "KNOWLEDGE_CHECK",
  "description": "Test your understanding",
  "passing_score": 70,
  "time_limit_minutes": 10,
  "questions": [
    {
      "id": 1,
      "question_text": "What is DC motor?",
      "question_type": "SINGLE_CHOICE",
      "options": [
        {
          "id": 1,
          "option_text": "Direct Current motor",
          "is_correct": true
        },
        {
          "id": 2,
          "option_text": "Digital Circuit motor",
          "is_correct": false
        }
      ],
      "points": 10
    }
  ],
  "questions_count": 5,
  "total_points": 50
}
```

**Submit Quiz**:
```bash
POST /api/content/quizzes/1/submit/
Authorization: Token <your-token>
Content-Type: application/json

{
  "answers": [
    {
      "question_id": 1,
      "selected_option_id": 1
    },
    {
      "question_id": 2,
      "selected_option_id": 4
    }
  ]
}

# Response
{
  "id": 1,
  "user": 1,
  "quiz": 1,
  "score": 80.0,
  "is_passed": true,
  "submitted_at": "2025-12-11T10:30:00Z",
  "answers": [...]
}
```

---

### 14. Quiz Submissions API

**Endpoints**:
```
GET    /api/content/quiz-submissions/      # User's quiz submissions
GET    /api/content/quiz-submissions/{id}/ # Submission detail
```

**Authentication**: Required (only own submissions)

**Filters**:
- `?quiz={quiz_id}` - Submissions cho 1 quiz
- `?is_passed=true` - Chỉ submissions đã pass

**Ordering**: `?ordering=-submitted_at` - Mới nhất trước

---

## 🎨 Composite API

### 15. Lesson Details API (RECOMMENDED)

**Endpoint**: 
```
GET    /api/content/lesson-details/{slug}/
```

**Description**: Lấy TẤT CẢ nội dung của 1 lesson trong 1 request duy nhất (thay vì gọi nhiều endpoints).

**Authentication**: Required

**Response Example** (Full Lesson):
```json
{
  "id": 1,
  "subcourse": {
    "id": 1,
    "title": "Motors & Sensors"
  },
  "title": "Introduction to Motors",
  "slug": "intro-motors",
  "subtitle": "Learn DC motor basics",
  "objective": "Understand motor principles",
  "
_text": "Motors convert electrical energy...",
  "code_example": "motor.run(50)",
  "estimated_duration": 45,
  
  "objectives": [
    {
      "objective_type": "KNOWLEDGE",
      "objective_text": "Hiểu nguyên lý motor",
      "sort_order": 1
    }
  ],
  "objectives_count": 4,
  
  "models": [
    {
      "model_name": "Basic Motor Robot",
      "description": "...",
      "media": [...]
    }
  ],
  "models_count": 2,
  
  "preparations": [...],
  "preparations_count": 5,
  
  "build_blocks": [...],
  "build_blocks_count": 8,
  
  "content_blocks": [...],
  "content_blocks_count": 12,
  
  "attachments": [...],
  "attachments_count": 3,
  
  "challenges": [...],
  "challenges_count": 2,
  
  "quizzes": [
    {
      "quiz_title": "Motors Quiz",
      "questions": [...]
    }
  ],
  "quizzes_count": 1
}
```

**Performance**: 
- Tối ưu hóa với `prefetch_related` để tránh N+1 queries
- 1 request duy nhất thay vì 8-10 requests riêng lẻ
- Recommended cho lesson detail pages

---

## 🔍 Common Query Parameters

### Filtering
```
?field_name=value
?field_name__gt=100           # Greater than
?field_name__lt=100           # Less than
?field_name__contains=text    # Contains (case-insensitive)
```

### Search
```
?search=keyword
```

### Ordering
```
?ordering=field_name          # Ascending
?ordering=-field_name         # Descending
?ordering=field1,-field2      # Multiple fields
```

### Pagination
```
?page=2
?page_size=20
```

---

## 🔐 Authentication Examples

### Session Authentication (Browser)
```javascript
// Login first via /api/auth/login/
fetch('/api/content/lessons/intro-motors/', {
  credentials: 'include'  // Send session cookie
})
```

### Token Authentication (Mobile/SPA)
```javascript
fetch('/api/content/lessons/intro-motors/', {
  headers: {
    'Authorization': 'Token your-token-here'
  }
})
```

---

## ⚡ Performance Tips

1. **Use Composite Endpoint**: `/api/content/lesson-details/{slug}/` thay vì gọi nhiều endpoints
2. **Pagination**: Sử dụng `page_size` nhỏ (10-20) để tăng tốc độ
3. **Filtering**: Lọc ở server-side thay vì client-side
4. **Caching**: Cache responses cho static content (programs, subcourses)

---

## 📊 API Summary Table

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/programs/` | GET | Public | List programs |
| `/programs/{slug}/` | GET | Public | Program detail |
| `/subcourses/` | GET | Public | List subcourses |
| `/subcourses/{slug}/` | GET | Required | Subcourse detail |
| `/lessons/` | GET | Public | List lessons |
| `/lessons/{slug}/` | GET | Required | Lesson detail |
| `/lessons/{slug}/mark_complete/` | POST | Required | Mark completed |
| `/progress/` | GET | Required | User progress |
| `/media/` | GET | Public | Media library |
| `/objectives/` | GET | Public | Lesson objectives |
| `/models/` | GET | Public | Lesson models |
| `/preparations/` | GET | Public | Preparations |
| `/build-blocks/` | GET | Public | Build blocks |
| `/content-blocks/` | GET | Public | Content blocks |
| `/attachments/` | GET | Public | Attachments |
| `/challenges/` | GET | Public | Challenges |
| `/quizzes/` | GET | Public | Quizzes list |
| `/quizzes/{id}/` | GET | Public | Quiz detail |
| `/quizzes/{id}/submit/` | POST | Required | Submit quiz |
| `/quiz-submissions/` | GET | Required | User submissions |
| `/lesson-details/{slug}/` | GET | Required | **Full lesson** |

---

## 🚀 Next Steps

1. **Test API**: Sử dụng Postman hoặc curl để test endpoints
2. **Frontend Integration**: Consume API từ Next.js
3. **Error Handling**: Xử lý 401, 403, 404 errors
4. **Loading States**: Hiển thị skeleton/loading khi fetch data

