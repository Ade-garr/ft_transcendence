FROM node:17

WORKDIR /usr/src/app/api

COPY package*.json ./

# RUN mkdir node_modules

RUN npm i -g @nestjs/cli

EXPOSE 3000
ENTRYPOINT npm install && npm run start:dev
