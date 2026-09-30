#!/bin/sh
# Собирает PDF-памятку программы «Первый шаг» из print/first-step-memo.html
# в landing/files/ через headless Chrome. Запуск из любой папки:
#   sh print/build-memo.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="$ROOT/landing/files/pervyj-shag-pamyatka.pdf"
mkdir -p "$ROOT/landing/files"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --allow-file-access-from-files --virtual-time-budget=5000 \
  --print-to-pdf="$OUT" "file://$ROOT/print/first-step-memo.html" 2>/dev/null
echo "Готово: $OUT"
