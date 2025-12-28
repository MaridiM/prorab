#!/bin/bash
# Bash script to start ngrok tunnel for Stripe webhooks
# Usage: ./scripts/start-ngrok.sh

API_PORT=8080

echo ""
echo "🚀 Starting ngrok tunnel for Stripe webhooks..."
echo "   API Port: $API_PORT"
echo ""
echo "📝 After ngrok starts, copy the HTTPS URL and update Stripe webhook endpoint:"
echo "   https://xxxx-xx-xxx-xxx-xx.ngrok-free.app/webhooks/stripe"
echo ""
echo "⚠️  Don't forget to update STRIPE_WEBHOOK_SECRET in .env after creating/updating webhook!"
echo ""

# Check if ngrok is available
if ! command -v ngrok &> /dev/null; then
    echo "❌ Error: ngrok not found in PATH"
    echo "   Please install ngrok:"
    echo "   - macOS: brew install ngrok"
    echo "   - Linux: Download from https://ngrok.com/download"
    exit 1
fi

# Start ngrok
ngrok http $API_PORT

