FROM node:lts as builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json (или yarn.lock) в рабочую директорию
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы проекта в рабочую директорию
COPY . .

# Сборка приложения
RUN npm run build
RUN npm cache clean --force

# Создаем финальный образ для запуска приложения
FROM node:lts AS runner

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только необходимые файлы из предыдущего этапа
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./

# Устанавливаем только продакшен-зависимости
RUN npm install --only=production

# Указываем порт, который будет использоваться приложением
ENV PORT 3000
# ENV NODE_ENV production

# Открываем порт
EXPOSE 3000

# Перенесено в компоуз
# Команда для запуска приложения
# CMD ["npm", "start"]
