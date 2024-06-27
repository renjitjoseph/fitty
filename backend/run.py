from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin SDK
cred = credentials.Certificate('app/keys/fitty-af564-firebase-adminsdk-97z72-440f4e2595.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
app.config["JWT_SECRET_KEY"] = "your_jwt_secret_key"  # Change to your secret key
jwt = JWTManager(app)

# Import routes
from app.routes.authentication import auth_blueprint
from app.routes.wardrobe import wardrobe_blueprint

# Register Blueprints
app.register_blueprint(auth_blueprint, url_prefix='/api/auth')
app.register_blueprint(wardrobe_blueprint, url_prefix='/api/wardrobe')

if __name__ == '__main__':
    app.run(debug=True)
