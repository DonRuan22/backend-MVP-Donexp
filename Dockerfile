FROM node:13

WORKDIR /app

ADD . /app

RUN npm install

CMD npm start
