#!/bin/bash

# Clinical Trial Matching System - Local Deployment Script
# This script sets up the complete system locally using Docker Compose

set -e

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_deps=()
    
    # Check Docker
    if ! command_exists docker; then
        missing_deps+=("Docker")
    fi
    
    # Check Docker Compose
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        missing_deps+=("Docker Compose")
    fi
    
    # Check Node.js
    if ! command_exists node; then
        missing_deps+=("Node.js")
    fi
    
    # Check npm
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    # Check Python
    if ! command_exists python3; then
        missing_deps+=("Python 3")
    fi
    
    # Check pip
    if ! command_exists pip3; then
        missing_deps+=("pip3")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Function to create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    
    if [ ! -f .env ]; then
        cp env.example .env
        print_warning "Created .env file from template. Please update with your API keys."
        print_status "Required environment variables:"
        echo "  - OPENAI_API_KEY"
        echo "  - ANTHROPIC_API_KEY"
        echo "  - AGENTVERSE_API_KEY"
        echo ""
        print_status "You can edit .env file now or continue and update it later."
        read -p "Press Enter to continue..."
    else
        print_success ".env file already exists"
    fi
}

# Function to install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Frontend dependencies installed"
    else
        print_success "Frontend dependencies already installed"
    fi
}

# Function to build frontend
build_frontend() {
    print_status "Building frontend..."
    
    npm run build
    print_success "Frontend built successfully"
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p .keys
    mkdir -p monitoring
    mkdir -p agents
    mkdir -p logs
    mkdir -p data/redis
    mkdir -p data/postgres
    mkdir -p data/prometheus
    
    print_success "Directories created"
}

# Function to start services
start_services() {
    print_status "Starting services with Docker Compose..."
    
    # Start all services
    docker-compose up -d
    
    print_success "Services started successfully"
}

# Function to wait for services
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        print_status "Checking services (attempt $attempt/$max_attempts)..."
        
        # Check if services are responding
        local all_ready=true
        
        # Check frontend
        if ! curl -s http://localhost:3000 >/dev/null 2>&1; then
            all_ready=false
            print_warning "Frontend not ready yet"
        fi
        
        # Check DFX
        if ! curl -s http://localhost:8000 >/dev/null 2>&1; then
            all_ready=false
            print_warning "DFX not ready yet"
        fi
        
        # Check Redis
        if ! docker exec redis redis-cli ping >/dev/null 2>&1; then
            all_ready=false
            print_warning "Redis not ready yet"
        fi
        
        # Check PostgreSQL
        if ! docker exec postgres pg_isready -U admin >/dev/null 2>&1; then
            all_ready=false
            print_warning "PostgreSQL not ready yet"
        fi
        
        if [ "$all_ready" = true ]; then
            print_success "All services are ready!"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Services failed to start within expected time"
            print_status "You can check service status with: docker-compose ps"
            print_status "And view logs with: docker-compose logs"
            exit 1
        fi
        
        attempt=$((attempt + 1))
        sleep 10
    done
}

# Function to deploy ICP canisters
deploy_canisters() {
    print_status "Deploying ICP canisters..."
    
    # Wait for DFX to be ready
    local max_attempts=20
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:8000 >/dev/null 2>&1; then
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "DFX failed to start within expected time"
            exit 1
        fi
        
        attempt=$((attempt + 1))
        sleep 5
    done
    
    # Deploy canisters
    docker exec dfx-local dfx deploy --network local
    
    print_success "ICP canisters deployed successfully"
}

# Function to start uAgents
start_uagents() {
    print_status "Starting uAgents..."
    
    # Start patient agent
    docker exec -d uagents-dev python -m uagents.run patient_agent
    
    # Start trial agent
    docker exec -d uagents-dev python -m uagents.run trial_agent
    
    # Start matching agent
    docker exec -d uagents-dev python -m uagents.run matching_agent
    
    print_success "uAgents started successfully"
}

# Function to show service status
show_status() {
    print_status "Service Status:"
    echo ""
    
    docker-compose ps
    
    echo ""
    print_status "Service URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  DFX Local: http://localhost:8000"
    echo "  Prometheus: http://localhost:9090"
    echo "  Grafana: http://localhost:3001 (admin/admin)"
    echo "  Redis: localhost:6379"
    echo "  PostgreSQL: localhost:5432"
    echo ""
    
    print_status "uAgents:"
    echo "  Patient Agent: Port 8002"
    echo "  Trial Agent: Port 8003"
    echo "  Matching Agent: Port 8004"
    echo ""
}

# Function to show useful commands
show_commands() {
    print_status "Useful Commands:"
    echo ""
    echo "  View logs:"
    echo "    docker-compose logs -f [service_name]"
    echo ""
    echo "  Stop services:"
    echo "    docker-compose down"
    echo ""
    echo "  Restart services:"
    echo "    docker-compose restart [service_name]"
    echo ""
    echo "  Access containers:"
    echo "    docker exec -it [container_name] bash"
    echo ""
    echo "  View metrics:"
    echo "    curl http://localhost:9090/metrics"
    echo ""
}

# Main deployment function
main() {
    echo "=========================================="
    echo "Clinical Trial Matching System Deployment"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Create environment file
    create_env_file
    
    # Install dependencies
    install_frontend_deps
    
    # Build frontend
    build_frontend
    
    # Create directories
    create_directories
    
    # Start services
    start_services
    
    # Wait for services
    wait_for_services
    
    # Deploy canisters
    deploy_canisters
    
    # Start uAgents
    start_uagents
    
    echo ""
    print_success "Deployment completed successfully!"
    echo ""
    
    # Show status and commands
    show_status
    show_commands
    
    print_status "You can now access the system at http://localhost:3000"
}

# Handle script arguments
case "${1:-}" in
    "status")
        show_status
        ;;
    "logs")
        if [ -n "${2:-}" ]; then
            docker-compose logs -f "$2"
        else
            docker-compose logs -f
        fi
        ;;
    "stop")
        print_status "Stopping services..."
        docker-compose down
        print_success "Services stopped"
        ;;
    "restart")
        print_status "Restarting services..."
        docker-compose restart
        print_success "Services restarted"
        ;;
    "clean")
        print_status "Cleaning up..."
        docker-compose down -v
        docker system prune -f
        print_success "Cleanup completed"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  (no args)  Deploy the complete system"
        echo "  status     Show service status"
        echo "  logs       Show service logs"
        echo "  stop       Stop all services"
        echo "  restart    Restart all services"
        echo "  clean      Stop and clean up all data"
        echo "  help       Show this help message"
        ;;
    *)
        main
        ;;
esac
