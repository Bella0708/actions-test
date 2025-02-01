FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --silent

COPY app.js .

EXPOSE 3000

CMD ["node", "app.js"]
