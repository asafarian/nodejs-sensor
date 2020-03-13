FROM node:12.16.1-alpine3.11
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY . .

COPY --from=instana-aws-fargate-nodejs /usr/src/instana-aws-fargate-package /usr/src/instana-aws-fargate

EXPOSE 3000
ENTRYPOINT [ "node", "--require", "/usr/src/instana-aws-fargate/node_modules/@instana/aws-fargate", "." ]
