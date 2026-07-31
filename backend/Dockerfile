FROM python:3.13-slim

WORKDIR /backend

ENV PYTHONUNBUFFERED=1
ENV PYTHONIOENCODING=utf-8
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Копируем uv
COPY --from=ghcr.io/astral-sh/uv:0.6.17 /uv /uvx /bin/

# Сначала только файлы зависимостей — чтобы кэш слоя работал
COPY pyproject.toml uv.lock ./

# Синхронизируем зависимости (без --no-install-project!)
# --frozen сработает корректно, только если uv.lock свежий
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen

# Теперь копируем весь остальной проект
COPY . .

# Скрипты
COPY scripts/ ./scripts/
RUN chmod a+x ./scripts/*

# Добавляем venv в PATH
ENV PATH="/backend/.venv/bin:$PATH"
