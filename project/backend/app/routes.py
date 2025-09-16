from . import db
from .models import (
    Vessel,
    Voyage,
    ContainerMovement
)
from flask import jsonify, request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity

main_bp = Blueprint('main_bp', __name__)

@main_bp.route('/')
def index():
    return "Selamat datang di API Ship Operation System!"

@main_bp.route('/vessels', methods=['GET'])
@jwt_required
def get_vessels():
    vessels = Vessel.query.all()
    vessels_list = [{"id": vessel.id, "name": vessel.name} for vessel in vessels]
    return jsonify(vessels_list), 200

@main_bp.route('/vessels', methods=['POST'])
@jwt_required
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
@jwt_required
def get_voyages():
    voyages = Voyage.query.all()
    voyages_list = []
    for voyage in voyages:
        voyages_list.append({
            "id": voyage.id,
            "vessel_id": voyage.vessel_id,
            "voyage_no": voyage.voyage_no,
            "voyage_yr": voyage.voyage_yr,
            "berth_loc": voyage.berth_loc,
            "date_berth": voyage.date_berth.isoformat(),
            "created_at": voyage.created_at.isoformat()
        })
    return jsonify(voyages_list), 200

@main_bp.route('/voyages', methods=['POST'])
@jwt_required
def create_voyage():
    data = request.get_json()
    vessel_id = data.get('vessel_id')
    voyage_no = data.get('voyage_no')
    voyage_yr = data.get('voyage_yr')
    berth_loc = data.get('berth_loc')
    date_berth = data.get('date_berth')

    if not all([vessel_id, voyage_no, voyage_yr, date_berth]):
        return jsonify({"msg": "Semua field diperlukan"}), 400

    new_voyage = Voyage(
        vessel_id=vessel_id,
        voyage_no=voyage_no,
        voyage_yr=voyage_yr,
        berth_loc=berth_loc,
        date_berth=date_berth
    )
    db.session.add(new_voyage)
    db.session.commit()

    return jsonify({"msg": "Voyage berhasil dibuat", "voyage": {
        "id": new_voyage.id,
        "vessel_id": new_voyage.vessel_id,
        "voyage_no": new_voyage.voyage_no,
        "voyage_yr": new_voyage.voyage_yr,
        "berth_loc": new_voyage.berth_loc,
        "date_berth": new_voyage.date_berth.isoformat(),
        "created_at": new_voyage.created_at.isoformat()
    }}), 201

@main_bp.route('/container_movements', methods=['GET'])
@jwt_required
def get_container_movements():
    container_movements = ContainerMovement.query.all()
    container_movements_list = []
    for cm in container_movements:
        container_movements_list.append({
            "id": cm.id,
            "voyage_id": cm.voyage_id,
            "bongkaran_empty_20dc": cm.bongkaran_empty_20dc,
            "bongkaran_empty_40hc": cm.bongkaran_empty_40hc,
            "bongkaran_full_20dc": cm.bongkaran_full_20dc,
            "bongkaran_full_40hc": cm.bongkaran_full_40hc,
            "pengajuan_empty_20dc": cm.pengajuan_empty_20dc,
            "pengajuan_empty_40hc": cm.pengajuan_empty_40hc,
            "pengajuan_full_20dc": cm.pengajuan_full_20dc,
            "pengajuan_full_40hc": cm.pengajuan_full_40hc,
            "acc_pengajuan_empty_20dc": cm.acc_pengajuan_empty_20dc,
            "acc_pengajuan_empty_40hc": cm.acc_pengajuan_empty_40hc,
            "acc_pengajuan_full_20dc": cm.acc_pengajuan_full_20dc,
            "acc_pengajuan_full_40hc": cm.acc_pengajuan_full_40hc,
            "total_pengajuan_20dc": cm.total_pengajuan_20dc,
            "total_pengajuan_40hc": cm.total_pengajuan_40hc,
            "teus_pengajuan": cm.teus_pengajuan,
            "realisasi_mxd_20dc": cm.realisasi_mxd_20dc,
            "realisasi_mxd_40hc": cm.realisasi_mxd_40hc,
            "realisasi_fxd_20dc": cm.realisasi_fxd_20dc,
            "realisasi_fxd_40hc": cm.realisasi_fxd_40hc,
            "shipside_yes_mxd_20dc": cm.shipside_yes_mxd_20dc,
            "shipside_yes_mxd_40hc": cm.shipside_yes_mxd_40hc,
            "shipside_yes_fxd_20dc": cm.shipside_yes_fxd_20dc,
            "shipside_yes_fxd_40hc": cm.shipside_yes_fxd_40hc,
            "shipside_no_mxd_20dc": cm.shipside_no_mxd_20dc,
            "shipside_no_mxd_40hc": cm.shipside_no_mxd_40hc,
            "shipside_no_fxd_20dc": cm.shipside_no_fxd_20dc,
            "shipside_no_fxd_40hc": cm.shipside_no_fxd_40hc,
            "total_realisasi_20dc": cm.total_realisasi_20dc,
            "total_realisasi_40hc": cm.total_realisasi_40hc,
            "teus_realisasi": cm.teus_realisasi,
            "turun_cy_20dc": cm.turun_cy_20dc,
            "turun_cy_40hc": cm.turun_cy_40hc,
            "teus_turun_cy": cm.teus_turun_cy,
            "percentage_vessel": cm.percentage_vessel,
            "obstacles": cm.obstacles,
            "created_at": cm.created_at.isoformat() if cm.created_at else None,
            "updated_at": cm.updated_at.isoformat() if cm.updated_at else None
        })
    return jsonify(container_movements_list), 200

