#!/usr/bin/env bash

set -eo pipefail

cd `dirname $BASH_SOURCE`

rm -rf instana-*.tgz

pushd ../../../core > /dev/null
rm -f instana-core-*.tgz
npm pack
mv instana-core-*.tgz ../aws-fargate/container/instana-aws-fargate
popd > /dev/null

pushd ../../../serverless > /dev/null
rm -f instana-serverless-*.tgz
npm pack
mv instana-serverless-*.tgz ../aws-fargate/container/instana-aws-fargate
popd > /dev/null

pushd ../.. > /dev/null
rm -f instana-aws-fargate-*.tgz
npm pack
mv instana-aws-fargate-*.tgz container/instana-aws-fargate
popd > /dev/null

dockerfile=Dockerfile
imagetag=instana-aws-fargate-nodejs

echo "Removing image $imagetag"
docker rmi -f $imagetag

echo "Building $dockerfile -> $imagetag"
docker build -f $dockerfile -t $imagetag .
echo "docker build exit status: $?"

