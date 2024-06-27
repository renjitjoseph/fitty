import os

class Config:
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_jwt_secret_key")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://jashith9:Rodeo1234!@fitty.2s46nv8.mongodb.net/?retryWrites=true&w=majority&appName=Fitty")
    DEBUG = True