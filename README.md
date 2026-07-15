# Gerenciamento hospitalar Dra. Yuska Martins Brito

<div align="center">
  <img src="front/public/logo-sistema.png" alt="Logo" width="200">
</div>

## Como rodar localmente

Há dois containers no projeto.

- **docker-compose.yml**: destinado para rodar localmente
- **docker-compose.prod.yml**: destinado para rodar em produção

O comando a ser executado para rodar container localmente é:

```bash
docker compose -f docker-compose.yml up -d
```

Ao digitar esse comando no terminal:

- **Subir backend em localhost:8000**
- **Subir front em localhost:3000**
- **Subir banco MySQL em localhost:3307**. Utilizamos essa porta diferente do padrão para não dar conflito com computadores que já possuem MySQL instalado.

## Scripts SQL

Ficam em `scripts/`. Para rodar qualquer um deles o banco precisa estar no ar, para isso, criamos um container que crie automaticamente o banco e adiciona dados iniciais, *data.sql* e *hospital.sql*. Dessa forma, ao rodar o seguinte código, é possível executar os scripts

- **analytical_queries.sql:** consultas analítica da Etapa 1
- **crud_var.sql**: define as variáveis utilizadas para o CRUD
- **crud.sql:** operações de CRUD
- **data.sql:** popula o banco de dados
- **hospital.sql:** DDL do banco de dados

```bash
docker compose exec -T db mysql -uroot -proot hospital < scripts/crud.sql
```

**Obs.:** este comando deve rodar depois de subir o container.
