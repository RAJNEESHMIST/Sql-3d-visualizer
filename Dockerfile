# Stage 1: Build dependency graph & next build
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies needed for node-gyp (if any)
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Disable Next telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root system user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and compiled output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.5.0"

CMD ["npm", "start"]
