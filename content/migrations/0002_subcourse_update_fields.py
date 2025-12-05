# Generated migration file

from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0001_initial'),
    ]

    operations = [
        # Thêm các trường mới cho Subcourse
        migrations.AddField(
            model_name='subcourse',
            name='level',
            field=models.CharField(
                max_length=20,
                choices=[
                    ('BEGINNER', 'Sơ cấp'),
                    ('INTERMEDIATE', 'Trung cấp'),
                    ('ADVANCED', 'Nâng cao'),
                ],
                default='BEGINNER',
                verbose_name='Cấp độ',
                help_text='Sơ cấp, Trung cấp, hoặc Nâng cao'
            ),
        ),
        migrations.AddField(
            model_name='subcourse',
            name='level_number',
            field=models.IntegerField(
                default=1,
                validators=[
                    django.core.validators.MinValueValidator(1),
                    django.core.validators.MaxValueValidator(10)
                ],
                verbose_name='Level',
                help_text='Level 1, Level 2, Level 3, ...'
            ),
        ),
        migrations.AddField(
            model_name='subcourse',
            name='session_count',
            field=models.IntegerField(
                default=20,
                validators=[django.core.validators.MinValueValidator(1)],
                verbose_name='Số lượng buổi học',
                help_text='Tổng số buổi học trong khóa học này'
            ),
        ),
        # Xóa trường price cũ
        migrations.RemoveField(
            model_name='subcourse',
            name='price',
        ),
    ]
