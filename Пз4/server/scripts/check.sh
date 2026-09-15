#!/usr/bin/env bash
#
# Контрактна перевірка API (Пз2 і далі).
#
#   Термінал 1:  npm run dev
#   Термінал 2:  npm run check
#
# Скрипт нічого не знає про ваш код — лише про домовленості з лекції Л2:
# які адреси, які методи і які коди відповіді. Тому працює однаково для
# Node, Python чи Go. Свою сутність описуєте у scripts/check.env.
#
# Перевірка прибирає за собою: усе, що створила, вона ж і видаляє. Тому її
# можна запускати скільки завгодно разів поспіль — результат той самий.

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

TOKEN=""

# hit МЕТОД ШЛЯХ [ТІЛО] → друкує код відповіді, саму відповідь кладе у $BODY
# Якщо токен уже отримано, він додається до кожного запиту.
hit() {
  set -- "$@"
  AUTH=()
  if [ -n "$TOKEN" ]; then AUTH=(-H "Authorization: Bearer $TOKEN"); fi
  if [ "$#" -ge 3 ]; then
    curl -s -o "$BODY" -w '%{http_code}' -X "$1" "$BASE$2" "${AUTH[@]+"${AUTH[@]}"}" \
      -H 'Content-Type: application/json' -d "$3"
  else
    curl -s -o "$BODY" -w '%{http_code}' -X "$1" "$BASE$2" "${AUTH[@]+"${AUTH[@]}"}"
  fi
}

ok()   { PASS=$((PASS + 1)); printf '  %s✓%s %s\n' "$G" "$Z" "$1"; }
bad()  { FAIL=$((FAIL + 1)); printf '  %s✗%s %s\n     %sочікував:%s %s\n     %sотримав: %s %s\n' \
           "$R" "$Z" "$1" "$D" "$Z" "$2" "$D" "$Z" "$3"; }
eq()   { if [ "$2" = "$3" ]; then ok "$1"; else bad "$1" "$2" "$3"; fi; }
body() { head -c 300 "$BODY"; }

printf '\nКонтрактна перевірка: %s, ресурс /%s\n\n' "$BASE" "$RES"

# 1. Сервер живий
CODE="$(hit GET /health)"
if [ "$CODE" = "000" ]; then
  printf '  %s✗%s сервер не відповідає на %s/health — спершу npm run dev\n\n' "$R" "$Z" "$BASE"
  exit 1
fi
eq "1. GET /health → 200" 200 "$CODE"

# З Пз4 маршрути закриті токеном: спершу реєструємось і входимо.
# Реєстрація може повернути 409 — користувач лишився з минулого разу,
# і це нормально: важливий лише успішний вхід.
if [ -n "${AUTH_LOGIN:-}" ]; then
  hit POST "${AUTH_REGISTER:-/auth/register}" "$AUTH_USER" > /dev/null
  hit POST "$AUTH_LOGIN" "$AUTH_USER" > /dev/null
  TOKEN="$(grep -o '"token"[[:space:]]*:[[:space:]]*"[^"]*"' "$BODY" \
           | head -1 | sed 's/.*"\([^"]*\)"$/\1/')"
  if [ -n "$TOKEN" ]; then
    printf '  %s·%s вхід виконано, далі запити йдуть із токеном\n' "$D" "$Z"
  else
    printf '  %s✗%s не вдалося увійти: %s не повернув { "token": ... }\n' \
      "$R" "$Z" "$AUTH_LOGIN"
    printf '     отримав: %s\n\n' "$(body)"
    exit 1
  fi
fi

# 2. Список віддається
eq "2. GET /$RES → 200" 200 "$(hit GET "/$RES")"

# 3. Створення повертає 201 і сам обʼєкт із числовим id
CODE="$(hit POST "/$RES" "$GOOD")"
ID="$(grep -o '"id"[[:space:]]*:[[:space:]]*[0-9][0-9]*' "$BODY" | head -1 | grep -o '[0-9][0-9]*$')"
if [ "$CODE" = "201" ] && [ -n "$ID" ]; then
  ok "3. POST /$RES → 201 і в тілі id (=$ID)"
else
  bad "3. POST /$RES → 201 і в тілі id" '201 + {"id":1,...}' "$CODE $(body)"
fi

# 4. Невалідне тіло відхиляється
eq "4. POST з невалідним тілом → 400" 400 "$(hit POST "/$RES" "$BAD")"

# 5. ...і пояснює, яке саме поле не сподобалось
if grep -q '"details"' "$BODY" && grep -q "\"$BAD_FIELD\"" "$BODY"; then
  ok "5. у 400 є details із полем \"$BAD_FIELD\""
else
  bad "5. у 400 є details із полем \"$BAD_FIELD\"" \
      '{"error":"...","details":[{"field":"'"$BAD_FIELD"'",...}]}' "$(body)"
fi

# 6. Часткове оновлення
if [ -n "$ID" ]; then
  eq "6. PATCH /$RES/$ID → 200" 200 "$(hit PATCH "/$RES/$ID" "$PATCH")"
else
  bad "6. PATCH /$RES/:id → 200" 200 'немає id — див. пункт 3'
fi

# 7. Неіснуючий id — 404, а не 200 і не 500
eq "7. GET /$RES/999999 → 404" 404 "$(hit GET "/$RES/999999")"

# 8. Видалення: 204 без тіла, і запис справді зник
if [ -n "$ID" ]; then
  DEL="$(hit DELETE "/$RES/$ID")"
  GONE="$(hit GET "/$RES/$ID")"
  if [ "$DEL" = "204" ] && [ "$GONE" = "404" ]; then
    ok "8. DELETE /$RES/$ID → 204, і запис більше не читається"
  else
    bad "8. DELETE /$RES/$ID → 204, потім GET → 404" '204, потім 404' "$DEL, потім $GONE"
  fi
else
  bad "8. DELETE /$RES/:id → 204, і запис більше не читається" '204, потім 404' 'немає id — див. пункт 3'
fi

printf '\n  зелених: %d з 8   червоних: %d\n\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
