from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def api_test(request):
    return JsonResponse(
        {
            "message": (
                "Django backend connected to Next.js frontend"
            )
        }
    )


urlpatterns = [
    path(
        "admin/",
        admin.site.urls,
    ),

    path(
        "api/test/",
        api_test,
        name="api_test",
    ),

    path(
        "api/v1/auth/",
        include("accounts.urls"),
    ),

    path(
        "api/v1/profiles/",
        include("profiles.urls"),
    ),
]