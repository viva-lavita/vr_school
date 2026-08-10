import os
import sys
from datetime import timedelta
from pathlib import Path
from platform import system

from celery.schedules import crontab
from dotenv import load_dotenv

try:
    load_dotenv(os.path.join(Path(__file__).resolve().parent.parent.parent, ".env"))
except FileNotFoundError:
    raise FileNotFoundError("Did not find .env")

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY")

DEBUG = os.getenv("DEBUG", default=False) == "True"

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "127.0.0.1 localhost").split()
CSRF_TRUSTED_ORIGINS = os.getenv("CSRF_TRUSTED_ORIGINS", "http://127.0.0.1 http://localhost").split()
CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "http://127.0.0.1 http://localhost").split()
# CORS_ALLOW_CREDENTIALS = True # для cookie, позволяет отправлять куки в кросс-доменном запросе

DOMAIN = os.getenv("DOMAIN", default="localhost:8000")
SITE_NAME = os.getenv("SITE_NAME", default="Django5 Template")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", default="Django5 Template <admin@localhost>")
# при необходимости можно добавить в шаблон писем
# DEFAULT_FROM_PHONE = os.getenv("DEFAULT_FROM_PHONE", default="+7 (000) 000-00-00")

OPERATING_SYSTEM = system()  # можно привязать запуск redis и celery

TESTING = "test" in sys.argv


########################
#  APPLICATION
########################

# base
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

# packages
INSTALLED_APPS += [
    "rest_framework",
    "rest_framework_simplejwt",
    "django_filters",
    "djoser",
    "corsheaders",
    "drf_spectacular",
    "drf_spectacular_sidecar",
    "nested_admin",
    "django_celery_beat",
]

# apps
INSTALLED_APPS += [
    "api.apps.ApiConfig",
    "users.apps.UsersConfig",
    "lessons.apps.LessonsConfig",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


########################
#  DATABASE
########################
# ! при запуске локально на линукс будет бд postgresql
if DEBUG and OPERATING_SYSTEM == "Windows":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("POSTGRES_DB"),
            "USER": os.getenv("POSTGRES_USER"),
            "PASSWORD": os.getenv("POSTGRES_PASSWORD"),
            "HOST": os.getenv("POSTGRES_HOST"),
            "PORT": os.getenv("POSTGRES_PORT"),
        }
    }

########################
#  INTERNATIONALIZATION
########################
LANGUAGE_CODE = "ru-ru"

LANGUAGES = [
    ("ru", "Русский"),
    ("en", "English"),
]

LOCALE_PATHS = [os.path.join(BASE_DIR, "locale")]

TIME_ZONE = "Europe/Moscow"

USE_I18N = True

USE_TZ = True


########################
#  STATIC AND MEDIA
########################
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "static")

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")


DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


########################
#  API
########################
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend"],
    "EXCEPTION_HANDLER": "api.exceptions.custom_exception_handler",
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 30,
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {"anon": "100/min", "user": "1000/min"},
}


#######################
#  USER
#######################
AUTH_USER_MODEL = "users.User"

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

