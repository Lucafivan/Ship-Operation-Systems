from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from .models import db, Port 

port_bp = Blueprint('port_bp', __name__)

@port_bp.route('/', methods=['POST'])
@jwt_required()
def create_port():
    data = request.get_json() or {}
    name = data.get('name')
    code = data.get('code')

    if not name:
        return jsonify({"msg": "Nama port diperlukan"}), 400
    
    # Cek apakah port dengan nama atau kode yang sama sudah ada
    if Port.query.filter_by(name=name).first():
        return jsonify({"msg": f"Port dengan nama '{name}' sudah ada"}), 409
    if code and Port.query.filter_by(code=code).first():
        return jsonify({"msg": f"Port dengan kode '{code}' sudah ada"}), 409

    new_port = Port(name=name, code=code)
    db.session.add(new_port)
    db.session.commit()

    return jsonify({
        "msg": "Port berhasil dibuat", 
        "port": {
            "id": new_port.id, 
            "name": new_port.name, 
            "code": new_port.code
        }
    }), 201

@port_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_ports():
    ports = Port.query.order_by(Port.name).all()
    ports_list = [
        {"id": port.id, "name": port.name, "code": port.code} 
        for port in ports
    ]
    return jsonify(ports_list), 200

@port_bp.route('/<int:port_id>', methods=['GET'])
@jwt_required()
def get_port_by_id(port_id: int):
    port = Port.query.get_or_404(port_id)
    return jsonify({
        "id": port.id,
        "name": port.name,
        "code": port.code
    }), 200

@port_bp.route('/<int:port_id>', methods=['PUT'])
@jwt_required()
def update_port(port_id: int):
    port_to_update = Port.query.get_or_404(port_id)
    data = request.get_json() or {}

    name = data.get('name', port_to_update.name)
    code = data.get('code', port_to_update.code)

    if not name:
        return jsonify({"msg": "Nama port tidak boleh kosong"}), 400

    port_to_update.name = name
    port_to_update.code = code
    
    db.session.commit()

    return jsonify({
        "msg": "Port berhasil diperbarui",
        "port": {
            "id": port_to_update.id,
            "name": port_to_update.name,
            "code": port_to_update.code
        }
    }), 200


@port_bp.route('/<int:port_id>', methods=['DELETE'])
@jwt_required()
def delete_port(port_id: int):
    port_to_delete = Port.query.get_or_404(port_id)
    
    db.session.delete(port_to_delete)
    db.session.commit()

    return jsonify({"msg": f"Port '{port_to_delete.name}' berhasil dihapus"}), 200