# ПЗ7 - CI/CD і Docker (15 балів)

Ця практична робота складається з двох частин.

Основна частина - **CI/CD**. Після кожного push GitHub Actions автоматично перевірятиме код: запускатиме lint, перевірки з базою даних і збірку клієнта.

Друга частина - **Docker**, і тут вона базова: простий `Dockerfile` для сервера і `docker-compose.yml`, який піднімає базу із сервером у двох контейнерах. Клієнт працює як і раніше - через `npm run dev`.

У результаті у вашому репозиторії має бути зелений CI-пайплайн на кожен пуш, а сервер із базою - підніматися командою `docker compose up --build`.

Практична робота продовжує Л7. Там уже розглядалися Docker, Compose, GitHub Actions і приклади workflow.

На лекції показано повнішу картину: multi-stage образ і три сервіси в Compose. Для цієї практичної досить базового варіанта - один етап у Dockerfile і два сервіси в Compose.

---

## Порядок виконання

Рекомендується спочатку налаштувати **CI**, а потім Docker.

CI працює з кодом, який у вас уже є, тому перший результат можна отримати досить швидко. Docker відповідає за середовище запуску і потребує трохи більше налаштувань.

Коли CI вже працює, помилки в Docker-конфігурації буде простіше знаходити: перевірки використовуватимуть ту саму базу даних, що й Compose.

---

## Що вже є в проєкті

| Шлях                                           | Стан                      | Що там                              |
| ---------------------------------------------- | ------------------------- | ----------------------------------- |
| `server/`, `client/`                           | готово з ПЗ6              | існуючий код, змінювати не потрібно |
| `.github/workflows/ci.yml`                     | **TODO 1–3**              | три job: lint, client, check        |
| `server/Dockerfile`                            | **TODO 4**                | простий образ сервера               |
| `docker-compose.yml`                           | **TODO 5**                | `db` готово, потрібно додати `server` |
| `server/eslint.config.js`                      | готово                    | ESLint із трьома правилами         |
| `server/.dockerignore`                         | готово                    | менший Docker build context         |

Код із `server/` і `client/` змінювати не потрібно, якщо це не необхідно для проходження перевірок.

---

# Що потрібно зробити

| № | Файл                    | Результат                                        |
| - | ----------------------- | ------------------------------------------------ |
| 1 | `ci.yml` · job `lint`   | ESLint запускається після кожного push           |
| 2 | `ci.yml` · job `client` | клієнт успішно збирається                        |
| 3 | `ci.yml` · job `check`  | перевірки з Л2 і Л4 працюють із реальною базою  |
| 4 | `server/Dockerfile`     | збирається і запускається образ сервера          |
| 5 | `docker-compose.yml`    | запускаються `db` і `server`                     |

### Перед початком

`npm run db:up` поки що не працює, тому що `docker-compose.yml` - це одна з TODO.

Поки не готовий ваш Compose, базу можна запустити з ПЗ6:

```bash
docker compose -f ../ПЗ6/docker-compose.yml up -d db
```

або використати:

```bash
npx prisma dev
```

---

# Крок 1. Job `lint`

Створіть файл:

```text
.github/workflows/ci.yml
```

Тека `.github` уже є в каркасі проєкту.

Перенесіть у workflow приклад із Л7 «ci.yml: перша job - lint» або використайте такий варіант:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: server

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
          cache-dependency-path: server/package-lock.json

      - run: npm ci
      - run: npm run lint
```

Зробіть push і відкрийте вкладку **Actions** у GitHub.

GitHub запустить workflow на віртуальній машині `ubuntu-latest`. По суті, там виконується та сама команда:

```bash
npm run lint
```

яку ви запускаєте локально.

У job є кілька основних кроків:

* `checkout` - завантажує код репозиторію;
* `setup-node` - встановлює потрібну версію Node.js;
* `cache: npm` - дозволяє використовувати кеш npm;
* `npm ci` - встановлює залежності;
* `npm run lint` - запускає ESLint.

`working-directory: server` потрібен тому, що `package.json` знаходиться в `server/`, а не в корені репозиторію.

---

# Крок 2. Job `client`

Цю job напишіть самі за зразком `lint` - вона навмисно найпростіша з трьох.

Головна відмінність - робоча директорія:

```yaml
working-directory: client
```

І останній крок:

```bash
npm run build
```

Ця команда запускає:

```text
tsc -b && vite build
```

Не забудьте вказати `cache-dependency-path: client/package-lock.json`.

Якщо клієнт не збереться в CI, він не збереться і під час створення Docker-образу.

Зразок - на слайді Л7 «ci.yml: третя job - клієнт».

---

# Крок 3. Job `check`

Команди:

```bash
npm run check
npm run check:auth
```

перевіряють API і потребують працюючої бази даних.

У GitHub Actions для цього можна використати `services:`. GitHub запустить окремий контейнер PostgreSQL поруч із job.

Готовий варіант цієї job - той самий, що на слайді Л7 «ci.yml: job з базою - контрактні перевірки»:

```yaml
  check:
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: server

    services:
      postgres:                  # контейнер поруч із job
        image: postgres:16-alpine
        env:
          POSTGRES_USER: demo
          POSTGRES_PASSWORD: demo
          POSTGRES_DB: notes
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 5s
          --health-timeout 3s
          --health-retries 10

    env:
      # localhost, а НЕ db: це не мережа compose
      DATABASE_URL: postgresql://demo:demo@localhost:5432/notes?schema=public
      JWT_SECRET: ci-secret

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
          cache-dependency-path: server/package-lock.json

      - run: npm ci
      - run: npx prisma generate
      - run: npx prisma migrate deploy
      - run: npx prisma db seed
      - run: npm run build

      - name: Підняти сервер і прогнати перевірки
        run: |
          node dist/index.js &
          npx wait-on -t 30000 http://localhost:3000/api/health
          npm run check
          npm run check:auth
