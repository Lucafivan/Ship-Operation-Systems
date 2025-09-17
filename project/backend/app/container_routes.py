from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from .models import db, ContainerMovement

cm_bp = Blueprint('container_movements', __name__)

@cm_bp.route('/', methods=['GET'])
@jwt_required()
def get_container_movements():
    container_movements = ContainerMovement.query.all()
    container_movements_list = []
    for cm in container_movements:
        vessel_name = cm.voyage.vessel.name if cm.voyage and cm.voyage.vessel else None
        voyage_number = cm.voyage.voyage_no if cm.voyage else None
        voyage_year = cm.voyage.voyage_yr if cm.voyage else None
        voyage_berth_loc = cm.voyage.berth_loc if cm.voyage else None
        voyage_date_berth = cm.voyage.date_berth.isoformat() if cm.voyage and cm.voyage.date_berth else None
        container_movements_list.append({
            "id": cm.id,
            "voyage_id": cm.voyage_id,
            "vessel_name": vessel_name,
            "voyage_number": voyage_number,
            "voyage_year": voyage_year,
            "voyage_berth_loc": voyage_berth_loc,
            "voyage_date_berth": voyage_date_berth,
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

@cm_bp.route('/bongkaran', methods=['POST'])
@jwt_required()
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

@cm_bp.route('/pengajuan', methods=['POST'])
@jwt_required()
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

@cm_bp.route('/acc_pengajuan', methods=['POST'])
@jwt_required()
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

@cm_bp.route('/realisasi', methods=['POST'])
@jwt_required()
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

@cm_bp.route('/shipside', methods=['POST'])
@jwt_required()
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
