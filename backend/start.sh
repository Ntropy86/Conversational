#!/bin/bash

# Conversational AI Backend Start Script
# This script starts the backend server with proper configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if virtual environment exists
check_venv() {
    if [ ! -d "venv" ]; then
        print_error "Virtual environment not found. Please run ./setup.sh first."
        exit 1
    fi
}

# Check if .env file exists
check_env() {
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from template..."
        cp env.example .env
        print_warning "Please edit .env file and add your API keys before starting the server."
        exit 1
    fi
}

# Check API keys
check_api_keys() {
    source .env
    
    if [ -z "$GROQ_API_KEY" ] || [ "$GROQ_API_KEY" = "your_groq_api_key_here" ]; then
        print_error "GROQ_API_KEY not set in .env file"
        print_warning "Please get your API key from https://console.groq.com/ and add it to .env"
        exit 1
    fi
    
    if [ -z "$ELEVENLABS_API_KEY" ] || [ "$ELEVENLABS_API_KEY" = "your_elevenlabs_api_key_here" ]; then
        print_error "ELEVENLABS_API_KEY not set in .env file"
        print_warning "Please get your API key from https://elevenlabs.io/ and add it to .env"
        exit 1
    fi
    
    print_success "API keys configured"
}

# Activate virtual environment
activate_venv() {
    print_status "Activating virtual environment..."
    source venv/bin/activate
    print_success "Virtual environment activated"
}

# Start the server
start_server() {
    print_status "Starting Conversational AI Backend..."
    echo
    echo "=========================================="
    echo "  Conversational AI Backend Server"
    echo "=========================================="
    echo
    echo "Server will be available at:"
    echo "  - Local: http://localhost:8000"
    echo "  - Network: http://0.0.0.0:8000"
    echo
    echo "API Documentation:"
    echo "  - Swagger UI: http://localhost:8000/docs"
    echo "  - ReDoc: http://localhost:8000/redoc"
    echo
    echo "Press Ctrl+C to stop the server"
    echo "=========================================="
    echo
    
    # Start the server with uvicorn
    uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload
}

# Main function
main() {
    print_status "Starting Conversational AI Backend..."
    
    # Pre-flight checks
    check_venv
    check_env
    activate_venv
    check_api_keys
    
    # Start server
    start_server
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --dev          Start in development mode with auto-reload"
        echo "  --prod         Start in production mode"
        echo
        echo "Environment variables:"
        echo "  GROQ_API_KEY           Required: Groq API key"
        echo "  ELEVENLABS_API_KEY     Required: ElevenLabs API key"
        echo "  WHISPER_MODEL_SIZE     Optional: Whisper model size (default: base)"
        echo "  VAD_THRESHOLD          Optional: VAD threshold (default: 0.8)"
        echo "  TTS_VOICE              Optional: TTS voice (default: en-US-AriaNeural)"
        echo "  DEBUG_MODE             Optional: Debug mode (default: false)"
        echo
        exit 0
        ;;
    --dev)
        print_status "Starting in development mode..."
        export DEBUG_MODE=true
        main
        ;;
    --prod)
        print_status "Starting in production mode..."
        export DEBUG_MODE=false
        main
        ;;
    *)
        main
        ;;
esac
