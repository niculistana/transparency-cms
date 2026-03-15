#!/bin/bash
set -e

echo "Starting redeployment process..."

# Stop the service
echo "Stopping transparency-cms service..."
systemctl stop transparency-cms

# Change to application directory
cd /opt/transparency-cms

# Download latest build from S3
echo "Downloading latest build from S3..."
aws s3 cp "s3://bettergov/transparency-cms-builds/dist-latest.zip" dist-latest.zip

# Rename existing dist folder to old-dist
echo "Backing up current deployment..."
if [ -d "dist" ]; then
    rm -rf old-dist
    mv dist old-dist
fi

# Unzip the new deployment
echo "Extracting new deployment..."
unzip -q dist-latest.zip
rm dist-latest.zip

# Copy .env from old-dist to new dist
echo "Copying environment configuration..."
if [ -f "old-dist/.env" ]; then
    cp old-dist/.env dist/.env
else
    echo "Warning: No .env file found in old-dist"
fi

# Remove old-dist folder
echo "Cleaning up old deployment..."
rm -rf old-dist

# Install production dependencies
echo "Installing dependencies..."
cd dist
npm ci --production

# Set ownership to ec2-user
echo "Setting file permissions..."
chown -R ec2-user:ec2-user /opt/transparency-cms

# Restart the service
echo "Starting transparency-cms service..."
systemctl daemon-reload
systemctl start transparency-cms

# Check service status
echo "Checking service status..."
systemctl status transparency-cms --no-pager

echo "Redeployment completed successfully!"
