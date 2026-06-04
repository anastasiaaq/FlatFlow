from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .viewset import HouseholdViewSet


router = DefaultRouter()
router.register("households", HouseholdViewSet, basename="household")

urlpatterns = [
    path("", include(router.urls)),
]
