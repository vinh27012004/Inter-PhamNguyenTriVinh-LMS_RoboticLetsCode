"""
ADMIN PANEL DEMO - Hướng dẫn sử dụng giao diện
"""

# ============================================================================
# DEMO 1: Tạo Chương trình học mới (Program)
# ============================================================================

# Bước 1: Vào Admin Panel
# URL: http://127.0.0.1:8000/admin/
# Login với superuser đã tạo

# Bước 2: Click "Programs" -> "Add Program"
# Điền thông tin:
PROGRAM_EXAMPLE = {
    'title': 'SPIKE Prime - Lập trình Python Nâng cao',
    'slug': 'spike-prime-python-nang-cao',  # Auto-fill khi gõ title
    'description': 'Khóa học lập trình Python chuyên sâu với LEGO SPIKE Prime',
    'kit_type': 'SPIKE_PRIME',
    'thumbnail_url': 'https://example.com/images/spike-prime.jpg',
    'status': 'PUBLISHED',
    'sort_order': 1,
}

# Bước 3: Scroll xuống section "Khóa học con trong chương trình"
# Thêm Subcourse trực tiếp trong form (Inline):
SUBCOURSE_INLINE_EXAMPLE = [
    {
        'title': 'Module 1: Python Cơ bản',
        'slug': 'module-1-python-co-ban',
        'coding_language': 'PYTHON',
        'status': 'PUBLISHED',
        'sort_order': 1,
        'price': 0,  # Miễn phí
    },
    {
        'title': 'Module 2: Điều khiển Motor',
        'slug': 'module-2-dieu-khien-motor',
        'coding_language': 'PYTHON',
        'status': 'PUBLISHED',
        'sort_order': 2,
        'price': 500000,  # 500k VNĐ
    },
]

# Bước 4: Click "Save" -> Xong! Vừa tạo 1 Program + 2 Subcourses cùng lúc


# ============================================================================
# DEMO 2: Thêm Bài học vào Khóa con (Lesson)
# ============================================================================

# Bước 1: Click vào Subcourse vừa tạo (hoặc vào Subcourses list)
# Bước 2: Chọn "Module 1: Python Cơ bản" để edit

# Bước 3: Scroll xuống section "Bài học trong khóa con"
# Thêm Lesson trực tiếp (Inline):
LESSON_INLINE_EXAMPLE = [
    {
        'title': 'Bài 1: In chữ "Hello World"',
        'slug': 'bai-1-hello-world',
        'status': 'PUBLISHED',
        'sort_order': 1,
        'estimated_duration': 30,  # 30 phút
    },
    {
        'title': 'Bài 2: Biến và Kiểu dữ liệu',
        'slug': 'bai-2-bien-va-kieu-du-lieu',
        'status': 'PUBLISHED',
        'sort_order': 2,
        'estimated_duration': 45,
    },
]

# Bước 4: Click "Save"


# ============================================================================
# DEMO 3: Chỉnh sửa chi tiết Bài học
# ============================================================================

# Bước 1: Vào Lessons -> Chọn "Bài 1: Hello World"
# Bước 2: Điền đầy đủ thông tin:

LESSON_DETAIL_EXAMPLE = {
    # Thông tin cơ bản
    'subcourse': 'Module 1: Python Cơ bản',
    'title': 'Bài 1: In chữ "Hello World"',
    'slug': 'bai-1-hello-world',
    'subtitle': 'Bài học đầu tiên về Python',
    'estimated_duration': 30,
    
    # Mục tiêu & Nội dung
    'objective': '''
    Sau bài học này, học viên sẽ:
    - Hiểu được cú pháp in chữ trong Python
    - Viết được chương trình đầu tiên
    - Chạy code trên SPIKE Prime
    ''',
    
    'knowledge_skills': '''
    - Lệnh print() trong Python
    - Chuỗi ký tự (String)
    - Chạy code trên Hub
    ''',
    
    'content_text': '''
    <h2>Giới thiệu</h2>
    <p>Hôm nay chúng ta sẽ học cách in chữ "Hello World" bằng Python!</p>
    
    <h2>Các bước thực hiện</h2>
    <ol>
      <li>Mở SPIKE Prime App</li>
      <li>Tạo project mới</li>
      <li>Viết code...</li>
    </ol>
    ''',
    
    # Media & Tài liệu
    'video_url': 'https://storage.googleapis.com/letcode/videos/lesson-01.mp4',
    'project_file_url': 'https://storage.googleapis.com/letcode/projects/hello-world.llsp',
    
    'code_snippet': '''
# Code mẫu
from spike import PrimeHub

hub = PrimeHub()
hub.light_matrix.write("Hello")
print("Hello World!")
    ''',
    
    # Hiển thị
    'status': 'PUBLISHED',
    'sort_order': 1,
}


# ============================================================================
# DEMO 4: Phân quyền cho User (AuthAssignment)
# ============================================================================

# Bước 1: Vào "Users" -> Chọn một student
# Bước 2: Scroll xuống section "Phân quyền truy cập"
# Thêm AuthAssignment (Inline):

