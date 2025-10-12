#!/bin/bash

# Conversational AI Backend Setup Script
# This script sets up the complete backend environment

set -e  # Exit on any error

echo "🚀 Setting up Conversational AI Backend Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Python 3.9+ is installed
check_python() {
    print_status "Checking Python installation..."
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
        REQUIRED_VERSION="3.9"
        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            print_success "Python $PYTHON_VERSION found"
        else
            print_error "Python 3.9+ required, found $PYTHON_VERSION"
            exit 1
        fi
    else
        print_error "Python 3 not found. Please install Python 3.9+ first."
        exit 1
    fi
}

# Check if pip is installed
check_pip() {
    print_status "Checking pip installation..."
    if command -v pip3 &> /dev/null; then
        print_success "pip3 found"
    else
        print_error "pip3 not found. Please install pip first."
        exit 1
    fi
}

# Check if FFmpeg is installed
check_ffmpeg() {
    print_status "Checking FFmpeg installation..."
    if command -v ffmpeg &> /dev/null; then
        print_success "FFmpeg found"
    else
        print_warning "FFmpeg not found. Installing via package manager..."
        
        # Detect OS and install FFmpeg
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            if command -v apt-get &> /dev/null; then
                sudo apt-get update && sudo apt-get install -y ffmpeg
            elif command -v yum &> /dev/null; then
                sudo yum install -y ffmpeg
            elif command -v dnf &> /dev/null; then
                sudo dnf install -y ffmpeg
            else
                print_error "Could not install FFmpeg automatically. Please install it manually."
                exit 1
            fi
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            if command -v brew &> /dev/null; then
                brew install ffmpeg
            else
                print_error "Homebrew not found. Please install FFmpeg manually or install Homebrew first."
                exit 1
            fi
        else
            print_error "Unsupported OS. Please install FFmpeg manually."
            exit 1
        fi
    fi
}

# Create virtual environment
create_venv() {
    print_status "Creating Python virtual environment..."
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Virtual environment created"
    else
        print_warning "Virtual environment already exists"
    fi
}

# Activate virtual environment
activate_venv() {
    print_status "Activating virtual environment..."
    source venv/bin/activate
    print_success "Virtual environment activated"
}

# Install dependencies
install_dependencies() {
    print_status "Installing Python dependencies..."
    
    # Upgrade pip first
    pip install --upgrade pip
    
    # Install production dependencies
    print_status "Installing production dependencies..."
    # Check Python version and use appropriate requirements file
    PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
    if [[ "$PYTHON_VERSION" == "3.9"* ]]; then
        print_status "Using Python 3.9 compatible requirements..."
        pip install -r requirements-py39.txt
    else
        pip install -r requirements.txt
    fi
    
    # Install development dependencies if requested
    if [ "$1" = "--dev" ]; then
        print_status "Installing development dependencies..."
        pip install -r requirements-dev.txt
    fi
    
    print_success "Dependencies installed successfully"
}

# Create .env file
create_env_file() {
    print_status "Setting up environment file..."
    if [ ! -f ".env" ]; then
        cp env.example .env
        print_success "Created .env file from template"
        print_warning "Please edit .env file and add your API keys:"
        print_warning "  - GROQ_API_KEY: Get from https://console.groq.com/"
        print_warning "  - ELEVENLABS_API_KEY: Get from https://elevenlabs.io/"
    else
        print_warning ".env file already exists"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p audio_files
    mkdir -p logs
    mkdir -p temp
    print_success "Directories created"
}

# Test installation
test_installation() {
    print_status "Testing installation..."
    
    # Test Python imports
    python3 -c "
import sys
sys.path.append('.')
try:
    import fastapi
    import uvicorn
    import torch
    import torchaudio
    import soundfile
    import faster_whisper
    import edge_tts
    import groq
    import sentence_transformers
    import pydub
    import requests
    print('✅ All core dependencies imported successfully')
except ImportError as e:
    print(f'❌ Import error: {e}')
    sys.exit(1)
"
    
    if [ $? -eq 0 ]; then
        print_success "Installation test passed"
    else
        print_error "Installation test failed"
        exit 1
    fi
}

# Main setup function
main() {
    echo "=========================================="
    echo "  Conversational AI Backend Setup"
    echo "=========================================="
    echo
    
    # Check prerequisites
    check_python
    check_pip
    check_ffmpeg
    
    # Setup environment
    create_venv
    activate_venv
    install_dependencies $1
    create_env_file
    create_directories
    
    # Test installation
    test_installation
    
    echo
    echo "=========================================="
    print_success "Backend setup completed successfully!"
    echo "=========================================="
    echo
    echo "Next steps:"
    echo "1. Edit .env file and add your API keys"
    echo "2. Run: source venv/bin/activate"
    echo "3. Run: python api_server.py"
    echo "4. Test: python test_individual.py"
    echo
    echo "For development:"
    echo "- Run: pip install -r requirements-dev.txt"
    echo "- Run: pre-commit install"
    echo "- Run: pytest"
    echo
}

# Run main function with all arguments
main "$@"
