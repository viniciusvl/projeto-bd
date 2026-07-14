<img src="front/public/logo-sistema.png" alt="Logo" width="200">

## Como rodar localmente

```bash
docker compose up -d
```

Ao digitar esse comando no terminal:

- **Subir backend em localhost:8000**
- **Subir front em localhost:3000**
- **Subir banco MySQL em localhost:3307**. Utilizamos essa porta diferente do padrão para não dar conflito com computadores que já possuem MySQL instalado.

## Scripts SQL

Ficam em `scripts/`. Para rodar qualquer um deles o banco precisa estar no ar.

```bash
docker compose exec -T db mysql -uroot -proot hospital < scripts/crud.sql
```
