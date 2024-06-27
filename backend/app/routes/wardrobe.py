from flask import Blueprint, request, jsonify, abort
from app.models import db
from bson import ObjectId
from flask_jwt_extended import jwt_required, get_jwt_identity

wardrobe_blueprint = Blueprint('wardrobe', __name__)

@wardrobe_blueprint.route('/items', methods=['POST'])
@jwt_required()
def add_item():
    item_data = request.json
    item_data['user_id'] = get_jwt_identity()
    result = db.db.wardrobe.insert_one(item_data)
    return jsonify({"msg": "Item added", "id": str(result.inserted_id)}), 201

@wardrobe_blueprint.route('/items', methods=['GET'])
@jwt_required()
def get_items():
    user_id = get_jwt_identity()
    items = db.db.wardrobe.find({'user_id': user_id})
    return jsonify([item for item in items]), 200
