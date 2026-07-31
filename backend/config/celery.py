import os
from functools import wraps

from celery import Celery
from django.conf import settings  # noqa

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("backend")

app.config_from_object("django.conf:settings", namespace="CELERY")

app.autodiscover_tasks()


def skip_if_running(funk):
    """
    Декоратор для предотвращения запуска задачи в случае, если она уже запущена.

    Пример использования:

    @shared_task(bind=True)
    @skip_if_running
    def my_task(self):

    Обязательно должен быть аргумент self и @shared_task с bind=True.
    """
    task_name = f"{funk.__module__}.{funk.__name__}"

    @wraps(funk)
    def wrapped(self, *args, **kwargs):
        workers = self.app.control.inspect().active()

        for worker, tasks in workers.items():
            for task in tasks:
                if (
                    task_name == task["name"]
                    and tuple(args) == tuple(task["args"])
                    and kwargs == task["kwargs"]
                    and self.request.id != task["id"]
                ):
                    print(f"task {task_name} ({args}, {kwargs}) is running on {worker}, skipping")

                    return None

        return funk(self, *args, **kwargs)

    return wrapped
