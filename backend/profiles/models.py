from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    class Gender(models.TextChoices):
        FEMALE = "female", "Female"
        MALE = "male", "Male"

    class RelationshipType(models.TextChoices):
        FRIENDSHIP = "friendship", "Friendship"
        RELATIONSHIP = "relationship", "Relationship"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    gender = models.CharField(
        max_length=20,
        choices=Gender.choices,
    )

    date_of_birth = models.DateField()

    location = models.CharField(
        max_length=150,
    )

    phone_number = models.CharField(
        max_length=30,
        unique=True,
    )

    relationship_type = models.CharField(
        max_length=20,
        choices=RelationshipType.choices,
        blank=True,
    )

    preferred_gender = models.CharField(
        max_length=20,
        choices=Gender.choices,
        blank=True,
    )

    preferred_min_age = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
    )

    preferred_max_age = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
    )

    max_distance = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Maximum preferred distance in kilometres.",
    )

    preferences_completed = models.BooleanField(
        default=False,
    )

    payment_completed = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"Profile for {self.user.email}"