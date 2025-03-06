"""
URL configuration for gettingstarted project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.views.generic import TemplateView
from backend.api.views import serve_react_app, React

# Add this for debugging
def debug_url(request):
    print("Request path:", request.path)
    print("Request method:", request.method)
    print("Request headers:", request.headers)
    from django.http import HttpResponse
    return HttpResponse("Debug URL view")


urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/', include('backend.api.urls')),
    # React
    re_path(r'^.*', React.as_view(), name='frontend'),
]

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('debug/', debug_url),  # Add this debugging path
#     # path("", TemplateView.as_view(template_name='index.html'))
# ]

# urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# urlpatterns += [
# #     re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
#     re_path(r'^.*$', serve_react_app),
# ]