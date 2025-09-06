#!/usr/bin/env bash

echo "Start server..."

yarn prisma migrate deploy

node main.js
