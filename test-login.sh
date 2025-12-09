#!/bin/bash
# Test login
curl -s -c /tmp/cookies.txt -X POST http://localhost:5000/api/employees/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager1","password":"1234","gateway":"1802009"}' | jq .
