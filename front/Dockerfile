# ---- Etapa de build (Node + Vite) ----
FROM node:20-alpine AS build

WORKDIR /app

# Instala dependências primeiro (aproveita cache de camadas)
COPY package*.json ./
RUN npm install

# Copia o código e gera o build de produção
COPY . .
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Etapa de produção (Nginx servindo os estáticos) ----
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
