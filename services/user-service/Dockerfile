FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/
COPY services/user-service/package.json services/user-service/
RUN pnpm install --frozen-lockfile

COPY packages/types/ packages/types/
COPY packages/config/ packages/config/
COPY services/user-service/ services/user-service/
RUN pnpm --filter @tripcraft/user-service run db:generate
RUN pnpm --filter @tripcraft/user-service run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/services/user-service/dist ./dist
COPY --from=builder /app/services/user-service/node_modules ./node_modules
COPY --from=builder /app/services/user-service/prisma ./prisma

EXPOSE 3001
CMD ["node", "dist/server.js"]
