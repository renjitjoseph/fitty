from flask import Blueprint, request, jsonify
from firebase_admin import auth, firestore

wardrobe_blueprint = Blueprint('wardrobe', __name__)
db = firestore.client()

@wardrobe_blueprint.route('/add', methods=['POST'])
def add_item():
    id_token = request.headers.get('Authorization').split('Bearer ')[1]
    decoded_token = auth.verify_id_token(id_token)
    uid = decoded_token['uid']

    item = request.json
    item['uid'] = uid

    db.collection('wardrobes').document(uid).collection('items').add(item)
    return jsonify({"success": True}), 200

@wardrobe_blueprint.route('/items', methods=['GET'])
def get_items():
    id_token = request.headers.get('Authorization').split('Bearer ')[1]
    decoded_token = auth.verify_id_token(id_token)
    uid = decoded_token['uid']

    items_ref = db.collection('wardrobes').document(uid).collection('items')
    items = [doc.to_dict() for doc in items_ref.stream()]
    return jsonify(items), 200
