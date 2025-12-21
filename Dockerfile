# Build frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor

# Setup nginx
RUN mkdir -p /run/nginx
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy frontend build
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY --from=frontend-build /app/public/config.js /usr/share/nginx/html/config.js

# Setup API
WORKDIR /app/api
COPY api/package*.json ./
RUN npm ci --only=production
COPY api/src ./src

# Create supervisor config
RUN mkdir -p /etc/supervisor.d
COPY supervisord.conf /etc/supervisor.d/app.ini

# Copy entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
