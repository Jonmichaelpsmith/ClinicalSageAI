"""
Generate JWT token for testing

This script generates a JWT token for development and testing purposes.
"""
import jwt
import time
import sys
import os

# JWT Configuration (same as in dependencies.py)
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "regintel_development_secret")
JWT_ALGORITHM = "HS256"

def generate_token(user_id, username, exp_minutes=60*24):
    """
    Generate a JWT token for the given user
    
    Args:
        user_id: User ID
        username: Username
        exp_minutes: Expiration time in minutes (default: 1 day)
        
    Returns:
        str: The generated JWT token
    """
    # Set expiration time
    exp_time = int(time.time()) + (exp_minutes * 60)
    
    # Create payload
    payload = {
        "sub": str(user_id),
        "username": username,
        "exp": exp_time,
        "iat": int(time.time()),
        "tenant_id": "default"
    }
    
    # Generate token
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    return token

if __name__ == "__main__":
    # Get user ID and username from command line arguments
    if len(sys.argv) < 3:
        print("Usage: python generate_test_token.py <user_id> <username>")
        sys.exit(1)
        
    user_id = sys.argv[1]
    username = sys.argv[2]
    
    # Generate token
    token = generate_token(user_id, username)
    
    # Print token
    print("\nGenerated JWT Token for testing:")
    print(f"\n{token}\n")
    
    print("To use this token:")
    print("1. Open your browser developer tools (F12)")
    print("2. Go to the Console tab")
    print("3. Run this command:")
    print(f"   localStorage.setItem('token', '{token}')")
    print("4. Refresh the page\n")