FROM node:16.9.0-alpine
WORKDIR /app
COPY package.json index.js /app/
RUN npm i
RUN npm i -g nodemon
CMD [ "nodemon", "index.js" ]
