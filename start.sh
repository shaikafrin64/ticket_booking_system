#!/bin/bash
echo "=== Starting Stadium Booking System ==="

# Backend
echo "Starting Spring Boot backend on :8080..."
source ~/.sdkman/bin/sdkman-init.sh
cd "$(dirname "$0")/backend"
./mvnw spring-boot:run &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Frontend
echo "Starting React frontend on :3000..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
cd "$(dirname "$0")/frontend"
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "===========================================" 
echo "  Backend:  http://localhost:8080"
echo "  Frontend: http://localhost:5173"
echo "  H2 Console: http://localhost:8080/h2-console"
echo "  Admin:    admin@stadium.com / admin123"
echo "  User:     user@stadium.com / user123"
echo "==========================================="
echo "Press Ctrl+C to stop both servers"

wait $BACKEND_PID $FRONTEND_PID
