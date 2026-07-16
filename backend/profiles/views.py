from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from profiles.models import UserProfile


class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            return Response(
                {
                    "detail": "A profile was not found for this user."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        today = timezone.localdate()

        age = (
            today.year
            - profile.date_of_birth.year
            - (
                (today.month, today.day)
                < (
                    profile.date_of_birth.month,
                    profile.date_of_birth.day,
                )
            )
        )

        return Response(
            {
                "user": {
                    "id": request.user.id,
                    "email": request.user.email,
                    "first_name": request.user.first_name,
                    "last_name": request.user.last_name,
                    "full_name": (
                        f"{request.user.first_name} "
                        f"{request.user.last_name}"
                    ).strip(),
                },
                "profile": {
                    "gender": profile.gender,
                    "date_of_birth": profile.date_of_birth,
                    "age": age,
                    "location": profile.location,
                    "phone_number": profile.phone_number,
                    "relationship_type": profile.relationship_type,
                    "preferred_gender": profile.preferred_gender,
                    "preferred_min_age": profile.preferred_min_age,
                    "preferred_max_age": profile.preferred_max_age,
                    "max_distance": profile.max_distance,
                    "preferences_completed": (
                        profile.preferences_completed
                    ),
                    "payment_completed": (
                        profile.payment_completed
                    ),
                    "created_at": profile.created_at,
                    "updated_at": profile.updated_at,
                },
            },
            status=status.HTTP_200_OK,
        )


class UpdatePreferencesView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            return Response(
                {
                    "detail": "A profile was not found for this user."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        relationship_type = request.data.get(
            "relationship_type"
        )

        preferred_gender = request.data.get(
            "preferred_gender"
        )

        preferred_min_age = request.data.get(
            "preferred_min_age"
        )

        preferred_max_age = request.data.get(
            "preferred_max_age"
        )

        max_distance = request.data.get(
            "max_distance"
        )

        valid_relationship_types = {
            choice[0]
            for choice in UserProfile.RelationshipType.choices
        }

        valid_genders = {
            choice[0]
            for choice in UserProfile.Gender.choices
        }

        if relationship_type not in valid_relationship_types:
            return Response(
                {
                    "relationship_type": [
                        "Select a valid connection type."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if preferred_gender not in valid_genders:
            return Response(
                {
                    "preferred_gender": [
                        "Select a valid preferred gender."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            preferred_min_age = (
                int(preferred_min_age)
                if preferred_min_age not in [None, ""]
                else None
            )

            preferred_max_age = (
                int(preferred_max_age)
                if preferred_max_age not in [None, ""]
                else None
            )

            max_distance = (
                int(max_distance)
                if max_distance not in [None, ""]
                else None
            )
        except (TypeError, ValueError):
            return Response(
                {
                    "detail": (
                        "Age and distance values must be whole numbers."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            preferred_min_age is not None
            and not 18 <= preferred_min_age <= 100
        ):
            return Response(
                {
                    "preferred_min_age": [
                        "Minimum age must be between 18 and 100."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            preferred_max_age is not None
            and not 18 <= preferred_max_age <= 100
        ):
            return Response(
                {
                    "preferred_max_age": [
                        "Maximum age must be between 18 and 100."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            preferred_min_age is not None
            and preferred_max_age is not None
            and preferred_min_age > preferred_max_age
        ):
            return Response(
                {
                    "detail": (
                        "Minimum age cannot be greater than maximum age."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            max_distance is not None
            and not 1 <= max_distance <= 500
        ):
            return Response(
                {
                    "max_distance": [
                        "Maximum distance must be between 1 and 500."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile.relationship_type = relationship_type
        profile.preferred_gender = preferred_gender
        profile.preferred_min_age = preferred_min_age
        profile.preferred_max_age = preferred_max_age
        profile.max_distance = max_distance
        profile.preferences_completed = True

        profile.save(
            update_fields=[
                "relationship_type",
                "preferred_gender",
                "preferred_min_age",
                "preferred_max_age",
                "max_distance",
                "preferences_completed",
                "updated_at",
            ]
        )

        return Response(
            {
                "message": "Preferences saved successfully.",
                "preferences_completed": True,
                "profile": {
                    "relationship_type": (
                        profile.relationship_type
                    ),
                    "preferred_gender": (
                        profile.preferred_gender
                    ),
                    "preferred_min_age": (
                        profile.preferred_min_age
                    ),
                    "preferred_max_age": (
                        profile.preferred_max_age
                    ),
                    "max_distance": profile.max_distance,
                },
            },
            status=status.HTTP_200_OK,
        )