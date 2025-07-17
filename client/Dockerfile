# Этап сборки
FROM node:22.9-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:stable-perl AS production

# Копируем собранное приложение в nginx
COPY --from=build /app/build /usr/share/nginx/html

ENV NODE_ENV=production
COPY nginx-static.conf /etc/nginx/conf.d/default.conf


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
