# 🧪 TESTING API GUIDE - Quick Start

## ✅ Setup Complete!

Django Server: http://127.0.0.1:8000  
Status: ✅ Running

---

## 🚀 BƯỚC 1: Tạo User Test trong Admin

1. **Truy cập Admin Panel:**
   ```
   http://127.0.0.1:8000/admin/
   ```

2. **Login với superuser** (đã tạo trước đó)

3. **Tạo Student Account:**
   - Vào **Users** → **Add User**
   - Username: `student01`
   - Password: `test123456` (nhập 2 lần)
   - Click **Save and continue editing**
   
4. **Cập nhật Profile:**
   - Scroll xuống **USER PROFILE**
   - Role: **STUDENT**
   - Phone: `0912345678`
   - Date of birth: `2010-05-15`
   - Click **SAVE**

---

## 📚 BƯỚC 2: Tạo Sample Data

### 2.1. Tạo Program
- Vào **Content** → **Programs** → **Add Program**
- Title: `Lập trình LEGO SPIKE Essential Cơ Bản`
- Description: `Khóa học dành cho học sinh lớp 1-3`
- Kit Type: **SPIKE_ESSENTIAL**
- Status: **PUBLISHED** ⚠️ (Quan trọng!)
- Sort Order: `1`
- Click **SAVE**

### 2.2. Thêm Subcourses (Inline)
Khi đang ở màn hình edit Program, scroll xuống **SUBCOURSES**, thêm:

**Subcourse 1:**
- Title: `Làm quen với SPIKE Essential`
- Coding Language: **WORD_BLOCKS**
- Price: `500000`
- Sort Order: `1`

**Subcourse 2:**
- Title: `Lập trình di chuyển`
- Coding Language: **WORD_BLOCKS**
- Price: `500000`
- Sort Order: `2`

Click **SAVE**

### 2.3. Thêm Lessons (cho mỗi Subcourse)
- Vào **Content** → **Lessons** → **Add Lesson**
  
**Lesson 1 (cho Subcourse 1):**
- Subcourse: `Làm quen với SPIKE Essential`
- Title: `Giới thiệu về SPIKE Essential`
- Description: `Học sinh làm quen với bộ kit LEGO SPIKE Essential`
- Video URL: `https://www.youtube.com/watch?v=example1`
- Estimated Duration: `30` (phút)
- Sort Order: `1`
- Click **SAVE AND ADD ANOTHER**

**Lesson 2:**
- Subcourse: `Làm quen với SPIKE Essential`
- Title: `Lắp ráp mô hình đầu tiên`
- Description: `Xây dựng mô hình xe đơn giản`
- Video URL: `https://www.youtube.com/watch?v=example2`
- Estimated Duration: `45`
- Sort Order: `2`
- Click **SAVE**

---

## 🔐 BƯỚC 3: Phân Quyền cho Student

1. **Vào User Auth → Auth Assignments → Add Auth Assignment**
   
   - User: `student01`
   - Program: `Lập trình LEGO SPIKE Essential Cơ Bản`
   - Subcourse: (để trống = có quyền cả Program)
   - Status: **ACTIVE** ⚠️
   - Valid From: `2025-01-01`
   - Valid Until: `2025-12-31`
   - Assigned By: (chọn superuser của bạn)
   
2. Click **SAVE**

---

## 🧪 BƯỚC 4: Test API Endpoints

### 4.1. Login vào Browsable API
```
http://127.0.0.1:8000/api-auth/slogin/
```
- Username: `student01`
- Password: `test123456`

### 4.2. Test Content API

#### 📖 List Programs
```
http://127.0.0.1:8000/api/content/programs/
```
**Expected:** Danh sách programs (rút gọn - không có nested)

#### 📖 Program Detail
```
http://127.0.0.1:8000/api/content/programs/1/
```
**Expected:** Full program + nested subcourses + lessons

#### 📖 List Subcourses
```
http://127.0.0.1:8000/api/content/subcourses/
```

#### 📖 Filter Subcourses by Program
```
http://127.0.0.1:8000/api/content/subcourses/?program=1
```

#### 📖 List Lessons
```
http://127.0.0.1:8000/api/content/lessons/
```

#### 📖 Filter Lessons by Subcourse
```
http://127.0.0.1:8000/api/content/lessons/?subcourse=1
```

#### 📖 Search Programs
```
http://127.0.0.1:8000/api/content/programs/?search=spike
```

### 4.3. Test Auth API

