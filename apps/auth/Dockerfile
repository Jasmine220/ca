FROM node:alpine AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
RUN npm install -g pnpm
WORKDIR basic

COPY . ./json
COPY . ./full
RUN cd json && find . ! \
    -name 'package.json' ! \
    -name 'pnpm-workspace.yaml' ! \ 
    -name 'pnpm-lock.yaml' \
    -type f -exec rm {} +
RUN cd json && find . -type d \
    -regex '.*\(src\|node_modules\|build\)' \
    -exec rm -rf {} +

FROM node:alpine AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR basic

COPY --from=builder /basic/json/ .
RUN npx pnpm install

COPY --from=builder /basic/full/ .
RUN npx pnpm --filter auth... build

FROM node:alpine AS runner
WORKDIR basic
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
USER app
COPY --from=installer /basic .

CMD ["node", "apps/auth/build/ca.auth.js"]