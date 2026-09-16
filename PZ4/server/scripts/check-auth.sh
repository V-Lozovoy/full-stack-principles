#!/usr/bin/env bash
#
# Перевірка автентифікації і авторизації (Пз4).
#
#   Термінал 1:  npm run dev
#   Термінал 2:  npm run check:auth
#
# Девʼять перевірок із лекції Л4. Головна — остання: чужий запис
# для Боба не існує. Саме він відрізняє «є логін» від «є авторизація».

set -u

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
. "$DIR/check.env"

BASE="${BASE:-http://localhost:3000/api}"
BODY="$(mktemp)"
PASS=0
FAIL=0
trap 'rm -f "$BODY"' EXIT

if [ -t 1 ]; then G=$'\033[32m'; R=$'\033[31m'; D=$'\033[2m'; Z=$'\033[0m'
else G=''; R=''; D=''; Z=''; fi

STAMP="$$"
ALICE="{\"email\":\"alice-$STAMP@test.com\",\"password\":\"alice-secret-123\"}"
BOB="{\"email\":\"bob-$STAMP@test.com\",\"password\":\"bob-secret-123\"}"

req() { # req МЕТОД ШЛЯХ [ТОКЕН] [ТІЛО]
  local m=$1 p=$2 t=${3-} d=${4-}
  local h=()
  [ -n "$t" ] && h+=(-H "Authorization: Bearer $t")
  [ -n "$d" ] && h+=(-H 'Content-Type: application/json' -d "$d")
  curl -s -o "$BODY" -w '%{http_code}' -X "$m" "$BASE$p" "${h[@]+"${h[@]}"}"
}
token() { grep -o '"token"[[:space:]]*:[[:space:]]*"[^"]*"' "$BODY" | head -1 | sed 's/.*"\([^"]*\)"$/\1/'; }
id()    { grep -o '"id"[[:space:]]*:[[:space:]]*[0-9][0-9]*' "$BODY" | head -1 | grep -o '[0-9][0-9]*$'; }
ok()    { PASS=$((PASS+1)); printf '  %s✓%s %s\n' "$G" "$Z" "$1"; }
bad()   { FAIL=$((FAIL+1)); printf '  %s✗%s %s\n     %sочікував:%s %s\n     %sотримав: %s %s\n' \
            "$R" "$Z" "$1" "$D" "$Z" "$2" "$D" "$Z" "$3"; }
eq()    { if [ "$2" = "$3" ]; then ok "$1"; else bad "$1" "$2" "$3"; fi; }

printf '\nПеревірка автентифікації: %s\n\n' "$BASE"

# 1. Реєстрація віддає 201 і не віддає пароль
CODE="$(req POST "${AUTH_REGISTER:-/auth/register}" '' "$ALICE")"
if [ "$CODE" = "201" ] && ! grep -qi 'password\|\$2[aby]\$' "$BODY"; then
  ok '1. реєстрація → 201, у відповіді немає ні пароля, ні хеша'
else
  bad '1. реєстрація → 201 без пароля у відповіді' '201 і {id, email}' "$CODE $(head -c 200 "$BODY")"
fi

# 2. Дубль email
eq '2. той самий email ще раз → 409' 409 "$(req POST "${AUTH_REGISTER:-/auth/register}" '' "$ALICE")"

# 3. Короткий пароль відхиляє zod
eq '3. пароль із трьох символів → 400' 400 \
   "$(req POST "${AUTH_REGISTER:-/auth/register}" '' '{"email":"short@test.com","password":"abc"}')"

# 4. Логін віддає токен
req POST "${AUTH_LOGIN:-/auth/login}" '' "$ALICE" > /dev/null
A_TOKEN="$(token)"
if [ -n "$A_TOKEN" ]; then ok '4. логін → { token }'
else bad '4. логін → { token }' '{"token":"..."}' "$(head -c 200 "$BODY")"; fi

# 4b. Невірний пароль — той самий текст, що і «немає користувача»
req POST "${AUTH_LOGIN:-/auth/login}" '' '{"email":"nosuchuser@test.com","password":"whatever1"}' > /dev/null
MSG_NOUSER="$(head -c 200 "$BODY")"
req POST "${AUTH_LOGIN:-/auth/login}" '' "{\"email\":\"alice-$STAMP@test.com\",\"password\":\"wrong-password\"}" > /dev/null
MSG_WRONGPW="$(head -c 200 "$BODY")"
if [ "$MSG_NOUSER" = "$MSG_WRONGPW" ]; then
  ok '5. «немає такого» і «невірний пароль» відповідають однаково'
else
  bad '5. однакова відповідь на «немає такого» і «невірний пароль»' \
      'той самий текст' "$MSG_NOUSER  ≠  $MSG_WRONGPW"
fi

# 6. Без токена — 401, з токеном — 200
eq '6. список без токена → 401' 401 "$(req GET "/$RES")"
eq '7. список із токеном → 200' 200 "$(req GET "/$RES" "$A_TOKEN")"

# 8. Зіпсований токен теж 401
eq '8. підроблений токен → 401' 401 "$(req GET "/$RES" "${A_TOKEN}x")"

# 9. Головне: Боб не може чіпати запис Аліси
req POST "/$RES" "$A_TOKEN" "$GOOD" > /dev/null
NOTE_ID="$(id)"
req POST "${AUTH_REGISTER:-/auth/register}" '' "$BOB" > /dev/null
req POST "${AUTH_LOGIN:-/auth/login}" '' "$BOB" > /dev/null
B_TOKEN="$(token)"

if [ -z "$NOTE_ID" ] || [ -z "$B_TOKEN" ]; then
  bad '9. чужий запис для Боба не існує → 404' '404' 'не вдалося підготувати сценарій'
else
  D_CODE="$(req DELETE "/$RES/$NOTE_ID" "$B_TOKEN")"
  P_CODE="$(req PATCH "/$RES/$NOTE_ID" "$B_TOKEN" "$PATCH")"
  G_CODE="$(req GET "/$RES/$NOTE_ID" "$B_TOKEN")"
  if [ "$D_CODE" = "404" ] && [ "$P_CODE" = "404" ] && [ "$G_CODE" = "404" ]; then
    ok '9. Боб не бачить, не змінює і не видаляє запис Аліси → 404'
  else
    bad '9. чужий запис для Боба не існує → 404 на GET, PATCH і DELETE' \
        '404 / 404 / 404' "GET $G_CODE / PATCH $P_CODE / DELETE $D_CODE"
  fi
  # прибираємо за собою
  req DELETE "/$RES/$NOTE_ID" "$A_TOKEN" > /dev/null
fi

printf '\n  зелених: %d з 9   червоних: %d\n\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
