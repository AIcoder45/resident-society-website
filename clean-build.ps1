# Clean Build Script for Windows/OneDrive
# Fixes EPERM errors by stopping Node processes and cleaning build folders

Write-Host "Cleaning build directories..." -ForegroundColor Cyan

# Stop any running Node processes
Write-Host "Stopping Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Clean .next folder
if (Test-Path .next) {
    Write-Host "Removing .next folder..." -ForegroundColor Yellow
    try {
        Remove-Item -Recurse -Force .next -ErrorAction Stop
        Write-Host "SUCCESS: .next folder removed" -ForegroundColor Green
    } catch {
        Write-Host "WARNING: Could not remove .next folder: $_" -ForegroundColor Red
        Write-Host "Try excluding .next from OneDrive sync" -ForegroundColor Yellow
        Write-Host "Or pause OneDrive sync temporarily" -ForegroundColor Yellow
    }
}

# Clean out folder
if (Test-Path out) {
    Write-Host "Removing out folder..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force out -ErrorAction SilentlyContinue
    Write-Host "SUCCESS: out folder removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Cleanup complete! You can now run: npm run build" -ForegroundColor Green
