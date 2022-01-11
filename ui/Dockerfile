FROM node:17.0.1

WORKDIR /usr/src/app/ui

RUN npm install -g npm@8.1.2
RUN npm install -g  @vue/cli
RUN npm install @vue/cli-plugin-babel


RUN npm install -g json-server

#to avoid issue with router with vue create
#RUN npm config set registry="http://registry.npmjs.org/"
#RUN npm cache clean --force

#RUN export NODE_OPTIONS=--openssl-legacy-provider

CMD npm install ; export NODE_OPTIONS=--openssl-legacy-provider ; npm run serve  

#ENTRYPOINT npm install && npm run serve
