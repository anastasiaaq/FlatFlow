from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .viewset import ChoreViewSet


router = DefaultRouter()
router.register("chores", ChoreViewSet, basename="chore")

urlpatterns = [
    path("", include(router.urls)),
]