```

Перенесіть її у свій `ci.yml` - але не наосліп, а розібравшись, чому вона улаштована саме так. Є кілька важливих моментів.

### 1. Хост бази - `localhost`

У цьому випадку база запускається як service GitHub Actions, а не як окремий сервіс Docker Compose.

Тому підключення йде через:

```text
localhost
```

а не:

```text
db
```

### 2. Потрібен healthcheck

GitHub Runner повинен дочекатися, поки PostgreSQL буде готовий приймати підключення.

Для цього використовуйте:

```yaml
options: >-
  --health-cmd pg_isready
```

### 3. Сервер потрібно запустити у фоні

Після збірки запустіть сервер:

```bash
node dist/index.js &
```

Потім дочекайтеся, поки API стане доступним. Для цього можна використати `npx wait-on`.

Тільки після цього запускайте перевірки.

Загальний порядок такий:

```text
npm ci
↓
npx prisma generate
↓
npx prisma migrate deploy
↓
npx prisma db seed
↓
npm run build
↓
запуск сервера
↓
очікування /api/health
↓
npm run check
npm run check:auth
```

---

# Крок 4. `server/Dockerfile`

У `server/Dockerfile` потрібно зібрати образ, який сам встановлює залежності, компілює TypeScript і піднімає API разом із міграціями.

Основні вимоги:

* базовий образ - `node:24-alpine`;
* `package.json` і lock-файл копіюються окремо від вихідного коду і раніше за нього - щоб Docker міг використовувати кеш;
* `prisma/` і `prisma.config.ts` теж копіюються: вони потрібні і для `prisma generate`, і для `prisma migrate deploy` на старті контейнера;
* порядок команд: `npm ci` → `npx prisma generate` → `npm run build`;
* перед запуском сервера виконується `prisma migrate deploy`.

Вийде близько десяти рядків. Зразок - на слайді Л7 «server/Dockerfile: multi-stage»: вам потрібні його перший етап і рядок `CMD`.

### Не додавайте секрети в Dockerfile

Не робіть так:

```dockerfile
ENV JWT_SECRET=some-secret
```

Секрет, записаний у Dockerfile, потрапляє в шари образу.

Секрети потрібно передавати через `environment` у Compose або через GitHub Secrets у CI.

---

# Крок 5. `docker-compose.yml`

Compose повинен запускати два сервіси:

```text
db
server
```

Клієнт залишається у деві - `npm run dev`, як у попередніх практичних.

### `db` - готово

Сервіс `db` уже написаний у заглушці: той самий PostgreSQL із healthcheck і томом, що й у ПЗ6.

### `server`

Сервер повинен:

* збиратися з `./server`;
* отримувати `DATABASE_URL` із хостом `db` і `JWT_SECRET` через `environment`;
* чекати, поки база пройде healthcheck, - використовувати `depends_on` з:

```yaml
condition: service_healthy
```

* прокинути порт `3000:3000` - сюди стукають і `npm run check`, і дев-проксі Vite.

### Клієнт

```bash
cd client
npm run dev
```

- як у попередніх практичних. Проксі у `vite.config.ts` веде на `localhost:3000`, тому клієнт просто не помічає, що API переїхав у контейнер.

### Зупиніть базу з ПЗ6

Порт 5432 спільний, тому перед першим запуском:

```bash
docker compose -f ../ПЗ6/docker-compose.yml down
```

Дані з ПЗ6 не переїжджають: у ПЗ7 свій том, база починається порожньою. Міграції накотяться самі на старті сервера, а користувача доведеться зареєструвати знову.

Детальні підказки є в заглушці `docker-compose.yml`, а загальна схема - на слайді Л7 «Compose-стек».

---

# ESLint

У проєкті вже є:

```text
server/eslint.config.js
```

і відповідні npm-скрипти:

```bash
cd server

