#!/bin/bash

# Files with react-toastify imports
files=(
  "client/src/components/SubmissionBuilderWebSocket.tsx"
  "client/src/hooks/useQcSocket.ts"
  "client/src/hooks/use-toast-context.tsx"
  "client/src/hooks/useQCWebSocket.tsx"
  "client/src/pages/CopilotDrawer.jsx"
  "client/src/pages/RiskAnalysis.tsx"
  "client/src/pages/IQOQDownload.tsx"
  "client/src/pages/SubmissionBuilder.tsx"
)

# Replace imports in all files
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file"
    
    # Replace imports with our custom toast import
    sed -i 's/import { toast } from "react-toastify";/import { useToast } from "..\/App";/g' "$file"
    sed -i "s/import { toast } from 'react-toastify';/import { useToast } from '..\/App';/g" "$file"
    
    # Replace toast container imports
    sed -i 's/import { toast, ToastContainer } from "react-toastify";/import { useToast } from "..\/App";/g' "$file"
    sed -i "s/import { toast, ToastContainer } from 'react-toastify';/import { useToast } from '..\/App';/g" "$file"
    
    # Remove CSS imports
    sed -i 's/import "react-toastify\/dist\/ReactToastify.css";//g' "$file"
    sed -i "s/import 'react-toastify\/dist\/ReactToastify.css';//g" "$file"
    
    # Replace ToastContainer component
    sed -i 's/<ToastContainer[^>]*\/>//g' "$file"
    
    # Add a comment explaining the changes
    sed -i '1i// Toast notification system upgraded to SecureToast\n' "$file"
  else
    echo "File $file not found, skipping."
  fi
done

echo "Toast cleanup complete!"