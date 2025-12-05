# Generated migration

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0002_subcourse_update_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='subcourse',
            name='objective',
            field=models.TextField(blank=True, help_text='Mục tiêu học tập - những gì học viên sẽ đạt được', verbose_name='Mục tiêu'),
        ),
    ]
