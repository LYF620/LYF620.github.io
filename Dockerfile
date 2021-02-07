FROM node:14.15.4-slim AS builder


WORKDIR /blog

COPY /blog /blog
RUN npm install \
&& npm i hexo-cli -g \
  &&  npm run build


