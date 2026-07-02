from django.contrib import admin
from django.urls import path
from django.http import JsonResponse


def api_test(request):
    return JsonResponse({
        "message": "Django backend connected to Next.js frontend"
    })


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/test/", api_test, name="api_test"),
]