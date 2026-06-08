from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .viewset import RuleViewSet


router = DefaultRouter()
router.register("rules", RuleViewSet, basename="rule")

urlpatterns = [
    path("", include(router.urls)),
]
