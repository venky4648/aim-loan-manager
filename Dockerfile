# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package definitions
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project source files
COPY . .

# Build with Nitro node-server preset
ENV NITRO_PRESET=node-server
RUN npm run build

# Stage 2: Production runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80
ENV HOST=0.0.0.0

# Copy compiled output from builder
COPY --from=builder /app/.output ./.output

EXPOSE 80

CMD ["node", ".output/server/index.mjs"]
