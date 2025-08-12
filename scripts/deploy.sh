#!/bin/bash

# Rwanda Safe Pay Deployment Script
# This script handles the deployment of the Rwanda Safe Pay platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
PROJECT_NAME="rwanda-safe-pay"
BACKUP_DIR="./backups"
LOG_FILE="./deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if Node.js is installed (for local development)
    if ! command -v node &> /dev/null; then
        warning "Node.js is not installed. Some development features may not work."
    fi
    
    success "Prerequisites check completed"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p $BACKUP_DIR
    mkdir -p ./logs
    mkdir -p ./backend/uploads
    mkdir -p ./nginx/ssl
    
    success "Directories created"
}

# Setup environment files
setup_environment() {
    log "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "./backend/.env" ]; then
        log "Creating backend .env file from example..."
        cp ./backend/.env.example ./backend/.env
        warning "Please update ./backend/.env with your actual configuration values"
    fi
    
    # USSD service environment
    if [ ! -f "./ussd-service/.env" ]; then
        log "Creating USSD service .env file from example..."
        cp ./ussd-service/.env.example ./ussd-service/.env
        warning "Please update ./ussd-service/.env with your actual configuration values"
    fi
    
    success "Environment files setup completed"
}

# Build and start services
deploy_services() {
    log "Building and starting services..."
    
    case $ENVIRONMENT in
        "development")
            log "Starting development environment..."
            docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
            ;;
        "production")
            log "Starting production environment..."
            docker-compose up --build -d
            ;;
        *)
            error "Invalid environment: $ENVIRONMENT. Use 'development' or 'production'"
            ;;
    esac
    
    success "Services started successfully"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        success "Backend service is healthy"
    else
        error "Backend service health check failed"
    fi
    
    # Check web dashboard
    if curl -f http://localhost:3001 > /dev/null 2>&1; then
        success "Web dashboard is healthy"
    else
        error "Web dashboard health check failed"
    fi
    
    # Check USSD service
    if curl -f http://localhost:4000/health > /dev/null 2>&1; then
        success "USSD service is healthy"
    else
        error "USSD service health check failed"
    fi
    
    success "All health checks passed"
}

# Backup existing data
backup_data() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Creating backup..."
        
        BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
        
        # Create backup of uploads and logs
        tar -czf $BACKUP_FILE ./backend/uploads ./logs 2>/dev/null || true
        
        success "Backup created: $BACKUP_FILE"
    fi
}

# Show deployment information
show_deployment_info() {
    log "Deployment completed successfully!"
    echo ""
    echo "🇷🇼 Rwanda Safe Pay Platform is now running:"
    echo ""
    echo "📱 Backend API:        http://localhost:3000"
    echo "🖥️  Web Dashboard:     http://localhost:3001"
    echo "📞 USSD Service:       http://localhost:4000"
    echo "📊 Health Checks:      http://localhost:3000/health"
    echo ""
    echo "📋 Useful commands:"
    echo "  View logs:           docker-compose logs -f"
    echo "  Stop services:       docker-compose down"
    echo "  Restart services:    docker-compose restart"
    echo "  Update services:     ./scripts/deploy.sh $ENVIRONMENT"
    echo ""
    echo "📁 Important files:"
    echo "  Backend config:      ./backend/.env"
    echo "  USSD config:         ./ussd-service/.env"
    echo "  Deployment logs:     $LOG_FILE"
    echo ""
    
    if [ "$ENVIRONMENT" = "development" ]; then
        echo "🔧 Development mode:"
        echo "  Install deps:        npm run install-all"
        echo "  Run tests:           npm test"
        echo "  Development server:  npm run dev"
        echo ""
    fi
    
    echo "For more information, see README.md and docs/"
}

# Main deployment process
main() {
    log "Starting Rwanda Safe Pay deployment..."
    log "Environment: $ENVIRONMENT"
    
    check_prerequisites
    create_directories
    setup_environment
    backup_data
    deploy_services
    health_check
    show_deployment_info
    
    success "Deployment completed successfully! 🎉"
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main
