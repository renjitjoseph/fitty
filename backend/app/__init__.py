import os
from flask import Flask
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    # Initialize Firebase Admin
    cred_path = os.path.join(os.getcwd(), 'app', 'keys', 'fitty-af564-firebase-adminsdk-97z72-440f4e2595.json')
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

    # Setup CORS for all routes
    CORS(app)

    # Import and register the authentication blueprint
    from .routes.authentication import auth_blueprint
    app.register_blueprint(auth_blueprint, url_prefix='/api/auth')

    return app
