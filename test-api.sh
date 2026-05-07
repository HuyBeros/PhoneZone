#!/bin/bash

# Script để test API sau khi migration

echo "🧪 Testing PhoneZone API Endpoints..."
echo ""

BASE_URL="http://localhost:8080/api"

# Test 1: Get all brands
echo "1️⃣ Testing GET /categories/brands"
curl -s "$BASE_URL/categories/brands" | jq '.' || echo "❌ Failed"
echo ""
echo "---"
echo ""

# Test 2: Get brand by slug
echo "2️⃣ Testing GET /categories/brands/iphone"
curl -s "$BASE_URL/categories/brands/iphone" | jq '.' || echo "❌ Failed"
echo ""
echo "---"
echo ""

# Test 3: Get products by brand
echo "3️⃣ Testing GET /products?brand=iphone&size=5"
curl -s "$BASE_URL/products?brand=iphone&size=5" | jq '.data | length' || echo "❌ Failed"
echo ""
echo "---"
echo ""

# Test 4: Get all categories
echo "4️⃣ Testing GET /categories"
curl -s "$BASE_URL/categories" | jq 'length' || echo "❌ Failed"
echo ""
echo "---"
echo ""

# Test 5: Search products
echo "5️⃣ Testing GET /products/search?q=iphone"
curl -s "$BASE_URL/products/search?q=iphone" | jq 'length' || echo "❌ Failed"
echo ""

echo "✅ All tests completed!"
