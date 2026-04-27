#!/usr/bin/env bash
# Pushes env vars to Vercel from .env.local for production + preview
set -e
ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

while IFS='=' read -r key value || [ -n "$key" ]; do
  # skip empty/comment
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  # trim
  key="${key// /}"
  # strip surrounding quotes
  value="${value%\"}"; value="${value#\"}"
  for env in production preview development; do
    printf "%s" "$value" | npx vercel env add "$key" "$env" --force >/dev/null 2>&1 || true
    echo "✓ $key ($env)"
  done
done < "$ENV_FILE"
