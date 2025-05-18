#!/bin/bash

# TrialSage Application Optimizer
# This script configures the environment for optimal resource usage

echo "Optimizing TrialSage application for resource-constrained environments..."

# 1. Set optimal Node.js environment variables
export NODE_OPTIONS="--max-old-space-size=512 --no-warnings"
export UV_THREADPOOL_SIZE=4

# 2. Remove any temporary files that might be consuming resources
find ./tmp -type f -name "*.tmp" -delete 2>/dev/null
find ./exports -type f -mtime +1 -delete 2>/dev/null

# 3. Clean Vite cache if it exists
if [ -d "./.vite" ]; then
  echo "Clearing Vite cache..."
  rm -rf ./.vite
fi

# 4. Check if react-toastify is causing issues
if [ -d "./node_modules/react-toastify" ]; then
  echo "react-toastify found - this may cause memory issues"
else
  echo "react-toastify not found (good!)"
fi

# 5. Create a basic process monitoring system
mkdir -p ./logs

cat > ./server/process-monitor.js <<EOL
/**
 * TrialSage Process Monitor
 * Monitors and controls resource usage during application runtime
 */

console.log('Process monitor active');

// Track memory usage
setInterval(() => {
  const memUsage = process.memoryUsage();
  console.log('Memory usage: ' + 
    Math.round(memUsage.rss / 1024 / 1024) + 'MB RSS, ' +
    Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB heap used');
    
  // Suggest garbage collection if memory usage is high
  if (memUsage.heapUsed > 400 * 1024 * 1024) {
    console.log('High memory usage detected, suggesting garbage collection');
    if (global.gc) global.gc();
  }
}, 60000);
EOL

echo "Optimization complete! Starting application with resource limitations..."

# Start application with optimized settings
echo "npm run dev"
npm run dev