@main_bp.route('/container_movements/bongkaran', methods=['POST'])
@jwt_required
def create_bongkaran():
    data = request.get_json()
    voyage_id = data.get('voyage_id')
    bongkaran_empty_20dc = data.get('bongkaran_empty_20dc', 0)
    bongkaran_empty_40hc = data.get('bongkaran_empty_40hc', 0)
    bongkaran_full_20dc = data.get('bongkaran_full_20dc', 0)
    bongkaran_full_40hc = data.get('bongkaran_full_40hc', 0)

    if not voyage_id:
        return jsonify({"msg": "voyage_id diperlukan"}), 400

    existing_cm = ContainerMovement.query.filter_by(voyage_id=voyage_id).first()
    if existing_cm:
        return jsonify({"msg": "ContainerMovement untuk voyage_id ini sudah ada"}), 400

    new_cm = ContainerMovement(
        voyage_id=voyage_id,
        bongkaran_empty_20dc=bongkaran_empty_20dc,
        bongkaran_empty_40hc=bongkaran_empty_40hc,
        bongkaran_full_20dc=bongkaran_full_20dc,
        bongkaran_full_40hc=bongkaran_full_40hc
    )
    db.session.add(new_cm)
    db.session.commit()

    return jsonify({"msg": "Bongkaran berhasil dibuat", "container_movement": {
        "id": new_cm.id,
        "voyage_id": new_cm.voyage_id,
        "bongkaran_empty_20dc": new_cm.bongkaran_empty_20dc,
        "bongkaran_empty_40hc": new_cm.bongkaran_empty_40hc,
        "bongkaran_full_20dc": new_cm.bongkaran_full_20dc,
        "bongkaran_full_40hc": new_cm.bongkaran_full_40hc,
        "created_at": new_cm.created_at.isoformat() if new_cm.created_at else None
    }}), 201

@main_bp.route('/container_movements/pengajuan', methods=['POST'])
@jwt_required
def create_pengajuan():
    data = request.get_json()
    cm_id = data.get('id')
    if not cm_id:
        return jsonify({"msg": "id diperlukan"}), 400
    
    pengajuan_empty_20dc = data.get('pengajuan_empty_20dc', 0)
    pengajuan_empty_40hc = data.get('pengajuan_empty_40hc', 0)
    pengajuan_full_20dc = data.get('pengajuan_full_20dc', 0)
    pengajuan_full_40hc = data.get('pengajuan_full_40hc', 0)

    cm = ContainerMovement.query.filter_by(id=cm_id).first()
    if not cm:
        return jsonify({"msg": "ContainerMovement tidak ditemukan"}), 404

    cm.pengajuan_empty_20dc = pengajuan_empty_20dc
    cm.pengajuan_empty_40hc = pengajuan_empty_40hc
    cm.pengajuan_full_20dc = pengajuan_full_20dc
    cm.pengajuan_full_40hc = pengajuan_full_40hc

    db.session.commit()

    return jsonify({"msg": "Pengajuan berhasil diperbarui", "container_movement": {
        "id": cm.id,
        "voyage_id": cm.voyage_id,
        "pengajuan_empty_20dc": cm.pengajuan_empty_20dc,
        "pengajuan_empty_40hc": cm.pengajuan_empty_40hc,
        "pengajuan_full_20dc": cm.pengajuan_full_20dc,
        "pengajuan_full_40hc": cm.pengajuan_full_40hc,
        "updated_at": cm.updated_at.isoformat() if cm.updated_at else None
    }}), 200

