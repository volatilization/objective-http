#!/usr/bin/env bash
export LC_ALL=C
set -eo pipefail

# Debug: show loaded env files
[ -f .env ] && echo "[debug] Loading .env" && set -a && source .env && set +a
[ -f .common.env ] && echo "[debug] Loading .common.env" && set -a && source .common.env && set +a

echo "[debug] COVERAGE_MIN_PERCENT=${COVERAGE_MIN_PERCENT:-unset}"

# Capture test result even if tests fail
set +e
test_result=$(FORCE_COLOR=0 npm run test 2>&1)
test_exit_code=$?
set -e

echo "[debug] Test command completed (exit code: $test_exit_code)"
echo "$test_result"

if (($test_exit_code != 0)); then
    echo "[debug] Test faild!"
    exit 1;
fi

# Debug: show coverage report section extraction
coverage_report=$(echo "$test_result" | sed -n '/start of coverage report/,/end of coverage report/p')
echo "[debug] Coverage report section:"
echo "$coverage_report"

coverage_percent=$(
    echo "$coverage_report" \
    | grep '\.js' \
    | grep -v '/test/' \
    | grep -v 'index.js' \
    | awk -F'|' '{gsub(/ /, "", $2); s+=$2} END {if (s > 0) printf "%.2f", s/NR; else printf "%.2f", 0}'
)

echo "[debug] Calculated coverage_percent=$coverage_percent"

if (( $(echo "$coverage_percent < $COVERAGE_MIN_PERCENT" | bc -l) )); then
    echo "${coverage_percent} is not enough coverage percent (min: $COVERAGE_MIN_PERCENT)" >&2
    exit 1
fi

echo "${coverage_percent} is enough coverage percent (min: $COVERAGE_MIN_PERCENT)"
exit 0
