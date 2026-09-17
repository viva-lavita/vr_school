from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("lessons", "0019_lessonchildassignment_recommend"),
    ]

    operations = [
        migrations.AddField(
            model_name="lesson",
            name="is_video_360",
            field=models.BooleanField(
                default=False,
                help_text=(
                    "Включите для прямой ссылки на equirectangular MP4/WebM. "
                    "YouTube 360 определяется самим YouTube."
                ),
                verbose_name="Видео в формате 360°",
            ),
        ),
    ]
