from django.urls import path, include
from .views import LoginView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, OrderViewSet, UserViewSet
from .views import InvitationViewSet, accept_invitation

router = DefaultRouter()
router.register('products', ProductViewSet)
router.register('orders', OrderViewSet)
router.register('invitations', InvitationViewSet)
router.register('users', UserViewSet)  


urlpatterns = [
    path('auth/login/', LoginView.as_view(), name="login"),
    path('auth/refresh/', TokenRefreshView.as_view(), name="token_refresh"),
    path('', include(router.urls)),
    path('invitations/accept/', accept_invitation, name='accept_invitation'),

]