DJOSER = {
    "LOGIN_FIELD": "email",
    "USERNAME_FIELD": "email",
    "USER_CREATE_PASSWORD_RETYPE": True,
    "SEND_ACTIVATION_EMAIL": False,
    "PASSWORD_CHANGED_EMAIL_CONFIRMATION": False,
    "PASSWORD_RESET_CONFIRM_RETYPE": True,
    "PASSWORD_RESET_CONFIRM_URL": "password-change/{uid}/{token}",  # pragma: allowlist secret
    "PASSWORD_RESET_SHOW_EMAIL_NOT_FOUND": True if DEBUG else False,
    "USERNAME_RESET_CONFIRM_URL": "email/reset/confirm/{uid}/{token}",  # конечная точка, которую должны реализовать фронты
    "USERNAME_RESET_SHOW_EMAIL_NOT_FOUND": True if DEBUG else False,  # теперь 404 если эмейла нет в бд
    "HIDE_USERS": True,
    "SERIALIZERS": {
        "user": "users.serializers.UserSerializer",
        "current_user": "users.serializers.UserSerializer",
        "user_create_password_retype": "users.serializers.UserCreateSerializer",  # pragma: allowlist secret
        "user_delete": "users.serializers.UserDeleteSerializer",
    },
    "PERMISSIONS": {
        "user_create": ("api.permissions.NotIsAuthenticated",),
    },
    "EMAIL_FRONTEND_SITE_NAME": SITE_NAME,
    "EMAIL_FRONTEND_DOMAIN": DOMAIN,
    # ниже перопределив классы почтовых сообщений, можно дополнить/заменить шаблоны писем
    # см users/email.py
    "EMAIL": {
        "activation": "djoser.email.ActivationEmail",
        "confirmation": "djoser.email.ConfirmationEmail",  # pragma: allowlist secret
        "password_reset": "users.email.CustomPasswordResetEmail",  # pragma: allowlist secret
        "password_changed_confirmation": "djoser.email.PasswordChangedConfirmationEmail",  # pragma: allowlist secret
        "username_changed_confirmation": "djoser.email.UsernameChangedConfirmationEmail",
        "username_reset": "djoser.email.UsernameResetEmail",
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=14) if DEBUG else timedelta(minutes=300),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30) if DEBUG else timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": "",
    "AUDIENCE": None,
    "ISSUER": None,
    "JSON_ENCODER": None,
    "JWK_URL": None,
    "LEEWAY": 0,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",
    "JTI_CLAIM": "jti",
    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=300),
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=7),
    "TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainPairSerializer",
    "TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSerializer",
    "TOKEN_VERIFY_SERIALIZER": "rest_framework_simplejwt.serializers.TokenVerifySerializer",
    "TOKEN_BLACKLIST_SERIALIZER": "rest_framework_simplejwt.serializers.TokenBlacklistSerializer",
    "SLIDING_TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainSlidingSerializer",
    "SLIDING_TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSlidingSerializer",
}

DATA_UPLOAD_MAX_NUMBER_FIELDS = 100000 if DEBUG else 2000


########################
#  SWAGGER
########################
SPECTACULAR_SETTINGS = {
    "TITLE": "API VR school",
    "DESCRIPTION": "v1",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SCHEMA_PATH_PREFIX": "/api/v1/",
    "COMPONENT_SPLIT_REQUEST": True,
    "SWAGGER_UI_SETTINGS": {
        "deepLinking": True,
        "persistAuthorization": True,
    },
    "SWAGGER_UI_DIST": "SIDECAR",
    "SWAGGER_UI_FAVICON_HREF": "SIDECAR",
    "REDOC_DIST": "SIDECAR",
}


########################
#  EMAIL
########################
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST", default="smtp.mail.ru")
EMAIL_PORT = 465
EMAIL_USE_SSL = True

EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")

EMAIL_SERVER = EMAIL_HOST_USER
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
EMAIL_ADMIN = EMAIL_HOST_USER


########################
#  REDIS AND CELERY
########################

if os.getenv("DOCKER", default="True") == "True":
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": "redis://redis:6379",
            "OPTIONS": {
                "db": "1",
                "parser_class": "redis.connection.PythonParser",
                "pool_class": "redis.BlockingConnectionPool",
            },
        },
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "unique-snowflake",
        }
    }

