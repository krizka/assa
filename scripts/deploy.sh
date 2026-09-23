#!/bin/sh
# Заливает landing/ на сервер и отдает файлы www-data. Запуск из любой папки:
#   sh scripts/deploy.sh
# --delete удаляет на сервере файлы, которых нет в landing/.
# .well-known исключен, чтобы не трогать проверки certbot.
# На macOS стоит openrsync без --chown, поэтому владельца меняем через ssh.
set -e

HOST=root@85.198.108.229
DEST=/var/www/alva.club
SRC="$(cd "$(dirname "$0")/../landing" && pwd)"

rsync -avz --delete \
  --exclude '.DS_Store' \
  --exclude '.well-known' \
  "$SRC/" "$HOST:$DEST/"

ssh "$HOST" "chown -R www-data:www-data '$DEST'"

echo "Готово: $SRC -> $HOST:$DEST"
