from pathlib import Path
from datetime import timedelta


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-hjt1o9cdh1e(a^#v1tz)gzniggyxk8v9ozlwtpmjn5b*gb__7w'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'internship',
    'rest_framework',
    'REST_FRAMEWORK config',
    'SIMPLE_JWT config',
    'django-cors-header',
    'rest_framework_simplejwt',        
    'rest_framework_simplejwt.token_blacklist',
    'django_filters',  # For filtering querysets
    'corsheaders'
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core',

    # Third-party
    # 'rest_framework_simplejwt',  # For JWT token authentication
    
    # Local apps
    #'apps.accounts',
    #'apps.placements',
    #'apps.logs',
    #'apps.evaluations',
    #'apps.notifications',
    #'apps.common',
    
    
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.corsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',

        #'ENGINE': 'django.db.backends.postgresql',
        #'NAME': 'group20_db',
        #'USER': 'group20_user',
        #'PASSWORD': 'group20password',
        #'HOST': 'localhost',
        #'PORT': '5432',
    }
}

# ---Auth--
AUTH_USER_MODEL = 'internship.User', 'accounts.CustomUser'
LOGIN_URL = 'login'

# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / "static"
    ]

#-----CORS---
# Allows your React dev server to talk to Django during development.
# When you deploy, replace these with your actual frontend domain.

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',   # Vite (React default)
    'http://localhost:3000',   # Create React App default
]

CORS_ALLOW_CREDENTIALS = True   # Needed so React can send the Authorization header




#Register Custom User in settings
#AUTH_USER_MODEL = 'accounts.CustomUser'


#--Django REST Framewprk----------------------------------------------------------------------


REST_FRAMEWORK = {
    # --- Auth ---
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),

    # --- Permissions ---
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),

    # --- Filtering ---
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],

# --- Pagination ---
    'DEFAULT_PAGINATION_CLASS': 'apps.common.pagination.StandardResultsSetPagination',
    'PAGE_SIZE': 10,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),    #Access token expires in 60 minutes
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),  #Refresh token expires in 7 days
    'ROTATE_REFRESH_TOKENS': True,         #Issue new refresh token on every refresh
    'BLACKLIST_AFTER_ROTATION': True,      #old refresh token becomes invalid after rotation
    'AUTH_HEADER_TYPES': ('Bearer',),      #Frontend sends: Authorization Bearer <token>
    'UPDATE_LAST_LOGIN': True,             #Updates user.last_login on token issue
}

REST_FRAMEWORK['EXCEPTION_HANDLER'] = 'apps.common.exceptions.custom_exception_handler'


#Security
# Prevent XSS
SECURE_BROWSER_XSS_FILTER = True

# Prevent MIME sniffing
SECURE_CONTENT_TYPE_NOSNIFF = True

# CSRF protection
CSRF_COOKIE_HTTPONLY = True

# Clickjacking protection
X_FRAME_OPTIONS = 'DENY'

