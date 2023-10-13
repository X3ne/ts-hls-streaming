###############
# Development #
###############

FROM node:18.15.0-alpine as development

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

#########
# Build #
#########

FROM node:18.15.0-alpine as build

WORKDIR /usr/src/app

ENV NODE_ENV production

COPY --chown=node:node --from=development package*.json .

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npm run build

RUN npm install --package-lock-only

RUN npm ci --only=production --omit=dev && npm cache clean --force

USER node

##############
# Production #
##############

FROM node:18.15.0-alpine as production

WORKDIR /usr/src/app

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules

COPY --chown=node:node --from=build /usr/src/app/dist ./dist

COPY --chown=node:node --from=build /usr/src/app/docs ./docs

USER node

CMD ["node", "dist/index"]
