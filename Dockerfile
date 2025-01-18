FROM node:22.12.0-alpine AS build

WORKDIR /usr/src/app

RUN apk add --no-cache ffmpeg

COPY package.json pnpm-lock.yaml ./

RUN corepack enable pnpm && pnpm install

COPY prisma ./prisma
RUN npx prisma generate || true

COPY . .