@main_bp.route('/container_movements/acc_pengajuan', methods=['POST'])
@jwt_required
def create_acc_pengajuan():
    data = request.get_json()
    cm_id = data.get('id')
    if not cm_id:
        return jsonify({"msg": "id diperlukan"}), 400
    
    acc_pengajuan_empty_20dc = data.get('acc_pengajuan_empty_20dc', 0)
    acc_pengajuan_empty_40hc = data.get('acc_pengajuan_empty_40hc', 0)
    acc_pengajuan_full_20dc = data.get('acc_pengajuan_full_20dc', 0)
    acc_pengajuan_full_40hc = data.get('acc_pengajuan_full_40hc', 0)
    total_pengajuan_20dc = acc_pengajuan_empty_20dc + acc_pengajuan_full_20dc
    total_pengajuan_40hc = acc_pengajuan_empty_40hc + acc_pengajuan_full_40hc
    teus_pengajuan = (total_pengajuan_20dc) + (total_pengajuan_40hc * 2)

    cm = ContainerMovement.query.filter_by(id=cm_id).first()
    if not cm:
        return jsonify({"msg": "ContainerMovement tidak ditemukan"}), 404

    cm.acc_pengajuan_empty_20dc = acc_pengajuan_empty_20dc
    cm.acc_pengajuan_empty_40hc = acc_pengajuan_empty_40hc
    cm.acc_pengajuan_full_20dc = acc_pengajuan_full_20dc
    cm.acc_pengajuan_full_40hc = acc_pengajuan_full_40hc
    cm.total_pengajuan_20dc = total_pengajuan_20dc
    cm.total_pengajuan_40hc = total_pengajuan_40hc
    cm.teus_pengajuan = teus_pengajuan

    db.session.commit()

    return jsonify({"msg": "Acc Pengajuan berhasil diperbarui", "container_movement": {
        "id": cm.id,
        "voyage_id": cm.voyage_id,
        "acc_pengajuan_empty_20dc": cm.acc_pengajuan_empty_20dc,
        "acc_pengajuan_empty_40hc": cm.acc_pengajuan_empty_40hc,
        "acc_pengajuan_full_20dc": cm.acc_pengajuan_full_20dc,
        "acc_pengajuan_full_40hc": cm.acc_pengajuan_full_40hc,
        "total_pengajuan_20dc": cm.total_pengajuan_20dc,
        "total_pengajuan_40hc": cm.total_pengajuan_40hc,
        "teus_pengajuan": cm.teus_pengajuan,
        "updated_at": cm.updated_at.isoformat() if cm.updated_at else None
    }}), 200

@main_bp.route('/container_movements/realisasi', methods=['POST'])
@jwt_required
def create_realisasi():
    data = request.get_json()
    cm_id = data.get('id')
    if not cm_id:
        return jsonify({"msg": "id diperlukan"}), 400
    
    realisasi_mxd_20dc = data.get('realisasi_mxd_20dc', 0)
    realisasi_mxd_40hc = data.get('realisasi_mxd_40hc', 0)
    realisasi_fxd_20dc = data.get('realisasi_fxd_20dc', 0)
    realisasi_fxd_40hc = data.get('realisasi_fxd_40hc', 0)

    cm = ContainerMovement.query.filter_by(id=cm_id).first()
    if not cm:
        return jsonify({"msg": "ContainerMovement tidak ditemukan"}), 404
    
    cm.realisasi_mxd_20dc = realisasi_mxd_20dc
    cm.realisasi_mxd_40hc = realisasi_mxd_40hc
    cm.realisasi_fxd_20dc = realisasi_fxd_20dc
    cm.realisasi_fxd_40hc = realisasi_fxd_40hc

    db.session.commit()

    return jsonify({"msg": "Realisasi berhasil diperbarui", "container_movement": {
        "id": cm.id,
        "voyage_id": cm.voyage_id,
        "realisasi_mxd_20dc": cm.realisasi_mxd_20dc,
        "realisasi_mxd_40hc": cm.realisasi_mxd_40hc,
        "realisasi_fxd_20dc": cm.realisasi_fxd_20dc,
        "realisasi_fxd_40hc": cm.realisasi_fxd_40hc,
        "updated_at": cm.updated_at.isoformat() if cm.updated_at else None
    }}), 200

