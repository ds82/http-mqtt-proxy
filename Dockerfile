FROM alpine:latest

WORKDIR /app
COPY . /app/

RUN apk add --update nodejs npm
RUN npm install
RUN npm run build

EXPOSE 3000
CMD [ "npm", "start" ]
