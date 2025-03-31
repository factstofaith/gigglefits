#!/bin/bash
# Start the TAP Integration Platform locally

# Terminal colors
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== TAP Integration Platform Local Startup ===${NC}"
echo -e "${YELLOW}Starting backend and frontend services...${NC}"

# Create a log directory
mkdir -p logs

# Start the backend in the background
echo -e "${YELLOW}Starting backend server on http://localhost:8000...${NC}"
cd backend && . venv/bin/activate && python run_local.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started with PID: ${BACKEND_PID}${NC}"

# Give the backend a moment to start
echo -e "${YELLOW}Waiting for backend to initialize...${NC}"
sleep 5

# Start the frontend in the background
echo -e "${YELLOW}Starting frontend server on http://localhost:3000...${NC}"
cd ../frontend && npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started with PID: ${FRONTEND_PID}${NC}"

echo ""
echo -e "${GREEN}==== TAP Integration Platform is starting ====${NC}"
echo -e "${GREEN}Backend:  http://localhost:8000${NC}"
echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}Login Credentials:${NC}"
echo -e "${BLUE}Username: ai-dev${NC}"
echo -e "${BLUE}Password: TAPintoAI!${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both services${NC}"

# Function to properly terminate both processes
cleanup() {
    echo -e "\n${YELLOW}Stopping services...${NC}"
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    echo -e "${GREEN}✓ Services stopped${NC}"
    exit 0
}

# Set up trap to catch Ctrl+C and other termination signals
trap cleanup SIGINT SIGTERM

# Keep the script running to allow for Ctrl+C to work
wait $BACKEND_PID $FRONTEND_PID