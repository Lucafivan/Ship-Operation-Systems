from . import db
from .models import (
    Vessel,
    Voyage,
    Port,
    db
)
from flask import jsonify, request, Blueprint
from flask_jwt_extended import jwt_required

main_bp = Blueprint('main_bp', __name__)

@main_bp.route('/')
def index():
    return "Selamat datang di API Ship Operation System!"

@main_bp.route('/vessels', methods=['GET'])
@jwt_required()
def get_vessels():
    vessels = Vessel.query.all()
    vessels_list = [{"id": vessel.id, "name": vessel.name} for vessel in vessels]
    return jsonify(vessels_list), 200

@main_bp.route('/vessels', methods=['POST'])
@jwt_required()
def create_vessel():
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({"msg": "Nama vessel diperlukan"}), 400

    new_vessel = Vessel(name=name)
    db.session.add(new_vessel)
    db.session.commit()

    return jsonify({"msg": "Vessel berhasil dibuat", "vessel": {"id": new_vessel.id, "name": new_vessel.name}}), 201

@main_bp.route('/voyages', methods=['GET'])
@jwt_required()
def get_voyages():
    voyages = Voyage.query.all()
    voyages_list = []
    for voyage in voyages:
        voyages_list.append({
            "id": voyage.id,
            "vessel_id": voyage.vessel_id,
            "voyage_no": voyage.voyage_no,
            "voyage_yr": voyage.voyage_yr,
            "port_id": voyage.port_id,
            "port_name": voyage.port.name if voyage.port else None,
            "date_berth": voyage.date_berth.isoformat(),
            "created_at": voyage.created_at.isoformat()
        })
    return jsonify(voyages_list), 200

@main_bp.route('/voyages', methods=['POST'])
@jwt_required()
def create_voyage():
    data = request.get_json()
    vessel_id = data.get('vessel_id')
    voyage_yr = data.get('voyage_yr')
    port_id = data.get('port_id')
    port_name = data.get('port_name') or data.get('berth_loc')
    date_berth = data.get('date_berth')

    if not all([vessel_id, voyage_yr, date_berth]):
        return jsonify({"msg": "Semua field diperlukan"}), 400

    port = None
    if port_id:
        port = Port.query.filter_by(id=port_id).first()
    elif port_name:
        port = Port.query.filter(Port.name.ilike(port_name)).first()

    if not port:
        return jsonify({"msg": "Port tidak ditemukan (gunakan port_id atau port_name yang valid)"}), 400

    last_voyage = Voyage.query.filter_by(vessel_id=vessel_id, voyage_yr=voyage_yr).order_by(Voyage.voyage_no.desc()).first()
    if last_voyage:
        try:
            last_no = int(last_voyage.voyage_no)
            next_voyage_no = str(last_no + 1)
        except Exception:
            next_voyage_no = "1"
    else:
        next_voyage_no = "1"

    new_voyage = Voyage(
        vessel_id=vessel_id,
        voyage_no=next_voyage_no,
        voyage_yr=voyage_yr,
        port_id=port.id,
        date_berth=date_berth
    )
    db.session.add(new_voyage)
    db.session.commit()

    return jsonify({"msg": "Voyage berhasil dibuat", "voyage": {
        "id": new_voyage.id,
        "vessel_id": new_voyage.vessel_id,
        "voyage_no": new_voyage.voyage_no,
        "voyage_yr": new_voyage.voyage_yr,
        "port_id": new_voyage.port_id,
        "port_name": port.name,
        "date_berth": new_voyage.date_berth.isoformat(),
        "created_at": new_voyage.created_at.isoformat()
    }}), 201