AUTH_ASSIGNMENT_INLINE_EXAMPLE = {
    'program': None,  # Để trống nếu gán quyền cho Subcourse
    'subcourse': 'Module 1: Python Cơ bản',  # Gán quyền học Module 1
    'status': 'ACTIVE',
    'valid_from': '2024-01-01',
    'valid_until': '2024-12-31',  # Hết hạn cuối năm
    'access_code': 'STUDENT2024',
}

# HOẶC: Gán quyền toàn bộ Program
AUTH_ASSIGNMENT_PROGRAM_EXAMPLE = {
    'program': 'SPIKE Prime - Lập trình Python Nâng cao',  # Toàn chương trình
    'subcourse': None,  # Để trống
    'status': 'ACTIVE',
    'valid_from': '2024-01-01',
    'valid_until': None,  # Không giới hạn thời gian
}


# ============================================================================
# DEMO 5: Sử dụng Admin Actions (Batch Operations)
# ============================================================================

# Ví dụ: Thu hồi nhiều phân quyền cùng lúc

# Bước 1: Vào "Auth assignments"
# Bước 2: Tick chọn nhiều phân quyền (checkbox)
# Bước 3: Chọn Action: "Thu hồi các phân quyền đã chọn"
# Bước 4: Click "Go" -> Xong! Tất cả chuyển sang status='REVOKED'

# Các Actions có sẵn:
ADMIN_ACTIONS = [
    'activate_assignments',     # Kích hoạt hàng loạt
    'revoke_assignments',       # Thu hồi hàng loạt
    'check_expired',            # Tự động update phân quyền hết hạn
]


# ============================================================================
# DEMO 6: Tìm kiếm & Lọc thông minh
# ============================================================================

# Ví dụ 1: Tìm tất cả bài học của một Program
# - Vào Lessons
# - Filter by: "Subcourse's Program" = "SPIKE Prime"
# - Kết quả: Tất cả lessons thuộc SPIKE Prime

# Ví dụ 2: Tìm học viên chưa hoàn thành bài học
# - Vào User progress
# - Filter by: "Is completed" = "No"
# - Kết quả: Danh sách học viên đang học

# Ví dụ 3: Tìm phân quyền hết hạn
# - Vào Auth assignments
# - Filter by: "Status" = "EXPIRED"
# - Action: "Kiểm tra phân quyền hết hạn" -> Auto update


# ============================================================================
# DEMO 7: Xem thống kê nhanh
# ============================================================================

# Trong Program list view, mỗi Program hiển thị:
# - Badge màu: 🟢 Published / 🟠 Draft / ⚫ Archived
# - Link "5 khóa con" -> Click vào sẽ filter Subcourses của Program đó
# - Ngày tạo, Sort order (có thể edit trực tiếp)

# Trong Subcourse list view:
# - Giá: "Miễn phí" (màu xanh) hoặc "500,000 VNĐ"
# - Link "10 bài học" -> Click vào sẽ filter Lessons của Subcourse đó

# Trong Lesson list view:
# - Icon: ✅ (có video) / ❌ (không có video)
# - Icon: ✅ (có file) / ❌ (không có file)
# - Thời lượng ước tính


# ============================================================================
# DEMO 8: Quick Navigation (Smart Links)
# ============================================================================

# Từ Program → Subcourse:
# - Click vào "5 khóa con" trong Program list
# - Tự động filter hiển thị 5 subcourses của Program đó

# Từ Subcourse → Lesson:
# - Click vào "10 bài học" trong Subcourse list
# - Tự động filter hiển thị 10 lessons của Subcourse đó

# Từ AuthAssignment → Content:
# - Click vào icon "📚 Program Name"
# - Tự động mở trang edit Program đó


# ============================================================================
# TIPS & TRICKS
# ============================================================================

# 1. Auto-fill Slug:
#    - Khi gõ Title, Slug sẽ tự động điền (prepopulated_fields)
#    - Có thể edit lại slug nếu muốn

# 2. Inline Editing:
#    - Không cần mở trang mới để thêm Subcourse/Lesson
#    - Thêm trực tiếp trong form của parent

# 3. List Editable:
#    - Sort order có thể edit trực tiếp trong list view
#    - Không cần click vào từng item

# 4. Collapse Fieldsets:
#    - Các section "Media & Hiển thị" có thể thu gọn
#    - Giúp form gọn gàng hơn

# 5. Date Hierarchy:
#    - Trong UserProgress và AuthAssignment có date filter
#    - Lọc theo năm > tháng > ngày

# 6. Bulk Actions:
#    - Chọn nhiều items và thực hiện action hàng loạt
#    - Tiết kiệm thời gian

# 7. Search:
#    - Search đa điều kiện (title, description, v.v.)
#    - Tìm kiếm đa cấp (Program > Subcourse > Lesson)


print("✅ Admin Panel đã sẵn sàng sử dụng!")
print("📚 Đọc README_ADMIN.md để biết thêm chi tiết")
print("🚀 Chúc bạn quản trị hiệu quả!")
