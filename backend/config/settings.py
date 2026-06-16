from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-hjt1o9cdh1e-a-v1tz-gzniggyxk8v9ozlwtpmjn5b-gb--7w")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == "True"


ALLOWED_HOSTS = ['*'] #allow all hosts during development, change in production


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    

    # Third-party
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'django_filters',

    # Local apps
    'apps.accounts',
    'apps.common',
    'apps.placements',
    'apps.logs',
    'apps.evaluations',
    'apps.notifications',
    'apps.core',
    'apps.internship',





    
    
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
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

# Use sqlite3 as default/fallback if DB_ENGINE is sqlite3, or DB_NAME is missing,
# or if we are unable to load psycopg modules for PostgreSQL.
DB_ENGINE = os.getenv('DB_ENGINE', '')
use_sqlite = (DB_ENGINE == 'django.db.backends.sqlite3') or not os.getenv('DB_NAME')

if not use_sqlite:
    try:
        import psycopg  # noqa: F401
    except ImportError:
        try:
            import psycopg2  # noqa: F401
        except ImportError:
            # Fallback to SQLite if psycopg driver is not installed
            use_sqlite = True

if use_sqlite:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME'),
            'USER': os.getenv('DB_USER'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST'),
            'PORT': os.getenv('DB_PORT'),
        }
    }

# ---Auth--
#AUTH_USER_MODEL = 'internship.User'
#LOGIN_URL = 'login'

# Password validation
        #'HOST': 'localhost',
        #'PORT': '5432',
    


# ---Auth--
AUTH_USER_MODEL = 'accounts.CustomUser'
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
    'http://localhost:5173',  # Vite (React default)
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://internship-system-design-production-8ab5.up.railway.app',  # Create React App default
]

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True




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

REST_FRAMEWORK['EXCEPTION_HANDLER'] = 'apps.common.exception.custom_exception_handler'


#Security
# Prevent XSS
SECURE_BROWSER_XSS_FILTER = True

# Prevent MIME sniffing
SECURE_CONTENT_TYPE_NOSNIFF = True

# CSRF protection
CSRF_COOKIE_HTTPONLY = True

# Clickjacking protection
X_FRAME_OPTIONS = 'DENY'