REDIS_PORT = "6379"
CELERY_TIMEZONE = TIME_ZONE
CELERY_BROKER_URL = f"redis://redis:{REDIS_PORT}/0"
CELERY_BROKEN_TRANSPORT_OPTIONS = {"visibility_timeout": 3600}
CELERY_TASK_ACKS_LATE = True
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_RESULT_BACKEND = f"redis://redis:{REDIS_PORT}/0"
CELERY_ACCEPT_CONTENT = ["application/json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"

if DEBUG:
    CELERY_BEAT_SCHEDULE = {
        "debug_task": {"task": "api.tasks.debug_task", "schedule": crontab(minute="*/30"), "args": ()},
        "recalculate-missing-scores": {
            "task": "lessons.tasks.recalculate_missing_scores",
            "schedule": timedelta(seconds=10),  # каждые 10 секунд для тестирования
        },
    }
else:
    CELERY_BEAT_SCHEDULE = {
        "recalculate-missing-scores": {
            "task": "lessons.tasks.recalculate_missing_scores",
            "schedule": timedelta(seconds=10),  # каждые 10 секунд для тестирования
        },
    }


########################
#  LOGGING
########################
LOGS_DIR = Path("/var/log/app")
LOGS_DIR.mkdir(parents=True, exist_ok=True)


def safe_file_handler(filename, formatter_name, level="INFO", max_bytes=5 * 1024 * 1024, backup_count=5):
    """Безопасный FileHandler с проверкой прав и созданием папки."""
    full_path = LOGS_DIR / filename
    return {
        "class": "logging.handlers.RotatingFileHandler",
        "filename": str(full_path),
        "formatter": formatter_name,
        "level": level,
        "maxBytes": max_bytes,
        "backupCount": backup_count,
        "encoding": "utf-8",
        "mode": "a",
    }


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "console": {
            "format": "{asctime} | {name:20} | {levelname:8} | {module:12} | {message}",
            "style": "{",
        },
        "json": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(name)s %(levelname)s %(message)s",
            "json_ensure_ascii": False,
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
            "formatter": "console",
        },
        "all_errors": safe_file_handler(
            "all_errors.log", "json", level="ERROR", max_bytes=10 * 1024 * 1024, backup_count=10
        ),
        "root_log": safe_file_handler("root.log", "json", level="WARNING", max_bytes=20 * 1024 * 1024, backup_count=10),
        "tasks": safe_file_handler(
            "tasks.log", "json", level="DEBUG" if DEBUG else "WARNING", max_bytes=5 * 1024 * 1024, backup_count=5
        ),
        "celery": safe_file_handler(
            "celery.log", "json", level="INFO" if DEBUG else "WARNING", max_bytes=5 * 1024 * 1024, backup_count=5
        ),
        "request": safe_file_handler(
            "request.log", "json", level="INFO" if DEBUG else "WARNING", max_bytes=10 * 1024 * 1024, backup_count=10
        ),
        "AI_log": safe_file_handler(
            "AI.log", "json", level="INFO" if DEBUG else "WARNING", max_bytes=5 * 1024 * 1024, backup_count=5
        ),
    },
    "loggers": {
        "": {  # root
            "handlers": ["root_log", "console"] if DEBUG else ["root_log"],
            "level": "WARNING",
            "propagate": True,
        },
        "tasks": {
            "handlers": ["console", "tasks"] if DEBUG else ["tasks"],
            "level": "DEBUG" if DEBUG else "WARNING",
            "propagate": False,
        },
        "django": {
            "handlers": ["console", "all_errors"] if DEBUG else ["all_errors"],
            "level": "ERROR",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console", "request"] if DEBUG else ["request"],
            "level": "INFO" if DEBUG else "WARNING",
            "propagate": False,
        },
        "AI": {
            "handlers": ["console", "AI_log"] if DEBUG else ["AI_log"],
            "level": "INFO" if DEBUG else "WARNING",
            "propagate": False,
        },
        "celery": {
            "handlers": ["console", "celery"] if DEBUG else ["celery"],
            "level": "INFO" if DEBUG else "WARNING",
            "propagate": False,
        },
        "celery.worker": {
            "handlers": ["console", "celery"] if DEBUG else ["celery"],
            "level": "INFO" if DEBUG else "WARNING",
            "propagate": False,
        },
        "celery.beat": {
            "handlers": ["console", "celery"] if DEBUG else ["celery"],
            "level": "INFO" if DEBUG else "WARNING",
            "propagate": False,
        },
    },
}
