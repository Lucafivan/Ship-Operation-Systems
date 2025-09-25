from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from .models import db, ContainerMovement, Voyage
from sqlalchemy.sql import func

cm_bp = Blueprint('container_movements', __name__)

@cm_bp.route('/', methods=['GET'])
@jwt_required()
def get_container_movements():

    results = db.session.query(Voyage, ContainerMovement).outerjoin(
        ContainerMovement, Voyage.id == ContainerMovement.voyage_id
    ).all()

    response_data = []

    for voyage, movement in results:
        
        item_data = {
            "id": movement.id if movement else None,
            "voyage_id": voyage.id,
            "vessel_name": voyage.vessel.name if voyage.vessel else None,
            "voyage_number": voyage.voyage_no,
            "voyage_year": voyage.voyage_yr,
            "voyage_berth_loc": voyage.berth_loc,
            "voyage_date_berth": voyage.date_berth.isoformat() if voyage.date_berth else None,

            "bongkaran_empty_20dc": movement.bongkaran_empty_20dc if movement else None,
            "bongkaran_empty_40hc": movement.bongkaran_empty_40hc if movement else None,
            "bongkaran_full_20dc": movement.bongkaran_full_20dc if movement else None,
            "bongkaran_full_40hc": movement.bongkaran_full_40hc if movement else None,
            "pengajuan_empty_20dc": movement.pengajuan_empty_20dc if movement else None,
            "pengajuan_empty_40hc": movement.pengajuan_empty_40hc if movement else None,
            "pengajuan_full_20dc": movement.pengajuan_full_20dc if movement else None,
            "pengajuan_full_40hc": movement.pengajuan_full_40hc if movement else None,
            "acc_pengajuan_empty_20dc": movement.acc_pengajuan_empty_20dc if movement else None,
            "acc_pengajuan_empty_40hc": movement.acc_pengajuan_empty_40hc if movement else None,
            "acc_pengajuan_full_20dc": movement.acc_pengajuan_full_20dc if movement else None,
            "acc_pengajuan_full_40hc": movement.acc_pengajuan_full_40hc if movement else None,
            "total_pengajuan_20dc": movement.total_pengajuan_20dc if movement else None,
            "total_pengajuan_40hc": movement.total_pengajuan_40hc if movement else None,
            "teus_pengajuan": movement.teus_pengajuan if movement else None,
            "realisasi_mxd_20dc": movement.realisasi_mxd_20dc if movement else None,
            "realisasi_mxd_40hc": movement.realisasi_mxd_40hc if movement else None,
            "realisasi_fxd_20dc": movement.realisasi_fxd_20dc if movement else None,
            "realisasi_fxd_40hc": movement.realisasi_fxd_40hc if movement else None,
            "shipside_yes_mxd_20dc": movement.shipside_yes_mxd_20dc if movement else None,
            "shipside_yes_mxd_40hc": movement.shipside_yes_mxd_40hc if movement else None,
            "shipside_yes_fxd_20dc": movement.shipside_yes_fxd_20dc if movement else None,
            "shipside_yes_fxd_40hc": movement.shipside_yes_fxd_40hc if movement else None,
            "shipside_no_mxd_20dc": movement.shipside_no_mxd_20dc if movement else None,
            "shipside_no_mxd_40hc": movement.shipside_no_mxd_40hc if movement else None,
            "shipside_no_fxd_20dc": movement.shipside_no_fxd_20dc if movement else None,
            "shipside_no_fxd_40hc": movement.shipside_no_fxd_40hc if movement else None,
            "total_realisasi_20dc": movement.total_realisasi_20dc if movement else None,
            "total_realisasi_40hc": movement.total_realisasi_40hc if movement else None,
            "teus_realisasi": movement.teus_realisasi if movement else None,
            "turun_cy_20dc": movement.turun_cy_20dc if movement else None,
            "turun_cy_40hc": movement.turun_cy_40hc if movement else None,
            "teus_turun_cy": movement.teus_turun_cy if movement else None,
            "percentage_vessel": movement.percentage_vessel if movement else None,
            "obstacles": movement.obstacles if movement else "", # Dibiarkan string kosong
            "created_at": movement.created_at.isoformat() if movement and movement.created_at else None,
            "updated_at": movement.updated_at.isoformat() if movement and movement.updated_at else None
        }
        response_data.append(item_data)
        
    return jsonify(response_data), 200

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

@cm_bp.route('/summary-by-port', methods=['GET'])
@jwt_required()
def get_summary_by_port():
    """
    Endpoint untuk mendapatkan rekap total pengajuan, acc pengajuan,
    dan realisasi per lokasi sandar (port).
    """
    summary_data = db.session.query(
        Voyage.berth_loc,
        func.sum(ContainerMovement.teus_pengajuan).label('total_pengajuan'),
        # Di sini kita asumsikan acc_pengajuan sama dengan total_pengajuan untuk chart
        func.sum(ContainerMovement.teus_pengajuan).label('acc_pengajuan'),
        func.sum(ContainerMovement.teus_realisasi).label('total_realisasi')
    ).join(ContainerMovement, Voyage.id == ContainerMovement.voyage_id)\
     .group_by(Voyage.berth_loc)\
     .all()

    result = [
        {
            "port": data.berth_loc,
            "total_pengajuan": float(data.total_pengajuan or 0),
            "acc_pengajuan": float(data.acc_pengajuan or 0),
            "total_realisasi": float(data.total_realisasi or 0),
        }
        for data in summary_data if data.berth_loc
    ]
    
    return jsonify(result), 200