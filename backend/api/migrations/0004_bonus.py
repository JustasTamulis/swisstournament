# Generated by Django 5.1.6 on 2025-03-09 20:08

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0003_remove_bet_odd1_remove_bet_odd2_odds_bet_odds"),
    ]

    operations = [
        migrations.CreateModel(
            name="Bonus",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("finished", models.BooleanField(default=False)),
                ("description", models.CharField(max_length=255)),
                ("created", models.DateTimeField(auto_now_add=True)),
                ("modified", models.DateTimeField(auto_now=True)),
                (
                    "round",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="bonuses",
                        to="api.round",
                    ),
                ),
                (
                    "team",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="bonuses",
                        to="api.team",
                    ),
                ),
            ],
        ),
    ]
