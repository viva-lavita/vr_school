FROM python:3.13 as build-image

RUN mkdir /backend
ENV HOME="/backend"
WORKDIR $HOME

ENV PYTHONUNBUFFERED=1
ENV PYTHONIOENCODING=utf-8

# Копируем uv
COPY --from=ghcr.io/astral-sh/uv:0.6.16 /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Сначала копируем файлы зависимостей
COPY pyproject.toml uv.lock ./

# Синхронизируем зависимости (без флага --no-install-project!)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked

# Теперь копируем весь код проекта
COPY . .

# Финальная синхронизация (--frozen --no-dev — нормально для прода)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# Добавляем venv в PATH
ENV PATH="$HOME/.venv/bin:$PATH"

COPY /scripts /scripts/
RUN chmod a+x /scripts/*
