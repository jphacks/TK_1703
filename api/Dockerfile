FROM    node
ENV APP_ROOT /usr/src/banana-api

WORKDIR $APP_ROOT

COPY package.json $APP_ROOT
RUN npm install

COPY ./api.js $APP_ROOT
EXPOSE 8080
CMD ["npm", "start"]
