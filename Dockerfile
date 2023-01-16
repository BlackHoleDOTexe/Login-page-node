FROM node:14-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install

RUN npm install sqlite3

RUN npm install express

RUN npm install bcrypt

RUN npm install body-parser

EXPOSE 3000

CMD ["node","index.js"]