# PowerShell script to sync .env.local values to Vercel environment variables
# Requires Vercel CLI (npm i -g vercel) and being logged in (vercel login)

$project = "bikemate-web"
$team    = "ashish-ganguly-bikemet"

$envFile = Join-Path -Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "apps/web/.env.local"
if (-not (Test-Path $envFile)) {
    Write-Error "Cannot find .env.local at $envFile"
    exit 1
}

# Read .env.local lines, ignore comments/blank lines
$envLines = Get-Content $envFile | Where-Object { $_ -and (-not $_.StartsWith('#')) }

foreach ($line in $envLines) {
    $pair = $line -split "=", 2
    if ($pair.Length -ne 2) { continue }
    $key = $pair[0].Trim()
    $value = $pair[1].Trim()
    # Remove surrounding quotes if present
    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
        $value = $value.Substring(1, $value.Length - 2)
    }
    foreach ($target in @('production','preview','development')) {
        Write-Host "Setting $key for $target..."
        # Use echo to pipe the value into vercel env add
        echo $value | vercel env add $key $target --yes --scope $team
    }
}

Write-Host "All variables processed. You may now trigger a redeploy via Vercel dashboard or CLI."
