#!/usr/bin/env bash

set -eo pipefail

cd `dirname $BASH_SOURCE`

if [[ ! -f .env ]]; then
  echo .env file is missing
  exit 1
fi
source .env

if [[ -z "${instana_endpoint_url-}" ]]; then
  echo Please set instana_endpoint_url in .env.
  exit 1
fi
if [[ -z "${instana_agent_key-}" ]]; then
  echo Please set instana_agent_key in .env.
  exit 1
fi
if [[ -z "${metadata_v3-}" ]]; then
  echo Please set metadata_v3 in .env.
  exit 1
fi

./build.sh

echo "Running container $containername from image $imagetag (reporting to $instana_endpoint_url/$instana_agent_key)"
docker \
  run \
  --env INSTANA_ENDPOINT_URL=$instana_endpoint_url \
  --env INSTANA_AGENT_KEY=$instana_agent_key \
  --env ECS_CONTAINER_METADATA_URI=$metadata_v3 \
  --env INSTANA_LOG_LEVEL=debug \
  -p 3000:3000 \
  --name $containername \
  $imagetag

