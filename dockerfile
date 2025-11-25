# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Copy environment variables for build-time
# Make sure you have a .env.production file in your project root
COPY .env.production .env

# Build Next.js app
RUN npm run build

# Stage 2: Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules                                              
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/.env.production .env

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
