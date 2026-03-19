FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/
COPY services/destination-service/package.json services/destination-service/
RUN pnpm install --frozen-lockfile

COPY packages/types/ packages/types/
COPY packages/config/ packages/config/
COPY services/destination-service/ services/destination-service/
RUN pnpm --filter @tripcraft/destination-service run db:generate
RUN pnpm --filter @tripcraft/destination-service run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/services/destination-service/dist ./dist
COPY --from=builder /app/services/destination-service/node_modules ./node_modules
COPY --from=builder /app/services/destination-service/prisma ./prisma

EXPOSE 3002
CMD ["node", "dist/server.js"]
