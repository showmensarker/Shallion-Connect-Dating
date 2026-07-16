from django.urls import path

from profiles.views import (
    MyProfileView,
    UpdatePreferencesView,
)


urlpatterns = [
    path(
        "me/",
        MyProfileView.as_view(),
        name="my-profile",
    ),

    path(
        "preferences/",
        UpdatePreferencesView.as_view(),
        name="update-preferences",
    ),
]