@main_bp.route('/container_movements/shipside', methods=['POST'])
@jwt_required
def create_shipside():
    data = request.get_json()
    cm_id = data.get('id')
    if not cm_id:
        return jsonify({"msg": "id diperlukan"}), 400
    
    shipside_yes_mxd_20dc = data.get('shipside_yes_mxd_20dc', 0)
    shipside_yes_mxd_40hc = data.get('shipside_yes_mxd_40hc', 0)
    shipside_yes_fxd_20dc = data.get('shipside_yes_fxd_20dc', 0)
    shipside_yes_fxd_40hc = data.get('shipside_yes_fxd_40hc', 0)
    shipside_no_mxd_20dc = data.get('shipside_no_mxd_20dc', 0)
    shipside_no_mxd_40hc = data.get('shipside_no_mxd_40hc', 0)
    shipside_no_fxd_20dc = data.get('shipside_no_fxd_20dc', 0)
    shipside_no_fxd_40hc = data.get('shipside_no_fxd_40hc', 0)
    obstacle = data.get('obstacles', '')

    cm = ContainerMovement.query.filter_by(id=cm_id).first()
    if not cm:
        return jsonify({"msg": "ContainerMovement tidak ditemukan"}), 404

    total_realisasi_20dc = (cm.realisasi_mxd_20dc + shipside_yes_mxd_20dc + 
                            shipside_no_mxd_20dc + cm.realisasi_fxd_20dc +
                            shipside_yes_fxd_20dc + shipside_no_fxd_20dc)
    total_realisasi_40hc = (cm.realisasi_mxd_40hc + shipside_yes_mxd_40hc + 
                            shipside_no_mxd_40hc + cm.realisasi_fxd_40hc +
                            shipside_yes_fxd_40hc + shipside_no_fxd_40hc)
    teus_realisasi = (total_realisasi_20dc) + (total_realisasi_40hc * 2)

    turun_cy_20dc = (cm.total_pengajuan_20dc - total_realisasi_20dc)
    turun_cy_40hc = (cm.total_pengajuan_40hc - total_realisasi_40hc)
    teus_turun_cy = (turun_cy_20dc) + (turun_cy_40hc * 2)

    percentage_vessel = teus_realisasi / cm.teus_pengajuan if cm.teus_pengajuan > 0 else 0

    cm.shipside_yes_mxd_20dc = shipside_yes_mxd_20dc
    cm.shipside_yes_mxd_40hc = shipside_yes_mxd_40hc
    cm.shipside_yes_fxd_20dc = shipside_yes_fxd_20dc
    cm.shipside_yes_fxd_40hc = shipside_yes_fxd_40hc
    cm.shipside_no_mxd_20dc = shipside_no_mxd_20dc
    cm.shipside_no_mxd_40hc = shipside_no_mxd_40hc
    cm.shipside_no_fxd_20dc = shipside_no_fxd_20dc
    cm.shipside_no_fxd_40hc = shipside_no_fxd_40hc
    cm.total_realisasi_20dc = total_realisasi_20dc
    cm.total_realisasi_40hc = total_realisasi_40hc
    cm.teus_realisasi = teus_realisasi
    cm.turun_cy_20dc = turun_cy_20dc
    cm.turun_cy_40hc = turun_cy_40hc
    cm.teus_turun_cy = teus_turun_cy
    cm.percentage_vessel = percentage_vessel
    cm.obstacles = obstacle

    db.session.commit()

    return jsonify({"msg": "Shipside dan perhitungan terkait berhasil diperbarui", "container_movement": {
        "id": cm.id,
        "voyage_id": cm.voyage_id,
        "shipside_yes_mxd_20dc": cm.shipside_yes_mxd_20dc,
        "shipside_yes_mxd_40hc": cm.shipside_yes_mxd_40hc,
        "shipside_yes_fxd_20dc": cm.shipside_yes_fxd_20dc,
        "shipside_yes_fxd_40hc": cm.shipside_yes_fxd_40hc,
        "shipside_no_mxd_20dc": cm.shipside_no_mxd_20dc,
        "shipside_no_mxd_40hc": cm.shipside_no_mxd_40hc,
        "shipside_no_fxd_20dc": cm.shipside_no_fxd_20dc,
        "shipside_no_fxd_40hc": cm.shipside_no_fxd_40hc,
        "total_realisasi_20dc": cm.total_realisasi_20dc,
        "total_realisasi_40hc": cm.total_realisasi_40hc,
        "teus_realisasi": cm.teus_realisasi,
        "turun_cy_20dc": cm.turun_cy_20dc,
        "turun_cy_40hc": cm.turun_cy_40hc,
        "teus_turun_cy": cm.teus_turun_cy,
        "percentage_vessel": cm.percentage_vessel,
        "obstacles": cm.obstacles,
        "updated_at": cm.updated_at.isoformat() if cm.updated_at else None
    }}), 200