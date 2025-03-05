
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('boards', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='element',
            name='path',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='element',
            name='element_type',
            field=models.CharField(choices=[('text', 'Tekst'), ('image', 'Obraz'), ('shape', 'Kształt'), ('sticky', 'Notatka'), ('line', 'Linia'), ('path', 'Rysunek odręczny')], max_length=20),
        ),
    ]