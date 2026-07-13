import uvicorn
from fastapi import FastAPI, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import os

app = FastAPI(
    title="FinCommerce Auth & Device API",
    description="SaaS Multi-Channel Merchant integration authentication system.",
    version="1.0.0"
)

# Schemas
class RegisterSchema(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str

class LoginSchema(BaseModel):
    username: str
    password: str
    remember_me: Optional[bool] = False

class MFASchema(BaseModel):
    mfa_token: str
    otp_code: str

# In-memory session tracking mock
mock_sessions = [
    {"session_id": "sess-1", "device_name": "Chrome on Windows 11", "ip_address": "182.52.120.44", "location": "Bangkok, Thailand", "last_active": "2026-07-13T20:00:00Z"},
    {"session_id": "sess-2", "device_name": "Safari on iPhone 15 Pro", "ip_address": "27.55.90.18", "location": "Chiang Mai, Thailand", "last_active": "2026-07-13T19:45:00Z"},
    {"session_id": "sess-3", "device_name": "TikTok Webview on Android", "ip_address": "101.109.112.5", "location": "Nonthaburi, Thailand", "last_active": "2026-07-13T18:30:00Z"}
]

@app.post("/api/v1/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterSchema):
    # Simulated leaked password auditing
    leaked_passwords = ["password123", "12345678", "qwertyuiop", "admin123", "love1234"]
    if payload.password.lower() in leaked_passwords:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password chosen was found in previous public breaches. Please choose a secure password."
        )
    return {"message": "User registered successfully."}

@app.post("/api/v1/auth/login")
def login_user(payload: LoginSchema):
    # Simple mock check
    if (payload.username == "user@gmail.com" or payload.username == "0812345678") and payload.password == "Admin123!":
        return {
            "status": "MFA_REQUIRED",
            "mfa_token": "mfa_challenge_uuid_here",
            "message": "Credential matched. Dynamic Adaptive Verification triggered."
        }
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

@app.post("/api/v1/auth/mfa/verify")
def verify_mfa(payload: MFASchema):
    if payload.otp_code == "882049":
        return {
            "status": "SUCCESS",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_payload.sig"
        }
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification code.")

@app.get("/api/v1/devices")
def get_active_sessions():
    return mock_sessions

@app.post("/api/v1/devices/revoke/{session_id}")
def revoke_session(session_id: str):
    global mock_sessions
    initial_len = len(mock_sessions)
    mock_sessions = [s for s in mock_sessions if s["session_id"] != session_id]
    if len(mock_sessions) == initial_len:
        raise HTTPException(status_code=404, detail="Session ID not found.")
    return {"message": f"Session {session_id} successfully revoked."}

# Mount static web directory at root
# Ensure index.html and assets are served correctly
web_dir = os.path.join(os.path.dirname(__file__), "web")
if os.path.exists(web_dir):
    app.mount("/", StaticFiles(directory=web_dir, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
