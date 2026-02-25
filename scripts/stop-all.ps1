$repoRoot = Split-Path -Parent $PSScriptRoot
$pidDir = Join-Path $PSScriptRoot 'pids'
$backendPidFile = Join-Path $pidDir '.backend.pid'
$frontendPidFile = Join-Path $pidDir '.frontend.pid'
$legacyBackendPidFile = Join-Path $repoRoot '.backend.pid'
$legacyFrontendPidFile = Join-Path $repoRoot '.frontend.pid'

function Stop-FromPidFile {
    param(
        [string]$pidFile,
        [string]$name
    )

    if (-not (Test-Path $pidFile)) {
        Write-Host "$name: no hay PID file ($pidFile)."
        return
    }

    $pid = Get-Content $pidFile | Select-Object -First 1
    if ([string]::IsNullOrWhiteSpace($pid)) {
        Remove-Item $pidFile -Force
        Write-Host "$name: PID vacío, limpiado."
        return
    }

    try {
        $proc = Get-Process -Id $pid -ErrorAction Stop
        Stop-Process -Id $proc.Id -Force
        Write-Host "$name detenido (PID $pid)." -ForegroundColor Green
    }
    catch {
        Write-Host "$name no estaba corriendo (PID $pid)." -ForegroundColor Yellow
    }

    Remove-Item $pidFile -Force
}

Stop-FromPidFile -pidFile $backendPidFile -name 'Backend terminal'
Stop-FromPidFile -pidFile $frontendPidFile -name 'Frontend terminal'
Stop-FromPidFile -pidFile $legacyBackendPidFile -name 'Backend terminal (legacy)'
Stop-FromPidFile -pidFile $legacyFrontendPidFile -name 'Frontend terminal (legacy)'
