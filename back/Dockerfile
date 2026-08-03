FROM python:3.12-slim

WORKDIR /app

# Instala o Poetry e utilitários
RUN apt-get update && apt-get install -y --no-install-recommends netcat-traditional \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir poetry

# Copia apenas os manifestos primeiro (cache de dependências)
COPY back/pyproject.toml ./

# Instala as dependências no ambiente global do container (incluindo dev para pytest)
RUN poetry config virtualenvs.create false \
    && poetry install --no-root --with dev

# Copia o código da aplicação
COPY back/ .

# Copia os scripts do banco
COPY scripts ./scripts

EXPOSE 8000

COPY back/entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
