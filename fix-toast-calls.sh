#!/bin/bash

# Files with toast function calls
files=(
  "client/src/components/SubmissionBuilderWebSocket.tsx"
  "client/src/hooks/useQcSocket.ts"
  "client/src/hooks/use-toast-context.tsx"
  "client/src/hooks/useQCWebSocket.tsx"
  "client/src/pages/CopilotDrawer.jsx"
  "client/src/pages/RiskAnalysis.tsx"
  "client/src/pages/IQOQDownload.tsx"
  "client/src/pages/SubmissionBuilder.tsx"
  "client/src/components/DocumentDiffViewer.tsx"
)

# Replace toast function calls in all files
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file"
    
    # Replace toast.success calls
    sed -i 's/toast\.success(\([^)]*\))/useToast().showToast(\1, "success")/g' "$file"
    
    # Replace toast.error calls
    sed -i 's/toast\.error(\([^)]*\))/useToast().showToast(\1, "error")/g' "$file"
    
    # Replace toast.info calls
    sed -i 's/toast\.info(\([^)]*\))/useToast().showToast(\1, "info")/g' "$file"
    
    # Replace toast.warning calls
    sed -i 's/toast\.warning(\([^)]*\))/useToast().showToast(\1, "warning")/g' "$file"
    
    # Replace toast() direct calls
    sed -i 's/toast(\([^)]*\))/useToast().showToast(\1)/g' "$file"
  else
    echo "File $file not found, skipping."
  fi
done

echo "Toast function call replacements complete!"