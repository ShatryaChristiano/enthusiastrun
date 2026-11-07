#!/bin/sh
# Build script used by Vercel (via "vercel-build" in package.json).
#
# Database migrations run ONLY when RUN_DB_MIGRATIONS=1 is set on the Vercel
# project (used for the enthusiastrun-preview project). Production deploys
# without that variable never touch the database schema during build —
# run `npx prisma migrate deploy` there deliberately.
set -e

npx prisma generate

if [ "$RUN_DB_MIGRATIONS" = "1" ]; then
  echo "RUN_DB_MIGRATIONS=1 → applying Prisma migrations"
  # Neon: migrations need the direct (non-pooled) connection
  DATABASE_URL="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}" npx prisma migrate deploy
fi

npx next build
