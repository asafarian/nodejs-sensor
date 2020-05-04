FROM node:12.16.1-alpine3.11 AS instana-aws-fargate-nodejs
WORKDIR /usr/src/instana-aws-fargate-package
COPY package.json ./
COPY instana-core*.tgz ./
COPY instana-serverless*.tgz ./
COPY instana-aws-fargate*.tgz ./
RUN npm install --only=production
