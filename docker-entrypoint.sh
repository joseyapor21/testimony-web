#!/bin/sh

# Replace API_URL in config.js if environment variable is set
if [ -n "$API_URL" ]; then
  echo "Setting API_URL to: $API_URL"
  cat > /usr/share/nginx/html/config.js << EOF
window.APP_CONFIG = {
  API_URL: '$API_URL'
};
EOF
fi

# Start nginx
exec nginx -g 'daemon off;'
