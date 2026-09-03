#!/usr/bin/env bash
export LC_ALL=C
set -eo pipefail

[ -f .env ] && set -a && source .env && set +a
[ -f .common.env ] && set -a && source .common.env && set +a

test_result=$(FORCE_COLOR=0 npm run test)

echo "$test_result"

coverage_percent=$(
    echo "$test_result" \
    | sed -n '/start of coverage report/,/end of coverage report/p' \
    | grep '\.js' \
    | grep -v '/test/' \
    | grep -v 'index.js' \
    | awk -F'|' '{gsub(/ /, "", $2); s+=$2} END {if (s > 0) printf "%.2f", s/NR; else printf "%.2f", 0}'
)

if (( $(echo "$coverage_percent < $COVERAGE_MIN_PERCENT" | bc -l) )); then
    echo "${coverage_percent} is not enough coverage percent" >&2
    exit 1
fi

echo "${coverage_percent} is enough coverage percent"
exit 0
