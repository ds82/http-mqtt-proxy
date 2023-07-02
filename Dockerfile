FROM alpine:latest

WORKDIR /app
COPY . /app/

RUN apk add --update nodejs npm
RUN npm install
RUN npm run build

RUN rm -rf ./src
RUN npm prune --production

EXPOSE 3000
CMD [ "npm", "start" ]
