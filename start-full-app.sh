#!/bin/bash
echo "Starting full TrialSage application..."
node cleanup-toastify.js && NODE_OPTIONS="--trace-warnings" tsx --inspect server/index.ts