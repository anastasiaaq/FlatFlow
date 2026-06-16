from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .viewset import IssueViewSet


router = DefaultRouter()
router.register("issues", IssueViewSet, basename="issue")

urlpatterns = [
    path("", include(router.urls)),
]
