from django.urls import path
from .views import index

# django needs to know that this file belongs to the frontend app for the spotify callback to redirect to the frontend
app_name = 'frontend'

urlpatterns = [
    path('', index, name=''),
    path('join', index),
    path('create', index),
    path('room/<str:roomCode>', index)
]
