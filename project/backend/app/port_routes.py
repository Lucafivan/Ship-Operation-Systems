from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

port_bp = Blueprint('port_bp', __name__)

@port_bp.route('', methods=['GET'])
@port_bp.route('/', methods=['GET'])
@jwt_required()
def list_ports():
    return jsonify([]), 200

@port_bp.route('', methods=['POST'])
@port_bp.route('/', methods=['POST'])
@jwt_required()
def create_port():
    data = request.get_json() or {}
    name = data.get('name')
    code = data.get('code')
    if not name:
        return jsonify({"msg": "Nama port diperlukan"}), 400
    return jsonify({"msg": "Port created (placeholder)", "port": {"id": 0, "name": name, "code": code}}), 201

@port_bp.route('/<int:port_id>', methods=['PUT'])
@jwt_required()
def update_port(port_id: int):
    return jsonify({"msg": "Update port not implemented yet"}), 501

@port_bp.route('/<int:port_id>', methods=['DELETE'])
@jwt_required()
def delete_port(port_id: int):
    return jsonify({"msg": "Delete port not implemented yet"}), 501
