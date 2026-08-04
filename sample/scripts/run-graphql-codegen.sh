#!/bin/sh

set -eu

# Load .env into the shell so the checks below match graphql-codegen's dotenv behavior.
if [ -f ".env" ]; then
  set -a
  . "./.env"
  set +a
fi
if [ -z "${CLOUD_DEVELOPER_KEY:-}" ] && [ -f "android/local.properties" ]; then
  CLOUD_DEVELOPER_KEY="$(sed -n 's/^GraphQLAuthKey=//p' android/local.properties | head -n 1)"
  export CLOUD_DEVELOPER_KEY
fi

if [ -z "${GRAPHQL_SERVER_URL:-}" ] && [ -f "android/local.properties" ]; then
  GRAPHQL_SERVER_URL="$(sed -n 's/^GraphQLServerUrl=//p' android/local.properties | head -n 1)"
  export GRAPHQL_SERVER_URL
fi

if [ -z "${CLOUD_DEVELOPER_KEY:-}" ]; then
  echo "Missing CLOUD_DEVELOPER_KEY. Set it in the environment, sample/.env, or sample/android/local.properties as GraphQLAuthKey." >&2
  exit 1
fi

if [ -z "${GRAPHQL_SERVER_URL:-}" ]; then
  echo "Missing GRAPHQL_SERVER_URL. Set it in the environment, sample/.env, or sample/android/local.properties as GraphQLServerUrl." >&2
  exit 1
fi

exec ./node_modules/.bin/graphql-codegen -r dotenv/config
