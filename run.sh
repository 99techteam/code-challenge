#!/bin/bash

# Navigate to the project root
cd "$(dirname "$0")"

echo "Starting Backend Server..."
(cd backend && npm run dev) &
BACKEND_PID=$!

echo "Starting Frontend Server..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo "Both servers are starting up!"
echo "Press [CTRL+C] to stop both servers."

# Catch CTRL+C and kill both background processes
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT

# Wait for both processes
wait $BACKEND_PID
wait $FRONTEND_PID
