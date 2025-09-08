#!/bin/bash

# Docker Configuration Validator
# Validates Docker files without requiring Docker to be running

echo "🔍 Docker Configuration Validator"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required Docker files exist
check_docker_files() {
    print_info "Checking Docker files..."
    
    local files=("Dockerfile" "Dockerfile.dev" "docker-compose.yml" ".dockerignore")
    local missing=0
    
    for file in "${files[@]}"; do
        if [[ -f "$file" ]]; then
            print_success "$file exists"
        else
            print_error "$file is missing"
            missing=$((missing + 1))
        fi
    done
    
    if [[ $missing -eq 0 ]]; then
        print_success "All required Docker files are present"
    else
        print_error "$missing Docker files are missing"
        exit 1
    fi
}

# Validate Dockerfile syntax
validate_dockerfile() {
    print_info "Validating Dockerfile syntax..."
    
    # Check if Dockerfile has required instructions
    if grep -q "FROM" Dockerfile && grep -q "WORKDIR" Dockerfile && grep -q "COPY" Dockerfile && grep -q "RUN" Dockerfile && grep -q "CMD" Dockerfile; then
        print_success "Dockerfile has required instructions"
    else
        print_error "Dockerfile is missing required instructions"
        return 1
    fi
    
    # Check for multi-stage build
    if grep -q "AS builder" Dockerfile && grep -q "AS production" Dockerfile; then
        print_success "Multi-stage build detected"
    else
        print_error "Multi-stage build not found"
        return 1
    fi
    
    # Check for security best practices
    if grep -q "adduser\|addgroup" Dockerfile; then
        print_success "Non-root user configuration found"
    else
        print_error "Non-root user not configured"
        return 1
    fi
}

# Validate development Dockerfile
validate_dev_dockerfile() {
    print_info "Validating development Dockerfile..."
    
    if [[ -f "Dockerfile.dev" ]]; then
        if grep -q "FROM" Dockerfile.dev && grep -q "npm.*dev" Dockerfile.dev; then
            print_success "Development Dockerfile is valid"
        else
            print_error "Development Dockerfile has issues"
            return 1
        fi
    fi
}

# Validate docker-compose.yml
validate_docker_compose() {
    print_info "Validating docker-compose.yml..."
    
    # Check for required sections
    if grep -q "version:" docker-compose.yml && grep -q "services:" docker-compose.yml; then
        print_success "Docker Compose structure is valid"
    else
        print_error "Docker Compose structure is invalid"
        return 1
    fi
    
    # Check for health checks
    if grep -q "healthcheck:" docker-compose.yml; then
        print_success "Health checks configured"
    else
        print_error "Health checks not configured"
        return 1
    fi
    
    # Check for volume mounts
    if grep -q "volumes:" docker-compose.yml; then
        print_success "Volume mounts configured"
    else
        print_error "Volume mounts not configured"
        return 1
    fi
}

# Check package.json for Docker scripts
check_docker_scripts() {
    print_info "Checking Docker scripts in package.json..."
    
    if [[ -f "package.json" ]]; then
        if grep -q "docker:" package.json; then
            print_success "Docker scripts found in package.json"
        else
            print_error "Docker scripts not found in package.json"
            return 1
        fi
    else
        print_error "package.json not found"
        return 1
    fi
}

# Check .dockerignore
check_dockerignore() {
    print_info "Checking .dockerignore..."
    
    if [[ -f ".dockerignore" ]]; then
        if grep -q "node_modules" .dockerignore && grep -q "*.log" .dockerignore; then
            print_success ".dockerignore is properly configured"
        else
            print_error ".dockerignore is missing important exclusions"
            return 1
        fi
    else
        print_error ".dockerignore not found"
        return 1
    fi
}

# Validate project structure for Docker
check_project_structure() {
    print_info "Checking project structure..."
    
    local required_dirs=("src" "scripts")
    local required_files=("package.json" "tsconfig.json")
    
    for dir in "${required_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            print_success "Directory $dir exists"
        else
            print_error "Directory $dir is missing"
            return 1
        fi
    done
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            print_success "File $file exists"
        else
            print_error "File $file is missing"
            return 1
        fi
    done
}

# Main validation function
main() {
    echo ""
    print_info "Starting Docker configuration validation..."
    echo ""
    
    local failures=0
    
    # Run all validations
    check_docker_files || failures=$((failures + 1))
    validate_dockerfile || failures=$((failures + 1))
    validate_dev_dockerfile || failures=$((failures + 1))
    validate_docker_compose || failures=$((failures + 1))
    check_docker_scripts || failures=$((failures + 1))
    check_dockerignore || failures=$((failures + 1))
    check_project_structure || failures=$((failures + 1))
    
    echo ""
    
    if [[ $failures -eq 0 ]]; then
        print_success "🎉 All Docker configurations are valid!"
        echo ""
        echo "✅ Ready for Docker deployment when Docker is available"
        echo ""
        echo "Next steps:"
        echo "  1. Install and start Docker"
        echo "  2. Run: ./test-docker.sh (full Docker testing)"
        echo "  3. Deploy: docker-compose up -d"
        echo ""
    else
        print_error "❌ $failures validation(s) failed"
        echo ""
        echo "Please fix the issues above before proceeding with Docker deployment."
        exit 1
    fi
}

# Run validation
main "$@"
