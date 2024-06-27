from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from app.models import db

auth_blueprint = Blueprint('auth', __name__)

@auth_blueprint.route('/register', methods=['POST'])
def register():
    user_info = request.json
    user = db.db.users.find_one({'email': user_info['email']})
    if user:
        return jsonify({"msg": "Email already in use"}), 409
    hashed_password = generate_password_hash(user_info['password'])
    db.db.users.insert_one({'email': user_info['email'], 'password': hashed_password})
    return jsonify({"msg": "User registered successfully"}), 201

@auth_blueprint.route('/login', methods=['POST'])
def login():
    user_info = request.json
    user = db.db.users.find_one({'email': user_info['email']})
    if user and check_password_hash(user['password'], user_info['password']):
        access_token = create_access_token(identity=user_info['email'])
        return jsonify(access_token=access_token), 200
    return jsonify({"msg": "Invalid credentials"}), 401