npm run lint
npm run lint:fix
```

`npm run lint` запускає:

```text
eslint . --max-warnings 0
```

У конфігурації використовуються три основні правила.

### `no-unused-vars`

Забороняє оголошувати змінні, які не використовуються.

Якщо змінна навмисно не використовується, для таких випадків передбачений префікс `_`.

### `no-explicit-any`

Забороняє використовувати `any`, оскільки він вимикає перевірку типів TypeScript.

### `no-console`

Забороняє залишати `console.log` та інші виклики `console` у коді.

Для скриптів у `prisma/` це правило вимкнене, оскільки вони можуть використовувати консоль для виведення інформації.

Тепер ESLint перевіряється не тільки локально, а й у CI після кожного push.

---

# Якщо ви використовуєте GitLab

Основна вимога цієї практичної - GitHub Actions.

Але якщо ваш проєкт знаходиться на GitLab, аналогічний pipeline можна зробити через GitLab CI.

Наприклад:

```yaml
# .gitlab-ci.yml

lint:
  image: node:24

  script:
    - cd server
    - npm ci && npm run lint
```

Для `check` база також запускається через `services:`.

У GitLab схема залишається тією самою:

```text
lint
check
client
```

Змінюється тільки синтаксис CI-конфігурації.

---

# Як буде перевірятися робота

### 1. GitHub Actions

В останньому коміті повинні успішно пройти три job:

* `lint`;
* `check`;
* `client`.

### 2. Docker Compose

Команда:

```bash
docker compose up --build
```

повинна підняти базу і сервер.

Очікуваний порядок:

```text
db
↓
healthcheck
↓
server
```

### 3. Контрактні перевірки

```bash
cd server
npm run check
npm run check:auth
```

проходять проти сервера в контейнері - рівно ті самі, що раніше проти `npm run dev`.

### 4. Робота застосунку

```bash
cd client
npm run dev
```

Повинні працювати:

* вхід;
* список записів;
* створення запису.

### 5. Збереження даних

Виконайте:

```bash
docker compose down
docker compose up
```

Дані повинні залишитися.

Після:

```bash
docker compose down -v
```

volume видаляється разом із даними.

---

# Підказки

### Червоний pipeline означає, що завдання ще не виконане

Основна ідея CI - автоматично визначати, проходить код перевірки чи ні.

Якщо job червона, спочатку потрібно знайти та виправити причину.

### Якщо CI падає - подивіться лог

Відкрийте невдалий workflow і конкретний step.

У більшості випадків там буде та сама помилка, яку можна відтворити локально.

### Не забудьте `cache-dependency-path`

Lock-файли знаходяться в:

```text
server/package-lock.json
client/package-lock.json
```

Тому для `setup-node` потрібно вказати правильний шлях до lock-файлу.

### Порядок команд у Dockerfile впливає на кеш

Краще спочатку копіювати:

```text
package.json
package-lock.json
```

встановлювати залежності, а вже потім копіювати `src`.

Тоді після зміни коду Docker зможе використати кеш для `npm ci`.

Якщо одразу зробити:

```dockerfile
COPY . .
```

кеш цього шару буде часто втрачатися.

### `db` і `localhost` - це не одне й те саме

Всередині Docker-контейнера:

```text
localhost
```

означає поточний контейнер.

Якщо сервер знаходиться в іншому контейнері Compose, базу потрібно адресувати через ім'я сервісу:

```text
db
```

### `depends_on` сам по собі не гарантує готовність бази

Він може дочекатися запуску контейнера, але не того моменту, коли PostgreSQL уже готовий приймати підключення.

Тому використовуйте:

```yaml
condition: service_healthy
```

разом із healthcheck.

### Не зберігайте секрети в Dockerfile

Наприклад:

```dockerfile
ENV JWT_SECRET=...
```

небезпечно, оскільки значення залишається в шарах образу.

Використовуйте `environment` у Compose і GitHub Secrets у CI.

### `.dockerignore` потрібен для зменшення build context

Без `.dockerignore` Docker може відправляти в build context, наприклад, локальний `node_modules`.

У цьому проєкті `.dockerignore` уже готові.

---

# Що потрібно здати

У репозиторії має бути:

* три зелені CI job на кожен пуш:

  * `lint`;
  * `check` із базою;
  * `client`;

* робочий `server/Dockerfile`;
* робочий `docker-compose.yml` і запуск сервера з базою через:

```bash
docker compose up --build
```

* `npm run check` і `npm run check:auth` проходять проти контейнера;
* клієнт у деві працює з контейнерним API;
* збереження даних після перезапуску Compose.
