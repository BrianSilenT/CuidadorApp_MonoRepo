$repoRoot = Split-Path -Parent $PSScriptRoot
$processFilesDir = Join-Path $PSScriptRoot 'pids'
$backendProcessFile = Join-Path $processFilesDir '.backend.pid'
$frontendProcessFile = Join-Path $processFilesDir '.frontend.pid'
$legacyBackendProcessFile = Join-Path $repoRoot '.backend.pid'
$legacyFrontendProcessFile = Join-Path $repoRoot '.frontend.pid'

function Stop-FromPidFile {
    param(
        [string]$processFile,
        [string]$name
    )

    if (-not (Test-Path $processFile)) {
        Write-Host ("{0}: no hay PID file ({1})." -f $name, $processFile)
        return
    }

    $processId = Get-Content $processFile | Select-Object -First 1
    if ([string]::IsNullOrWhiteSpace($processId)) {
        Remove-Item $processFile -Force
        Write-Host ("{0}: PID vacío, limpiado." -f $name)
        return
    }

    try {
        $proc = Get-Process -Id $processId -ErrorAction Stop
        Stop-Process -Id $proc.Id -Force
        Write-Host "$name detenido (PID $processId)." -ForegroundColor Green
    }
    catch {
        Write-Host "$name no estaba corriendo (PID $processId)." -ForegroundColor Yellow
    }

    Remove-Item $processFile -Force
}

Stop-FromPidFile -processFile $backendProcessFile -name 'Backend terminal'
Stop-FromPidFile -processFile $frontendProcessFile -name 'Frontend terminal'
Stop-FromPidFile -processFile $legacyBackendProcessFile -name 'Backend terminal (legacy)'
Stop-FromPidFile -processFile $legacyFrontendProcessFile -name 'Frontend terminal (legacy)'
