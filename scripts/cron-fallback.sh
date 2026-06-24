#!/usr/bin/env bash
# Fallback local: dispara workflow do GitHub Actions só se ele não rodou com sucesso hoje.
# Existe porque o cron nativo do GitHub Actions as vezes atrasa ou nao dispara.
set -euo pipefail

WORKFLOW="$1"
REPO="TrveLeo/religious"
TODAY=$(date -u +%Y-%m-%d)

LAST_SUCCESS=$(gh api "repos/${REPO}/actions/workflows/${WORKFLOW}/runs?status=success&per_page=5" \
  --jq ".workflow_runs[] | select(.created_at | startswith(\"${TODAY}\")) | .created_at" | head -1)

if [ -n "$LAST_SUCCESS" ]; then
  echo "$(date -Is) ${WORKFLOW}: já rodou com sucesso hoje (${LAST_SUCCESS}), pulando."
  exit 0
fi

echo "$(date -Is) ${WORKFLOW}: nao rodou hoje, disparando manual."
gh workflow run "$WORKFLOW" -R "$REPO"
