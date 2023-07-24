FROM node:15.12.0-alpine3.10

WORKDIR /usr/app

COPY package*.json /usr/app/

RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python3
RUN npm install --quiet node-gyp -g
RUN npm install -g pnpm
RUN pnpm install

COPY . .

RUN npm run build

ENV NODE_ENV production

RUN npm prune

EXPOSE 80 443 4000

CMD [ "npm", "start" ]