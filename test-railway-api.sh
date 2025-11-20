#!/bin/bash

# Luna Sync Railway API Test Script
# Usage: ./test-railway-api.sh https://your-app.up.railway.app

if [ -z "$1" ]; then
  echo "❌ Error: Please provide your Railway URL"
  echo "Usage: ./test-railway-api.sh https://your-app.up.railway.app"
  exit 1
fi

API_URL="$1"
echo "🧪 Testing Luna Sync API at: $API_URL"
echo "================================================"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Endpoint..."
HEALTH=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_URL/health")
HTTP_CODE=$(echo "$HEALTH" | grep HTTP_CODE | cut -d: -f2)
RESPONSE=$(echo "$HEALTH" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Health check passed!"
  echo "   Response: $RESPONSE"
else
  echo "❌ Health check failed (HTTP $HTTP_CODE)"
  exit 1
fi
echo ""

# Test 2: Register User
echo "2️⃣  Testing User Registration..."
REGISTER=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "railwaytest@example.com",
    "password": "password123",
    "first_name": "Railway",
    "avg_cycle_length": 28
  }')

HTTP_CODE=$(echo "$REGISTER" | grep HTTP_CODE | cut -d: -f2)
RESPONSE=$(echo "$REGISTER" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "201" ]; then
  echo "✅ User registration passed!"

  # Extract token for next tests
  ACCESS_TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

  if [ -n "$ACCESS_TOKEN" ]; then
    echo "   Token received: ${ACCESS_TOKEN:0:20}..."
  fi
else
  echo "⚠️  Registration returned HTTP $HTTP_CODE"
  echo "   Response: $RESPONSE"
  echo "   (This is OK if user already exists)"
fi
echo ""

# Test 3: Login (with registered user)
echo "3️⃣  Testing User Login..."
LOGIN=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "railwaytest@example.com",
    "password": "password123"
  }')

HTTP_CODE=$(echo "$LOGIN" | grep HTTP_CODE | cut -d: -f2)
RESPONSE=$(echo "$LOGIN" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Login passed!"
  ACCESS_TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
  echo "   Token: ${ACCESS_TOKEN:0:20}..."
else
  echo "❌ Login failed (HTTP $HTTP_CODE)"
  echo "   Response: $RESPONSE"
  exit 1
fi
echo ""

# Test 4: Get Current User
if [ -n "$ACCESS_TOKEN" ]; then
  echo "4️⃣  Testing Authenticated Endpoint..."
  USER=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_URL/api/v1/auth/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

  HTTP_CODE=$(echo "$USER" | grep HTTP_CODE | cut -d: -f2)

  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Authenticated request passed!"
  else
    echo "❌ Authenticated request failed (HTTP $HTTP_CODE)"
  fi
  echo ""
fi

# Summary
echo "================================================"
echo "🎉 Railway API Test Complete!"
echo ""
echo "Your API is deployed and working at:"
echo "   $API_URL"
echo ""
echo "Next steps:"
echo "1. Update mobile app API URL"
echo "2. Test all endpoints with demo account"
echo "3. Run database seeds if needed"
echo ""
