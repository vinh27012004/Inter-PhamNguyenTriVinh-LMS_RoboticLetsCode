"""
ASGI config for E-Robotic Let's Code project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')

application = get_asgi_application()
