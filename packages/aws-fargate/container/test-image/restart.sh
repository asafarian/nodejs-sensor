set -eo pipefail

cd `dirname $BASH_SOURCE`

if [[ ! -f .env ]]; then
  echo .env file is missing
  exit 1
fi
source .env

if [[ -z "${containername-}" ]]; then
  echo Please set metadata_v3 in .env.
  exit 1
fi

docker stop $containername && docker start $containername --attach
