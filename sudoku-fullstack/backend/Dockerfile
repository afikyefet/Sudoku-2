# ---- Builder ----
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Runner ----
FROM node:18-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
EXPOSE 5000
ENV PORT=5000
# Optional CORS origins
ENV FRONTEND_URL=
ENV CORS_ORIGIN=
CMD ["node", "dist/server.js"]
