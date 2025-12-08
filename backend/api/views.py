from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import Invitation, User
from .serializers import InvitationSerializer
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer
from .permissions import RBACPermission  
from rest_framework.permissions import BasePermission



class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            }
        })


from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Product, Order
from .serializers import ProductSerializer, OrderSerializer
from .permissions import RBACPermission

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, RBACPermission]

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, RBACPermission]




class InvitationViewSet(viewsets.ModelViewSet):
    queryset = Invitation.objects.all()
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin','manager']:
            return Invitation.objects.filter(created_by=user)
        return Invitation.objects.none()

    def perform_create(self, serializer):
        invitation = serializer.save(created_by=self.request.user)
        link = f"http://localhost:3000/accept?token={invitation.token}"
        send_mail(
            subject="You are invited",
            message=f"Click this link to accept invitation: {link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[invitation.email],
        )

    @action(detail=True, methods=['post'])
    def resend(self, request, pk=None):
        inv = self.get_object()
        if inv.used:
            return Response({'detail':'already used'}, status=400)
        inv.expires_at = timezone.now() + timezone.timedelta(hours=72)
        inv.save()
        link = f"http://localhost:3000/accept?token={inv.token}"
        send_mail(
            subject="Invitation resend",
            message=f"Click this link to accept invitation: {link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[inv.email],
        )
        return Response({'detail':'resent'})

    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        inv = self.get_object()
        inv.used = True
        inv.save()
        return Response({'detail':'revoked'})

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status

@api_view(['POST'])
@permission_classes([AllowAny])
def accept_invitation(request):
    token = request.data.get('token')
    username = request.data.get('username')
    password = request.data.get('password')

    try:
        inv = Invitation.objects.get(token=token)
    except Invitation.DoesNotExist:
        return Response({'detail':'invalid token'}, status=400)

    if inv.used or inv.expires_at < timezone.now():
        return Response({'detail':'token expired or used'}, status=400)

    user, created = User.objects.get_or_create(email=inv.email)
    if created:
        user.username = username
        user.set_password(password)
    user.role = inv.role
    user.save()

    inv.used = True
    inv.save()

    return Response({'detail':'accepted'})




class IsAdminOnly(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-id')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminOnly]

    def perform_create(self, serializer):
        serializer.save()
