import os
import jwt
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "fallback_secret")
ALGORITHM = "HS256"

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Verifies the JWT token from the Authorization header.
    Returns the decoded token payload.
    """
    token = credentials.credentials
    print(f"\n[DEBUG] [verify_token] Incoming token (first 10 chars): {token[:10]}...")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        print(f"[DEBUG] [verify_token] SUCCESS. Payload: {payload}")
        return payload
    except jwt.ExpiredSignatureError:
        print("[Auth] Token expired")
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        print(f"[Auth] Invalid Token Error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        print(f"[Auth] General Auth Error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

def get_current_user_id(payload: dict = Security(verify_token)) -> str:
    """
    Dependency that returns the user_id from the verified token.
    """
    user_id = payload.get("id") or payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not found in token")
    return str(user_id)
