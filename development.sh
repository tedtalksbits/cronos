#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Color variables for readability
GREEN='\033[1;32m'
BLUE='\033[1;34m'
YELLOW='\033[1;33m'
RESET='\033[0m'

# ASCII art for Cronos with color
echo -e "${GREEN}"
cat << "EOF"
  
   ____                           
  / ___|_ __ ___  _ __   ___  ___ 
 | |   | '__/ _ \| '_ \ / _ \/ __|
 | |___| | | (_) | | | | (_) \__ \
  \____|_|  \___/|_| |_|\___/|___/
                                  
  Development Setup Script


EOF

# Define the development branch
BRANCH="dev"  # Set your development branch
TOTAL_TASKS=$(grep -c "\[TASK\]" "$0")
COMPLETED_TASKS=0

# Function to update progress
update_progress() {
  COMPL=$((COMPLETED_TASKS+1))
  echo -e "${GREEN}✅ Done! [$COMPL/$TOTAL_TASKS]${RESET}"
  COMPLETED_TASKS=$COMPL  # Update COMPLETED_TASKS directly
}

echo "${TOTAL_TASKS} tasks to complete."

# [TASK] Pull the latest code
echo -e "${BLUE}[CRONOS SETUP] Pulling latest code from ${BRANCH}...${RESET}"
git pull origin "$BRANCH" || true
update_progress

# [TASK] Install main project dependencies
echo -e "${BLUE}[CRONOS SETUP] Installing main project dependencies...${RESET}"
npm install
update_progress

# [TASK] Install server dependencies
echo -e "${YELLOW}[CRONOS SETUP] Setting up server application...${RESET}"
cd server
npm install
cd ..
update_progress

# [TASK] Install client dependencies
echo -e "${YELLOW}[CRONOS SETUP] Setting up client application...${RESET}"
cd client
npm install
cd ..
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

# [TASK] Start server and client in development mode using concurrently
echo -e "${GREEN}[CRONOS SETUP] Starting server and client applications in development mode...${RESET}"
npx concurrently -n SERVER,CLIENT -c blue,green "npm --prefix server run dev" "npm --prefix client run dev"
update_progress

echo -e "${GREEN}[CRONOS SETUP] Development setup complete! Server and client are running in development mode.${RESET}"
