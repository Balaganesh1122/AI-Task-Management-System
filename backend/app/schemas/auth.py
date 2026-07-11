from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    department: str
    skills: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str