from flask import Blueprint, request, jsonify, abort
from app.models import db
from bson import ObjectId
from flask_jwt_extended import jwt_required, get_jwt_identity

outfits_blueprint = Blueprint('outfits', __name__)

@outfits_blueprint.route('/outfits', methods=['POST'])
@jwt_required()
def create_outfit():
    outfit_data = request.json
    outfit_data['user_id'] = get_jwt_identity()
    result = db.db.outfits.insert_one(outfit_data)
    return jsonify({"msg": "Outfit created", "id": str(result.inserted_id)}), 201

@outfits_blueprint.route('/outfits', methods=['GET'])
@jwt_required()
def get_outfits():
    user_id = get_jwt_identity()
    outfits = db.db.outfits.find({'user_id': user_id})
    return jsonify([outfit for outfit in outfits]), 200
