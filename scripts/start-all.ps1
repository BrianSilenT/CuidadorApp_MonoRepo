$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $repoRoot 'backend-flask'
$frontendPath = Join-Path $repoRoot 'frontend'
$pidDir = Join-Path $PSScriptRoot 'pids'
$backendVenvPath = Join-Path $backendPath '.venv'
$backendPython = Join-Path $backendVenvPath 'Scripts\python.exe'
$backendEnv = Join-Path $backendPath '.env'
$frontendEnv = Join-Path $frontendPath '.env.local'

Write-Host '== CuidadorApp Arranque Total ==' -ForegroundColor Cyan
Write-Host "Repo: $repoRoot"

if (-not (Test-Path $backendPath)) { throw 'No se encontró backend-flask.' }
if (-not (Test-Path $frontendPath)) { throw 'No se encontró frontend.' }

if (-not (Test-Path $backendEnv)) {
    @"
DATABASE_URL=sqlite:///cuidadorapp.db
FLASK_APP=run.py
FLASK_ENV=development
JWT_SECRET_KEY=dev-secret-key-local-32chars-minimum-2026
"@ | Set-Content -Path $backendEnv -Encoding UTF8
    Write-Host 'Se creó backend-flask/.env con configuración local SQLite.' -ForegroundColor Yellow
}

if (-not (Test-Path $backendVenvPath)) {
    Write-Host 'Creando entorno virtual backend-flask/.venv ...' -ForegroundColor Yellow
    Push-Location $backendPath
    python -m venv .venv
    Pop-Location
}

Write-Host 'Instalando/actualizando dependencias backend...' -ForegroundColor Yellow
Push-Location $backendPath
& $backendPython -m pip install --upgrade pip | Out-Host
& $backendPython -m pip install -r requirements.txt | Out-Host

Write-Host 'Ejecutando migraciones...' -ForegroundColor Yellow
$env:FLASK_APP = 'run.py'
& $backendPython -m flask db upgrade | Out-Host

Write-Host 'Ejecutando seed de usuarios de prueba...' -ForegroundColor Yellow
& $backendPython seed.py | Out-Host
Pop-Location

if (-not (Test-Path $frontendEnv)) {
    "VITE_API_BASE_URL=http://127.0.0.1:5000" | Set-Content -Path $frontendEnv -Encoding UTF8
    Write-Host 'Se creó frontend/.env.local apuntando al backend local.' -ForegroundColor Yellow
}

Write-Host 'Instalando dependencias frontend...' -ForegroundColor Yellow
Push-Location $frontendPath
npm install | Out-Host
Pop-Location

$backendPidFile = Join-Path $pidDir '.backend.pid'
$frontendPidFile = Join-Path $pidDir '.frontend.pid'
$legacyBackendPidFile = Join-Path $repoRoot '.backend.pid'
$legacyFrontendPidFile = Join-Path $repoRoot '.frontend.pid'

if (-not (Test-Path $pidDir)) {
    New-Item -Path $pidDir -ItemType Directory | Out-Null
}

if (Test-Path $backendPidFile) { Remove-Item $backendPidFile -Force }
if (Test-Path $frontendPidFile) { Remove-Item $frontendPidFile -Force }
if (Test-Path $legacyBackendPidFile) { Remove-Item $legacyBackendPidFile -Force }
if (Test-Path $legacyFrontendPidFile) { Remove-Item $legacyFrontendPidFile -Force }

Write-Host 'Levantando backend en nueva terminal...' -ForegroundColor Green
$backendProc = Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$backendPath'; & '$backendPython' run.py"
) -PassThru
$backendProc.Id | Set-Content -Path $backendPidFile -Encoding UTF8

Write-Host 'Levantando frontend en nueva terminal...' -ForegroundColor Green
$frontendProc = Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$frontendPath'; npm run dev"
) -PassThru
$frontendProc.Id | Set-Content -Path $frontendPidFile -Encoding UTF8

Write-Host ''
Write-Host 'Aplicación iniciada.' -ForegroundColor Cyan
Write-Host "Backend:  http://127.0.0.1:5000"
Write-Host "Frontend: http://127.0.0.1:3000"
Write-Host ''
Write-Host 'Usuarios de prueba:' -ForegroundColor Cyan
Write-Host '  admin@cuidadorapp.com / admin123'
Write-Host '  cuidador@cuidadorapp.com / cuidador123'
Write-Host '  familia@cuidadorapp.com / familia123'
Write-Host ''
Write-Host "Para detener ambos: .\scripts\stop-all.ps1"
