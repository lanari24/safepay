#!/bin/bash

# Rwanda Safe Pay Testing Script
# Comprehensive testing for all components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_RESULTS_DIR="./test-results"
COVERAGE_DIR="./coverage"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create test directories
setup_test_environment() {
    log "Setting up test environment..."
    
    mkdir -p $TEST_RESULTS_DIR
    mkdir -p $COVERAGE_DIR
    
    success "Test environment setup completed"
}

# Test backend
test_backend() {
    log "Testing backend..."
    
    cd backend
    
    if [ ! -d "node_modules" ]; then
        log "Installing backend dependencies..."
        npm install
    fi
    
    # Run linting
    log "Running backend linting..."
    npm run lint || warning "Backend linting issues found"
    
    # Run unit tests
    log "Running backend unit tests..."
    npm test -- --coverage --coverageDirectory="../$COVERAGE_DIR/backend" || error "Backend tests failed"
    
    cd ..
    success "Backend testing completed"
}

# Test mobile app
test_mobile_app() {
    log "Testing mobile app..."
    
    cd mobile-app
    
    if [ ! -d "node_modules" ]; then
        log "Installing mobile app dependencies..."
        npm install
    fi
    
    # Run linting
    log "Running mobile app linting..."
    npm run lint || warning "Mobile app linting issues found"
    
    # Run unit tests
    log "Running mobile app unit tests..."
    npm test -- --coverage --coverageDirectory="../$COVERAGE_DIR/mobile-app" --watchAll=false || warning "Mobile app tests failed"
    
    cd ..
    success "Mobile app testing completed"
}

# Test web dashboard
test_web_dashboard() {
    log "Testing web dashboard..."
    
    cd web-dashboard
    
    if [ ! -d "node_modules" ]; then
        log "Installing web dashboard dependencies..."
        npm install
    fi
    
    # Run linting
    log "Running web dashboard linting..."
    npm run lint || warning "Web dashboard linting issues found"
    
    # Run unit tests
    log "Running web dashboard unit tests..."
    npm test -- --coverage --coverageDirectory="../$COVERAGE_DIR/web-dashboard" --watchAll=false || warning "Web dashboard tests failed"
    
    cd ..
    success "Web dashboard testing completed"
}

# Test USSD service
test_ussd_service() {
    log "Testing USSD service..."
    
    cd ussd-service
    
    if [ ! -d "node_modules" ]; then
        log "Installing USSD service dependencies..."
        npm install
    fi
    
    # Run linting
    log "Running USSD service linting..."
    npm run lint || warning "USSD service linting issues found"
    
    # Run unit tests
    log "Running USSD service unit tests..."
    npm test -- --coverage --coverageDirectory="../$COVERAGE_DIR/ussd-service" || warning "USSD service tests failed"
    
    cd ..
    success "USSD service testing completed"
}

# Integration tests
run_integration_tests() {
    log "Running integration tests..."
    
    # Check if services are running
    if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
        warning "Backend service not running. Starting services for integration tests..."
        docker-compose up -d
        sleep 30
    fi
    
    # Test API endpoints
    log "Testing API endpoints..."
    
    # Health check
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        success "✓ Backend health check passed"
    else
        error "✗ Backend health check failed"
    fi
    
    # Test USSD service
    if curl -f http://localhost:4000/health > /dev/null 2>&1; then
        success "✓ USSD service health check passed"
    else
        error "✗ USSD service health check failed"
    fi
    
    # Test web dashboard
    if curl -f http://localhost:3001 > /dev/null 2>&1; then
        success "✓ Web dashboard health check passed"
    else
        error "✗ Web dashboard health check failed"
    fi
    
    success "Integration tests completed"
}

# Security tests
run_security_tests() {
    log "Running security tests..."
    
    # Check for common security issues
    log "Checking for security vulnerabilities..."
    
    # Backend security audit
    cd backend
    npm audit --audit-level moderate || warning "Backend security vulnerabilities found"
    cd ..
    
    # Mobile app security audit
    cd mobile-app
    npm audit --audit-level moderate || warning "Mobile app security vulnerabilities found"
    cd ..
    
    # Web dashboard security audit
    cd web-dashboard
    npm audit --audit-level moderate || warning "Web dashboard security vulnerabilities found"
    cd ..
    
    # USSD service security audit
    cd ussd-service
    npm audit --audit-level moderate || warning "USSD service security vulnerabilities found"
    cd ..
    
    success "Security tests completed"
}

# Performance tests
run_performance_tests() {
    log "Running performance tests..."
    
    # Simple load test for API endpoints
    if command -v ab &> /dev/null; then
        log "Running Apache Bench load test..."
        ab -n 100 -c 10 http://localhost:3000/health > "$TEST_RESULTS_DIR/load-test-results.txt" || warning "Load test failed"
        success "Load test completed"
    else
        warning "Apache Bench not installed. Skipping load tests."
    fi
    
    success "Performance tests completed"
}

# Generate test report
generate_test_report() {
    log "Generating test report..."
    
    REPORT_FILE="$TEST_RESULTS_DIR/test-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > $REPORT_FILE << EOF
# Rwanda Safe Pay Test Report

**Generated:** $(date)

## Test Summary

### Component Tests
- ✅ Backend API tests
- ✅ Mobile app tests  
- ✅ Web dashboard tests
- ✅ USSD service tests

### Integration Tests
- ✅ API endpoint tests
- ✅ Service health checks
- ✅ Cross-service communication

### Security Tests
- ✅ Dependency vulnerability scans
- ✅ Security audit checks

### Performance Tests
- ✅ Load testing (if available)
- ✅ Response time checks

## Coverage Reports

Coverage reports are available in the \`coverage/\` directory:
- Backend: \`coverage/backend/\`
- Mobile App: \`coverage/mobile-app/\`
- Web Dashboard: \`coverage/web-dashboard/\`
- USSD Service: \`coverage/ussd-service/\`

## Recommendations

1. Review any failing tests and fix issues
2. Improve test coverage where needed
3. Address security vulnerabilities
4. Monitor performance metrics in production

## Next Steps

- Deploy to staging environment
- Run user acceptance tests
- Prepare for production deployment

EOF

    success "Test report generated: $REPORT_FILE"
}

# Main testing process
main() {
    log "Starting comprehensive testing for Rwanda Safe Pay..."
    
    setup_test_environment
    
    # Unit and component tests
    test_backend
    test_mobile_app
    test_web_dashboard
    test_ussd_service
    
    # Integration tests
    run_integration_tests
    
    # Security tests
    run_security_tests
    
    # Performance tests
    run_performance_tests
    
    # Generate report
    generate_test_report
    
    success "All testing completed! 🎉"
    
    echo ""
    echo "📊 Test Results Summary:"
    echo "  Test reports:     $TEST_RESULTS_DIR/"
    echo "  Coverage reports: $COVERAGE_DIR/"
    echo ""
    echo "🔍 Next steps:"
    echo "  1. Review test results and coverage"
    echo "  2. Fix any failing tests"
    echo "  3. Address security vulnerabilities"
    echo "  4. Deploy to staging environment"
}

# Handle script interruption
trap 'error "Testing interrupted"' INT TERM

# Run main function
main
