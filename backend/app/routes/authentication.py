from flask import Blueprint, request, jsonify
from firebase_admin import auth

auth_blueprint = Blueprint('auth', __name__)

@auth_blueprint.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    try:
        user = auth.create_user(
            email=data['email'],
            password=data['password']
        )
        return jsonify({'uid': user.uid}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@auth_blueprint.route('/login', methods=['POST'])
def login():
    # Firebase Authentication is handled client-side
    return jsonify({'message': 'Login handled by client.'}), 200
