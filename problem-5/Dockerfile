FROM node:18

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn build || true

EXPOSE 3000

CMD ["yarn", "start"] 