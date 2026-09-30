#!/bin/sh
# Заливает landing/ на сервер под пользователем alva. Запуск из любой папки:
#   sh scripts/deploy.sh
# --delete удаляет на сервере файлы, которых нет в landing/.
# .well-known исключен, чтобы не трогать проверки certbot.
# Папка сайта на сервере: владелец alva, группа www-data, setgid на папках,
# поэтому новые файлы сами получают группу www-data. Владельца и группу
# не копируем (-rlt вместо -a), права выставляем после заливки через ssh:
# на macOS стоит openrsync без --chmod.
set -e

HOST=alva@85.198.108.229
DEST=/var/www/alva.club
SRC="$(cd "$(dirname "$0")/../landing" && pwd)"

rsync -rltvz --delete \
  --exclude '.DS_Store' \
  --exclude '.well-known' \
  "$SRC/" "$HOST:$DEST/"

# Папкам ставим 750: числовой режим у GNU chmod сохраняет setgid на папках.
# Сам setgid может выставить только член группы www-data (alva в ней состоит).
ssh "$HOST" "find '$DEST' -path '$DEST/.well-known' -prune -o -type d -exec chmod 750 {} + -o -type f -exec chmod 640 {} +"

echo "Готово: $SRC -> $HOST:$DEST"
