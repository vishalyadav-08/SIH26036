from django.db import migrations, models


def officer_to_lmo(apps, schema_editor):
    User = apps.get_model("authentication", "User")
    User.objects.filter(role="OFFICER").update(role="LMO")


def lmo_to_officer(apps, schema_editor):
    User = apps.get_model("authentication", "User")
    User.objects.filter(role="LMO").update(role="OFFICER")


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0003_user_business"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="role",
            field=models.CharField(
                choices=[
                    ("ADMIN", "Administrator"),
                    ("LMO", "Legal Metrology Officer"),
                    ("GATC", "Government Approved Test Centre"),
                    ("BUSINESS", "Business / Instrument Owner"),
                ],
                max_length=10,
            ),
        ),
        migrations.RunPython(officer_to_lmo, lmo_to_officer),
    ]
