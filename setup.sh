#!/usr/bin/env bash
set -e
cp env.sample .env
read -rp "Site URL (e.g., https://trialsage.acme.com): " BASE
awk -v b="$BASE" '{sub(/^BASE_URL=.*/,"BASE_URL="b);print}' .env > .env.tmp && mv .env.tmp .env
docker-compose pull
docker-compose build
printf '\nRun: docker-compose up -d\n'
