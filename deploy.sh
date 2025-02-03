#!/bin/bash

# Ensure the script exits on error
set -e

# Color variables for readability
RED='\033[1;31m'
BLUE='\033[1;34m'
YELLOW='\033[1;33m'
RESET='\033[0m'

# ASCII art for Cronos with color
echo -e "${RED}"
cat << "EOF"
  
   ____                           
  / ___|_ __ ___  _ __   ___  ___ 
 | |   | '__/ _ \| '_ \ / _ \/ __|
 | |___| | | (_) | | | | (_) \__ \
  \____|_|  \___/|_| |_|\___/|___/
                                  
  Production Deployment Script


EOF
echo -e "${RESET}"

# Ask for confirmation before proceeding
read -p "Do you need to update environment variables?" CONFIRMATION
case $CONFIRMATION in
  [yY][eE][sS]|[yY])
    echo -e "Please update the environment variables in the .env file and run the script again."
    exit 1
    ;;
  *)
    echo -e "${YELLOW}Skipping environment variable update...${RESET}"
    ;;
esac

# Define the environment and services
BRANCH="main"  # Set your production branch
TOTAL_TASKS=$(grep -c "\[TASK\]" "$0") # Count the number of tasks
COMPLETED_TASKS=0
SERVER_PM2_NAME="cronos-server"
CLIENT_PM2_NAME="cronos-client"

# Function to update progress
update_progress() {
  COMPL=$((COMPLETED_TASKS+1))
  echo -e "${GREEN}✅ Done! [$COMPL/$TOTAL_TASKS]${RESET}"
  COMPLETED_TASKS=$COMPL  # Update COMPLETED_TASKS directly
}

echo "${TOTAL_TASKS} tasks to complete."

# [TASK] Pull the latest code
echo -e "${RED}[CRONOS DEPLOY] Pulling latest code from ${BRANCH}...${RESET}"
git pull origin "$BRANCH"
update_progress

# [TASK] Install main project dependencies
echo -e "${RED}[CRONOS DEPLOY] Installing main project dependencies...${RESET}"
npm install
update_progress

# [TASK] Install server dependencies
echo -e "${YELLOW}[CRONOS DEPLOY] Setting up server application...${RESET}"
cd server
npm install
cd ..
update_progress

# [TASK] Install client dependencies
echo -e "${YELLOW}[CRONOS DEPLOY] Setting up client application...${RESET}"
cd client
npm install
cd ..
update_progress

# [TASK] Build the server
echo -e "${YELLOW}[CRONOS DEPLOY] Building server application...${RESET}"
cd server
npm install
npm run build
cd ..
update_progress

# [TASK] Build the client
echo -e "${YELLOW}[CRONOS DEPLOY] Skipping client building, live update is running...${RESET}"
update_progress

# [TASK] Verify Docker installation
echo -e "${BLUE}[CRONOS SETUP] Verifying Docker installation...${RESET}"
if ! command -v docker &>/dev/null 
then
  echo -e "${YELLOW}Docker is not installed. Please install Docker to proceed.${RESET}"
  exit 1
fi
update_progress

# [TASK] Build Docker image for script-runner
echo -e "${BLUE}[CRONOS SETUP] Building Docker image for script-runner...${RESET}"
cd server/docker || echo "Directory: server/opt/cronos/docker not found"
docker build -t script-runner .
cd ../..
update_progress

# [TASK] PM2 Restart Server
echo -e "${BLUE}[CRONOS DEPLOY] Restarting server with PM2...${RESET}"
pm2 restart "$SERVER_PM2_NAME" --update-env
update_progress

# [TASK] PM2 Restart Client 
echo -e "${BLUE}[CRONOS DEPLOY] Restarting client with PM2...${RESET}"
pm2 restart "$CLIENT_PM2_NAME" --update-env
update_progress

echo -e "${RED}[CRONOS DEPLOY] Deployment complete!${RESET}"
