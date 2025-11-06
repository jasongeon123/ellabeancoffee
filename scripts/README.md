# Safe Dev Server Management

## Protected Processes

The following processes are **NEVER** killed by the safe restart scripts:

- **Elgato StreamDeck** - Hardware controller processes
- **Claude Code CLI** - AI assistant session
- **Anthropic AI tools** - Development assistant tools
- Any other Elgato-related processes

## Safe to Kill

These processes are managed by the restart script:

- `npm run dev` - Dev server launcher
- `next dev` - Next.js CLI process
- `start-server.js` - Next.js development server

## Usage

### Option 1: NPM Script (Recommended)
```bash
npm run dev:restart
```

### Option 2: Batch File
```bash
.\scripts\safe-restart-dev.bat
```

### Option 3: PowerShell Direct
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\safe-restart-dev.ps1
```

## What the Script Does

1. 🔍 **Identifies** all running Node.js processes
2. ✓ **Protects** system and tool processes (Elgato, Claude Code)
3. 🔴 **Kills** only Next.js dev server processes
4. 🔄 **Regenerates** Prisma client (in case schema changed)
5. 🚀 **Starts** fresh dev server

## Manual Process Check

To see all running Node processes with protection status:

```powershell
Get-WmiObject Win32_Process -Filter "name like '%node%'" |
  Select-Object ProcessId, @{Name='Command';Expression={$_.CommandLine}} |
  Format-Table -AutoSize
```

## Emergency: Kill All Dev Servers

If you need to manually kill dev servers:

```powershell
# Find dev server PIDs first
Get-WmiObject Win32_Process -Filter "name like '%node%'" |
  Where-Object { $_.CommandLine -like "*next*" -or $_.CommandLine -like "*npm run dev*" } |
  Select-Object ProcessId, @{Name='Command';Expression={$_.CommandLine}}

# Then kill specific PIDs (replace XXXXX with actual PID)
Stop-Process -Id XXXXX -Force
```

**⚠️ NEVER manually kill:**
- Processes containing "StreamDeck"
- Processes containing "claude-code"
- Processes containing "@anthropic-ai"
- Processes you don't recognize
