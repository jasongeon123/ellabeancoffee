# Safe Dev Server Restart Script
# This script only kills Next.js dev server processes
# NEVER kills: Elgato StreamDeck, Claude Code CLI, or other system processes

Write-Host "[*] Identifying dev server processes..." -ForegroundColor Cyan

# Get all node processes with details
$allProcesses = Get-WmiObject Win32_Process -Filter "name like '%node%'" | Select-Object ProcessId, CommandLine

# Protected process patterns (NEVER kill these)
$protectedPatterns = @(
    "StreamDeck",           # Elgato StreamDeck
    "claude-code",          # Claude Code CLI
    "@anthropic-ai",        # Anthropic tools
    "Elgato"               # Any Elgato process
)

# Dev server patterns (safe to kill)
$devServerPatterns = @(
    "npm run dev",
    "next dev",
    "start-server.js"
)

$killedProcesses = 0

foreach ($process in $allProcesses) {
    $processId = $process.ProcessId
    $cmdLine = $process.CommandLine

    if (-not $cmdLine) {
        continue
    }

    # Check if this is a protected process
    $isProtected = $false
    foreach ($pattern in $protectedPatterns) {
        if ($cmdLine -like "*$pattern*") {
            $isProtected = $true
            Write-Host "[+] Protected: PID $processId ($pattern)" -ForegroundColor Green
            break
        }
    }

    if ($isProtected) {
        continue
    }

    # Check if this is a dev server process
    $isDevServer = $false
    foreach ($pattern in $devServerPatterns) {
        if ($cmdLine -like "*$pattern*") {
            $isDevServer = $true
            Write-Host "[-] Killing dev server: PID $processId" -ForegroundColor Yellow
            try {
                Stop-Process -Id $processId -Force -ErrorAction Stop
                $killedProcesses++
            } catch {
                Write-Host "[!] Could not kill PID $processId - may already be terminated" -ForegroundColor Red
            }
            break
        }
    }
}

Write-Host ""
if ($killedProcesses -eq 0) {
    Write-Host "[i] No dev server processes found to kill" -ForegroundColor Cyan
} else {
    Write-Host "[+] Killed $killedProcesses dev server process(es)" -ForegroundColor Green
    Write-Host "[*] Waiting 2 seconds for cleanup..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
}

# Regenerate Prisma client (in case schema changed)
Write-Host ""
Write-Host "[*] Regenerating Prisma client..." -ForegroundColor Cyan
npx prisma generate

# Start dev server
Write-Host ""
Write-Host "[*] Starting dev server..." -ForegroundColor Green
npm run dev
