FROM node:12.16.1-alpine3.11 AS instana-aws-fargate-nodejs
WORKDIR /usr/src/instana-aws-fargate-package
COPY package.json ./
COPY instana-*.tgz ./

RUN apk add --no-cache --virtual .gyp \
        build-base \
        python \
    && npm install --only=production \
    && apk del .gyp
