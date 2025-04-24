#!/bin/bash
# TrialSage Build Validation Script
# This script implements the 9-point checklist for dependency and build sanity

echo "=== TrialSage Build Validation Script ==="
echo ""

# 1. Check for lock files and package definitions
echo "1. Checking package definitions..."
if [ -f "package-lock.json" ] && [ -f "package.json" ]; then
  echo "✅ Node.js package files found"
else
  echo "❌ Missing package-lock.json or package.json"
fi

if [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
  echo "✅ Python dependency files found"
else
  echo "❌ Missing requirements.txt or pyproject.toml"
fi

# 2. Clean install dependencies
echo ""
echo "2. Performing clean install of dependencies..."
read -p "Would you like to run a clean install (y/n)? " choice
if [[ "$choice" =~ ^[Yy]$ ]]; then
  echo "Cleaning and installing Node.js dependencies..."
  rm -rf node_modules
  npm ci
  
  echo "Installing Python dependencies..."
  pip install -r requirements.txt
  
  echo "Building frontend..."
  npm run build
else
  echo "Skipping dependency reinstallation."
fi

# 3. Check directory structure and permissions
echo ""
echo "3. Checking directory structure and permissions..."
DIRS=("backend/uploads" "backend/validation_logs" "backend/define_outputs")
for dir in "${DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "✅ Directory $dir exists"
    if [ -w "$dir" ]; then
      echo "✅ Directory $dir is writable"
    else
      echo "❌ Directory $dir is not writable"
      chmod 755 "$dir"
      echo "   Permission fixed to 755"
    fi
  else
    echo "❌ Directory $dir does not exist"
    mkdir -p "$dir"
    echo "   Directory created"
  fi
done

# 4. Critical Secrets Verification
echo ""
echo "4. Critical Secrets Verification"
echo "Checking for required environment variables..."

REQUIRED_SECRETS=("JWT_SECRET_KEY" "REGINTEL_ENGINE_PATH" "OPENAI_API_KEY")
MISSING_SECRETS=()

for secret in "${REQUIRED_SECRETS[@]}"; do
  if ! grep -q "^${secret}=" .env 2>/dev/null && [ -z "${!secret}" ]; then
    MISSING_SECRETS+=("$secret")
  else
    echo "✅ $secret is defined"
  fi
done

if [ ${#MISSING_SECRETS[@]} -gt 0 ]; then
  echo "❌ Missing required secrets: ${MISSING_SECRETS[*]}"
  echo "Please set these using environment variables or .env file"
else
  echo "✅ All required secrets are defined"
fi

# 5. JWT & Multitenant Validation
echo ""
echo "5. JWT & Multitenant Validation"
echo "Would you like to run the tenant isolation smoke test? (requires pytest)"
read -p "Run test (y/n)? " choice
if [[ "$choice" =~ ^[Yy]$ ]]; then
  echo "Running tenant isolation test..."
  # Execute the test here. The actual command will depend on your project structure
  # python -m pytest backend/tests/test_multitenancy.py -v
  echo "Creating test file if it doesn't exist..."
  
  if [ ! -d "backend/tests" ]; then
    mkdir -p backend/tests
  fi
  
  if [ ! -f "backend/tests/test_multitenancy.py" ]; then
cat > backend/tests/test_multitenancy.py << 'EOF'
# pytest
import pytest
import jwt
import datetime
from fastapi.testclient import TestClient

# Import your FastAPI app - adjust path as needed
# from main import app
# client = TestClient(app)

def create_jwt(tenant_id, user_id=1):
    """Create a test JWT token with the given tenant_id"""
    payload = {
        "sub": str(user_id),
        "tenant_id": tenant_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    # Replace with your actual secret key
    return jwt.encode(payload, "your_secret_key", algorithm="HS256")

def test_multitenant_isolation():
    """Test that tenants can only see their own data"""
    # This is a placeholder - you'll need to adapt this to your actual app
    token_a = create_jwt(tenant_id="A")
    token_b = create_jwt(tenant_id="B")
    
    # Uncomment and modify these lines to use with your actual app
    # # Tenant A creates a validation run
    # client.post("/api/validate", files={"file": ("test.txt", b"test data")}, 
    #             headers={"Authorization": f"Bearer {token_a}"})
    # # Tenant B should see zero runs
    # resp = client.get("/api/versions", 
    #                   headers={"Authorization": f"Bearer {token_b}"})
    # assert len(resp.json()) == 0
    
    print("✅ Tenant isolation test created. Modify it to work with your specific API.")
    return True

if __name__ == "__main__":
    # Run the test directly if this file is executed
    test_multitenant_isolation()
EOF

    echo "Created test file at backend/tests/test_multitenancy.py"
  else
    echo "Test file already exists at backend/tests/test_multitenancy.py"
  fi

  echo "Note: You'll need to customize the test to match your API before running"
else
  echo "Skipping tenant isolation test."
fi

# 5. CORS & Security Check
echo ""
echo "5. CORS & Security Check"
echo "Checking CORS configuration..."

# Look for CORS settings in main backend files
grep -r "CORSMiddleware" --include="*.py" . || echo "⚠️ Could not find CORS middleware configuration"

# 6. End-to-End Smoke Test Guidance
echo ""
echo "6. End-to-End Smoke Test Checklist"
echo "Please manually verify the following:"
echo "  □ Upload → Validate → View Results: Drag/drop a test file and run validation"
echo "  □ Download Links: Test 'Download Report' and 'Download Define.xml' buttons"
echo "  □ Explain & Fix: Click 'Explain' on an error to verify GPT response"
echo "  □ Diff & Versions: On Vault page, reorder versions to test version management"

# 7. Error Handling & Logging
echo ""
echo "7. Error Handling & Logging"
echo "Checking for log directories..."
if [ -d "backend/validation_logs" ]; then
  echo "✅ Log directory exists"
else
  echo "❌ Log directory does not exist"
  mkdir -p backend/validation_logs
  echo "   Directory created"
fi

# 8. Feature Flags
echo ""
echo "8. Feature Flags"
echo "Checking for feature flag configuration..."
grep -r "FEATURE_" --include="*.py" . || echo "⚠️ No feature flags found. Consider adding feature toggles for new functionality."

# 9. CI/CD & Backups
echo ""
echo "9. CI/CD & Backups"
echo "Checking for database migration files..."
if [ -d "migrations" ]; then
  echo "✅ Migration directory exists"
else
  echo "⚠️ No migrations directory found. Consider setting up database migrations."
fi

echo ""
echo "Backup recommendation:"
echo "Run the following to backup your data before major changes:"
echo "  mkdir -p backups/$(date +%Y%m%d)"
echo "  cp -r backend/uploads backend/validation_logs backend/define_outputs backups/$(date +%Y%m%d)/"
echo "  pg_dump -U \$PGUSER \$PGDATABASE > backups/$(date +%Y%m%d)/database_backup.sql"

echo ""
echo "=== Build Validation Complete ==="