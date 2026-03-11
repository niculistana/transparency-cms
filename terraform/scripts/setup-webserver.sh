#!/bin/bash
# Update system
yum update -y

# Install required packages
yum install -y nginx unzip

# Install Node.js 20.x
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# Verify installations
node --version
npm --version
aws --version

# Create self-signed SSL certificate
mkdir -p /etc/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx.key \
  -out /etc/nginx/ssl/nginx.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Configure nginx to serve "transparency cms" over HTTPS
cat > /etc/nginx/nginx.conf <<'NGINXCONF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    server {
        listen 443 ssl;
        server_name _;
        
        ssl_certificate /etc/nginx/ssl/nginx.crt;
        ssl_certificate_key /etc/nginx/ssl/nginx.key;
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        
        # Proxy API requests to Node.js service
        location / {
            proxy_pass http://localhost:3000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
NGINXCONF

# Start and enable nginx
systemctl start nginx
systemctl enable nginx

# Download application from S3
echo "Downloading application from S3..."
mkdir -p /opt/transparency-cms
cd /opt/transparency-cms

# Download the deployment package from S3
aws s3 cp "s3://bettergov/transparency-cms-builds/dist-latest.zip" dist-latest.zip

# Unzip the application
echo "Extracting application..."
unzip -q dist-latest.zip
rm dist-latest.zip

# Install production dependencies
cd dist
echo "Installing dependencies..."
npm ci --production

# Set environment variables for the application
cat > /opt/transparency-cms/dist/.env <<ENVFILE
PORT=3000
NODE_ENV=production
AWS_CERTIFICATE_FILENAME=cert.pem
RDS_PSQL_CONNECTION_STRING=${RDS_PSQL_CONNECTION_STRING}
ENVFILE

# Set ownership to ec2-user
chown -R ec2-user:ec2-user /opt/transparency-cms

# Create systemd service for the application
cat > /etc/systemd/system/transparency-cms.service <<'SERVICE'
[Unit]
Description=Transparency CMS
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/transparency-cms/dist
ExecStart=/usr/bin/node build/server/index.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=transparency-cms

[Install]
WantedBy=multi-user.target
SERVICE

# Start and enable the application service
systemctl daemon-reload
systemctl start transparency-cms
systemctl enable transparency-cms

echo "Application deployed and started successfully"
