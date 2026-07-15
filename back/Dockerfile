FROM python:3.12-slim

WORKDIR /app

# Instala o Poetry
RUN pip install --no-cache-dir poetry

# Copia apenas os manifestos primeiro (cache de dependências)
COPY pyproject.toml ./

# Instala as dependências no ambiente global do container
RUN poetry config virtualenvs.create false \
    && poetry install --no-root

# Copia o código da aplicação
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]
