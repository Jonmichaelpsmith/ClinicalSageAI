#!/bin/bash

# Make sure .env is loaded
export $(grep -v '^#' .env | xargs)

# Run the Vault server
echo "Starting TrialSage Vault server..."
node server/vault-server.js