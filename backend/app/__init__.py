from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .models import db

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    # Setup CORS specifically for all routes under "/api/*" from "http://localhost:3000"
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

    jwt = JWTManager(app)
    db.init_app(app)

    from .routes.authentication import auth_blueprint
    from .routes.wardrobe import wardrobe_blueprint
    from .routes.outfits import outfits_blueprint

    app.register_blueprint(auth_blueprint, url_prefix='/api/auth')
    app.register_blueprint(wardrobe_blueprint, url_prefix='/api/wardrobe')
    app.register_blueprint(outfits_blueprint, url_prefix='/api/outfits')

    return app
