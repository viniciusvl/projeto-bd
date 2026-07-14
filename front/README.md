# Frontend — Sistema Hospitalar Dr. Yuska Maritan Brito

Interface em **React + TypeScript + Vite + Tailwind CSS** para o sistema de gestão
hospitalar. Consome a API FastAPI do diretório `../back`.

## Telas

- **Atendimento** — lista pacientes; em "Ver atendimentos" abre um popup com os
  atendimentos e procedimentos de cada um, com status **Faturado / Não Faturado** e
  botão para remover procedimentos não faturados. Botão **Novo Atendimento**.
- **Pacientes** — lista pacientes; em "Editar dados" abre um popup para alterar
  número do convênio ou endereço.
- **Relatórios**
  - **Residentes** — tempo médio de atendimento + ranking por nº de atendimentos.
  - **Preceptores** — preceptores com mais de 5 supervisões no mês selecionado.
  - **Plantões** — quantidade de plantões escalados por residente, por unidade.
  - **Pacientes** — pacientes sem nenhum procedimento de risco alto.

## Rodar em desenvolvimento

```bash
npm install
npm run dev
```

App em `http://localhost:5173`. A API precisa estar em `http://localhost:8000`
(padrão). Para apontar para outra URL, defina `VITE_API_URL`:

```bash
# .env  (ou variável de ambiente)
VITE_API_URL=http://localhost:8000
```

## Build de produção

```bash
npm run build      # gera dist/
npm run preview    # serve o dist localmente
```

## Docker

O frontend é servido por Nginx a partir do build estático. Subir junto com toda a
stack (banco + API + frontend) pela raiz do projeto:

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- API: `http://localhost:8000`

A URL da API usada no build da imagem é definida pelo `build.args.VITE_API_URL`
no `docker-compose.yml`.
