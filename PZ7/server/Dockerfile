# TODO(4) [Пз7 · Л7, слайд «server/Dockerfile: multi-stage»]: простий образ сервера.
#
# Результат: docker build проходить, а docker compose up --build (крок 5)
# піднімає API разом із базою.
#
# Це ПЕРШИЙ етап зразка з Л7 плюс CMD — близько десяти рядків:
#
#   FROM node:24-alpine
#   WORKDIR /app
#   • COPY package.json package-lock.json ОКРЕМО і РАНІШЕ за код —
#     поки вони не змінились, Docker бере npm ci з кешу і не качає
#     залежності заново. Скопіюєте все одразу — кеш не спрацює ніколи.
#   • COPY prisma ./prisma і prisma.config.ts — без них prisma не знайде
#     конфіг ні для generate, ні для migrate deploy на старті
#   • RUN npm ci
#   • COPY tsconfig.json ./ і src ./src
#   • RUN npx prisma generate && npm run build
#     ↑ generate народжує src/generated/prisma: його нема ні в git, ні
#       в контексті збірки (.dockerignore), тому без цього кроку
#       збірка падає
#   • EXPOSE 3000
#   • CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
#     ↑ міграції накочує сам контейнер при старті. У Пз8 цей самий CMD
#       підготує базу на Render без вашої участі.
#
# Другий етап зразка з Л7 (фінальний образ без devDependencies і
# вихідників) тут не потрібен: без нього образ більший, але робочий.
#
# Як видно, що не зроблено: docker compose up --build падає на збірці server.
