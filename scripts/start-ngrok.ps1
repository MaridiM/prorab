# PowerShell script to start ngrok tunnel for Stripe webhooks
# Usage: .\scripts\start-ngrok.ps1

$API_PORT = 8080

Write-Host ""
Write-Host "🚀 Starting ngrok tunnel for Stripe webhooks..." -ForegroundColor Green
Write-Host "   API Port: $API_PORT" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 After ngrok starts, copy the HTTPS URL and update Stripe webhook endpoint:" -ForegroundColor Yellow
Write-Host "   https://xxxx-xx-xxx-xxx-xx.ngrok-free.app/webhooks/stripe" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  Don't forget to update STRIPE_WEBHOOK_SECRET in .env after creating/updating webhook!" -ForegroundColor Red
Write-Host ""

# Check if ngrok is available
$ngrokPath = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokPath) {
    Write-Host "❌ Error: ngrok not found in PATH" -ForegroundColor Red
    Write-Host "   Please install ngrok from https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host "   Or add ngrok.exe to your PATH" -ForegroundColor Yellow
    exit 1
}

# Start ngrok
ngrok http $API_PORT

