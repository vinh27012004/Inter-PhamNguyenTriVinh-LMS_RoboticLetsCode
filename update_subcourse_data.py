"""
Script để cập nhật dữ liệu Subcourse sau khi thay đổi schema
Chạy: python manage.py shell < update_subcourse_data.py
"""

from content.models import Subcourse

# Cập nhật tất cả subcourses với giá trị mặc định
subcourses = Subcourse.objects.all()
updated_count = 0

for subcourse in subcourses:
    # Nếu chưa có giá trị, set giá trị mặc định
    if not hasattr(subcourse, 'level') or not subcourse.level:
        subcourse.level = 'BEGINNER'
    if not hasattr(subcourse, 'level_number') or not subcourse.level_number:
        subcourse.level_number = 1
    if not hasattr(subcourse, 'session_count') or not subcourse.session_count:
        subcourse.session_count = 20
    
    subcourse.save()
    updated_count += 1
    print(f"✓ Updated: {subcourse.title}")

print(f"\n✅ Successfully updated {updated_count} subcourses!")
