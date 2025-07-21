# PowerShell script for Windows users
Write-Host "🧪 Running E2E Tests in Docker" -ForegroundColor Green
Write-Host "========================================"

# Function to cleanup on exit
function Cleanup {
    Write-Host "🧹 Cleaning up test containers..." -ForegroundColor Yellow
    docker-compose --profile test down
}

# Set cleanup trap
try {
    # Step 1: Start MySQL database
    Write-Host "📊 Starting MySQL database..." -ForegroundColor Yellow
    docker-compose up -d mysql

    # Wait for MySQL to be healthy
    Write-Host "⏳ Waiting for MySQL to be ready..." -ForegroundColor Yellow
    do {
        Start-Sleep -Seconds 2
        Write-Host -NoNewline "."
        $healthStatus = docker-compose ps mysql --format json | ConvertFrom-Json | Select-Object -ExpandProperty Health
    } while ($healthStatus -ne "healthy")
    
    Write-Host "`n✅ MySQL is ready!" -ForegroundColor Green

    # Step 2: Create test database and grant permissions
    Write-Host "🗄️ Setting up test database..." -ForegroundColor Yellow
    $dbSetupResult = docker-compose exec mysql mysql -u root -ppassword -e "CREATE DATABASE IF NOT EXISTS resources_test_db; GRANT ALL PRIVILEGES ON resources_test_db.* TO 'appuser'@'%'; FLUSH PRIVILEGES;" 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Test database setup complete!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to setup test database" -ForegroundColor Red
        exit 1
    }

    # Step 3: Run the tests
    Write-Host "🚀 Running E2E tests..." -ForegroundColor Yellow
    Write-Host "========================================"

    # Run tests with profile
    docker-compose --profile test run --rm test
    $testExitCode = $LASTEXITCODE

    # Step 4: Results
    Write-Host "========================================"
    if ($testExitCode -eq 0) {
        Write-Host "🎉 All tests passed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Some tests failed. Exit code: $testExitCode" -ForegroundColor Red
    }

    exit $testExitCode

} finally {
    Cleanup
} 