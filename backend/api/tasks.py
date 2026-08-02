import logging

from celery import shared_task

logger = logging.getLogger("celery")


@shared_task
def debug_task():
    """Периодическая таска. Выполняется при DEBUG=True."""
    logger.debug(
        "Выполнена тестовая периодическая задача для проверки корректной "
        "работы Celery воркера и Celery Beat локально и на сервере."
    )
    print("Выполнена тестовая периодическая задача.")

    return True
