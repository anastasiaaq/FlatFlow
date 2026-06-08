from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chores", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="chore",
            name="description",
            field=models.TextField(blank=True, max_length=500),
        ),
    ]