#### 👤 My Profile
```
http://127.0.0.1:8000/api/auth/profile/me/
```
**Expected:**
```json
{
  "id": 1,
  "user": 2,
  "role": "STUDENT",
  "phone": "0912345678",
  "date_of_birth": "2010-05-15"
}
```

#### 🔑 My Assignments
```
http://127.0.0.1:8000/api/auth/assignments/
```
**Expected:** List các quyền của student01

#### 🔑 My Programs
```
http://127.0.0.1:8000/api/auth/assignments/my_programs/
```
**Expected:**
```json
{
  "program_ids": [1],
  "total_programs": 1
}
```

#### 🔑 My Subcourses
```
http://127.0.0.1:8000/api/auth/assignments/my_subcourses/
```
**Expected:**
```json
{
  "subcourse_ids": [1, 2],
  "total_subcourses": 2
}
```

#### 👤 Full User Info
```
http://127.0.0.1:8000/api/auth/me/info/
```
**Expected:** User + Profile + Assignments (full)

### 4.4. Test Mark Lesson Complete

**POST Request:**
```
http://127.0.0.1:8000/api/content/lessons/1/mark_complete/
```

**Method:** Click **POST** button trong Browsable API

**Expected Response:**
```json
{
  "status": "completed",
  "lesson": "Giới thiệu về SPIKE Essential",
  "progress_id": 1
}
```

**Verify:** Kiểm tra progress
```
http://127.0.0.1:8000/api/content/progress/
```

---

## 🧪 Test Scenarios

### ✅ Scenario 1: Student chỉ thấy PUBLISHED content
1. Login as `student01`
2. GET `/api/content/programs/`
3. **Expected:** Chỉ thấy programs có status='PUBLISHED'
4. Thử tạo 1 Program khác với status='DRAFT'
5. Refresh API → Không thấy program DRAFT

### ✅ Scenario 2: Student chỉ thấy Assignments của mình
1. Login as `student01`
2. GET `/api/auth/assignments/`
3. **Expected:** Chỉ thấy assignments của student01
4. Tạo thêm user `student02` và gán assignment khác
5. Login lại as `student01` → Không thấy assignments của student02

### ✅ Scenario 3: Chỉ thấy ACTIVE assignments
1. Vào Admin, tìm assignment của student01
2. Đổi Status thành **REVOKED**
3. Refresh `/api/auth/assignments/` → Không còn thấy assignment này

### ✅ Scenario 4: Mark Complete Workflow
1. GET `/api/content/lessons/1/` → Xem lesson detail
2. POST `/api/content/lessons/1/mark_complete/` → Đánh dấu hoàn thành
3. GET `/api/content/progress/` → Thấy progress record mới
4. POST lại lần nữa → Vẫn OK (idempotent)

---

## 🎯 Expected Results Summary

### Content API
- ✅ Chỉ thấy status='PUBLISHED'
- ✅ List endpoint: Rút gọn (không nested)
- ✅ Detail endpoint: Full nested data
- ✅ Filter, search, ordering hoạt động
- ✅ Optimization: Ít queries (prefetch_related)

### Auth API
- ✅ Chỉ thấy data của user hiện tại
- ✅ Chỉ thấy status='ACTIVE' assignments
- ✅ my_programs, my_subcourses trả về đúng IDs
- ✅ Profile API trả về role, phone, DOB

### Performance
- ✅ Program detail: 3-4 queries (nhờ prefetch_related)
- ✅ Không có N+1 query problem
- ✅ Response time < 100ms (local)

---

## 🐛 Troubleshooting

### Lỗi: "Authentication credentials were not provided"
**Solution:** Login tại `/api-auth/login/`

### Lỗi: "Not found" khi GET detail endpoint
**Solution:** Kiểm tra ID có tồn tại không, status có phải PUBLISHED không

### Không thấy nested data trong List API
**Solution:** Đúng rồi! List chỉ trả về rút gọn. Dùng Detail API để lấy nested.

### Assignment không hiện lên
**Solution:** 
1. Kiểm tra status có phải ACTIVE không
2. Kiểm tra đã login đúng user chưa
3. Kiểm tra valid_from, valid_until (phải hợp lệ)

---

## 📝 Next Testing Phase

- [ ] Test với Postman/Thunder Client
- [ ] Test Pagination
- [ ] Test Ordering (sort_order, created_at, -created_at)
- [ ] Test Edge Cases (empty results, invalid IDs)
- [ ] Test Performance (với 100+ records)
- [ ] Integration Test với Frontend

---

**Testing Started:** ✅  
**Server Running:** http://127.0.0.1:8000  
**Docs:** See `API_ENDPOINTS.md` for full reference
