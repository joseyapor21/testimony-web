#!/bin/sh

# Set frontend to use local API (same container)
cat > /usr/share/nginx/html/config.js << EOF
window.APP_CONFIG = {
  API_URL: ''
};
EOF

# Create API .env file from environment variables
cat > /app/api/.env << EOF
MONGODB_URI=${MONGODB_URI:-mongodb://localhost:27017/emergency}
JWT_SECRET=${JWT_SECRET:-your-secret-key-change-in-production}
PORT=3001
EOF

echo "Starting Testimony App..."
echo "MongoDB: ${MONGODB_URI:-mongodb://localhost:27017/emergency}"

# Start supervisor (runs both nginx and node)
exec supervisord -c /etc/supervisord.conf
