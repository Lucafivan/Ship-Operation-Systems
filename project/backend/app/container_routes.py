from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from .models import db, ContainerMovement, Voyage, Port, PercentageContainerMovement
from sqlalchemy.sql import func

cm_bp = Blueprint('container_movements', __name__)

@cm_bp.route('/', methods=['GET'])
@jwt_required()
def get_container_movements():

    results = db.session.query(Voyage, ContainerMovement, Port).outerjoin(
        ContainerMovement, Voyage.id == ContainerMovement.voyage_id
    ).join(Port, Voyage.port_id == Port.id).all()

    response_data = []

    for voyage, movement, port in results:
        
        item_data = {
            "id": movement.id if movement else None,
            "voyage_id": voyage.id,
            "vessel_name": voyage.vessel.name if voyage.vessel else None,
            "voyage_number": voyage.voyage_no,
            "voyage_year": voyage.voyage_yr,
            "port_id": voyage.port_id,
            "port_name": port.name if port else (voyage.port.name if voyage.port else None),
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
    try:
        bongkaran_empty_20dc = max(int(data.get('bongkaran_empty_20dc', 0)), 0)
        bongkaran_empty_40hc = max(int(data.get('bongkaran_empty_40hc', 0)), 0)
        bongkaran_full_20dc = max(int(data.get('bongkaran_full_20dc', 0)), 0)
        bongkaran_full_40hc = max(int(data.get('bongkaran_full_40hc', 0)), 0)
    except (ValueError, TypeError):
        return jsonify({"msg": "Format input bongkaran tidak valid"}), 400

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
    # Flush supaya ID tersedia sebelum membuat record persentase
    db.session.flush()

    # Hitung total bongkaran per size
    total_bongkaran_20dc = bongkaran_empty_20dc + bongkaran_full_20dc
    total_bongkaran_40hc = bongkaran_empty_40hc + bongkaran_full_40hc

    # Buat record PercentageContainerMovement (awalnya pengajuan & acc belum ada => 0)
    pcm = PercentageContainerMovement(
        cm_id=new_cm.id,
        total_bongkaran_20dc=total_bongkaran_20dc,
        total_bongkaran_40hc=total_bongkaran_40hc,
        # Field rasio pengajuan terhadap bongkaran masih 0 karena pengajuan belum diinput
        bongkaran_pengajuan_empty_20dc=0,
        bongkaran_pengajuan_full_20dc=0,
        bongkaran_pengajuan_empty_40hc=0,
        bongkaran_pengajuan_full_40hc=0,
        # Persentase total pengajuan per size juga 0 (belum ada pengajuan)
        percentage_pengajuan_20dc=0,
        percentage_pengajuan_40hc=0
    )
    db.session.add(pcm)
    db.session.commit()

    return jsonify({
        "msg": "Bongkaran & total bongkaran berhasil dibuat",
        "container_movement": {
            "id": new_cm.id,
            "voyage_id": new_cm.voyage_id,
            "bongkaran_empty_20dc": new_cm.bongkaran_empty_20dc,
            "bongkaran_empty_40hc": new_cm.bongkaran_empty_40hc,
            "bongkaran_full_20dc": new_cm.bongkaran_full_20dc,
            "bongkaran_full_40hc": new_cm.bongkaran_full_40hc,
            "created_at": new_cm.created_at.isoformat() if new_cm.created_at else None
        },
        "percentage_container_movement": {
            "cm_id": pcm.cm_id,
            "total_bongkaran_20dc": pcm.total_bongkaran_20dc,
            "total_bongkaran_40hc": pcm.total_bongkaran_40hc,
            "percentage_pengajuan_20dc": pcm.percentage_pengajuan_20dc,
            "percentage_pengajuan_40hc": pcm.percentage_pengajuan_40hc
        }
    }), 201

@cm_bp.route('/pengajuan', methods=['POST'])
@jwt_required()
def create_pengajuan():
    data = request.get_json()
    cm_id = data.get('id')
    if not cm_id:
        return jsonify({"msg": "id diperlukan"}), 400
    
    try:
        pengajuan_empty_20dc = max(int(data.get('pengajuan_empty_20dc', 0)), 0)
        pengajuan_empty_40hc = max(int(data.get('pengajuan_empty_40hc', 0)), 0)
        pengajuan_full_20dc = max(int(data.get('pengajuan_full_20dc', 0)), 0)
        pengajuan_full_40hc = max(int(data.get('pengajuan_full_40hc', 0)), 0)
    except (ValueError, TypeError):
        return jsonify({"msg": "Format input pengajuan tidak valid"}), 400

    cm = ContainerMovement.query.filter_by(id=cm_id).first()
    if not cm:
        return jsonify({"msg": "ContainerMovement tidak ditemukan"}), 404

    # Update nilai pengajuan di ContainerMovement
    cm.pengajuan_empty_20dc = pengajuan_empty_20dc
    cm.pengajuan_empty_40hc = pengajuan_empty_40hc
    cm.pengajuan_full_20dc = pengajuan_full_20dc
    cm.pengajuan_full_40hc = pengajuan_full_40hc

    # Upsert ke tabel PercentageContainerMovement
    pcm = PercentageContainerMovement.query.filter_by(cm_id=cm.id).first()
    created_new_pcm = False
    if not pcm:
        pcm = PercentageContainerMovement(cm_id=cm.id)
        pcm.total_bongkaran_20dc = (cm.bongkaran_empty_20dc or 0) + (cm.bongkaran_full_20dc or 0)
        pcm.total_bongkaran_40hc = (cm.bongkaran_empty_40hc or 0) + (cm.bongkaran_full_40hc or 0)
        db.session.add(pcm)
        created_new_pcm = True

    # Hitung total pengajuan per size
    total_pengajuan_20dc = pengajuan_empty_20dc + pengajuan_full_20dc
    total_pengajuan_40hc = pengajuan_empty_40hc + pengajuan_full_40hc

    # Helper fungsi safe division (hasil 0..1; jika bongkaran 0 => 0)
    def ratio(pengajuan, bongkaran):
        if bongkaran and bongkaran > 0:
            return pengajuan / bongkaran
        return 0

    # Rasio per kategori (pengajuan / bongkaran)
    bongkaran_pengajuan_empty_20dc = ratio(pengajuan_empty_20dc, cm.bongkaran_empty_20dc)
    bongkaran_pengajuan_full_20dc = ratio(pengajuan_full_20dc, cm.bongkaran_full_20dc)
    bongkaran_pengajuan_empty_40hc = ratio(pengajuan_empty_40hc, cm.bongkaran_empty_40hc)
    bongkaran_pengajuan_full_40hc = ratio(pengajuan_full_40hc, cm.bongkaran_full_40hc)

    # Rasio total per size
    percentage_pengajuan_20dc = ratio(total_pengajuan_20dc, pcm.total_bongkaran_20dc)
    percentage_pengajuan_40hc = ratio(total_pengajuan_40hc, pcm.total_bongkaran_40hc)

    pcm.bongkaran_pengajuan_empty_20dc = bongkaran_pengajuan_empty_20dc
    pcm.bongkaran_pengajuan_full_20dc = bongkaran_pengajuan_full_20dc
    pcm.bongkaran_pengajuan_empty_40hc = bongkaran_pengajuan_empty_40hc
    pcm.bongkaran_pengajuan_full_40hc = bongkaran_pengajuan_full_40hc

    pcm.total_pengajuan_20dc = total_pengajuan_20dc
    pcm.total_pengajuan_40hc = total_pengajuan_40hc
    pcm.percentage_pengajuan_20dc = percentage_pengajuan_20dc
    pcm.percentage_pengajuan_40hc = percentage_pengajuan_40hc

    if created_new_pcm:
        db.session.add(pcm)

    db.session.commit()

    return jsonify({
        "msg": "Pengajuan & persentase berhasil diperbarui",
        "container_movement": {
            "id": cm.id,
            "voyage_id": cm.voyage_id,
            "pengajuan_empty_20dc": cm.pengajuan_empty_20dc,
            "pengajuan_empty_40hc": cm.pengajuan_empty_40hc,
            "pengajuan_full_20dc": cm.pengajuan_full_20dc,
            "pengajuan_full_40hc": cm.pengajuan_full_40hc,
            "updated_at": cm.updated_at.isoformat() if cm.updated_at else None
        },
        "percentage_container_movement": {
            "cm_id": pcm.cm_id,
            "bongkaran_pengajuan_empty_20dc": pcm.bongkaran_pengajuan_empty_20dc,
            "bongkaran_pengajuan_full_20dc": pcm.bongkaran_pengajuan_full_20dc,
            "bongkaran_pengajuan_empty_40hc": pcm.bongkaran_pengajuan_empty_40hc,
            "bongkaran_pengajuan_full_40hc": pcm.bongkaran_pengajuan_full_40hc,
            "total_pengajuan_20dc": pcm.total_pengajuan_20dc,
            "total_pengajuan_40hc": pcm.total_pengajuan_40hc,
            "percentage_pengajuan_20dc": pcm.percentage_pengajuan_20dc,
            "percentage_pengajuan_40hc": pcm.percentage_pengajuan_40hc,
            "created": created_new_pcm
        }
    }), 200

@cm_bp.route('/acc_pengajuan', methods=['POST'])
@jwt_required()
def create_acc_pengajuan():
    data = request.get_json()
    cm_id = data.get('id')
    if not cm_id:
        return jsonify({"msg": "id diperlukan"}), 400
    
    try:
        acc_pengajuan_empty_20dc = max(int(data.get('acc_pengajuan_empty_20dc', 0)), 0)
        acc_pengajuan_empty_40hc = max(int(data.get('acc_pengajuan_empty_40hc', 0)), 0)
        acc_pengajuan_full_20dc = max(int(data.get('acc_pengajuan_full_20dc', 0)), 0)
        acc_pengajuan_full_40hc = max(int(data.get('acc_pengajuan_full_40hc', 0)), 0)
    except (ValueError, TypeError):
        return jsonify({"msg": "Format input ACC Pengajuan tidak valid"}), 400
    total_pengajuan_20dc = acc_pengajuan_empty_20dc + acc_pengajuan_full_20dc
    total_pengajuan_40hc = acc_pengajuan_empty_40hc + acc_pengajuan_full_40hc
    teus_pengajuan = (total_pengajuan_20dc) + (total_pengajuan_40hc * 2)

    cm = ContainerMovement.query.filter_by(id=cm_id).first()
    if not cm:
        return jsonify({"msg": "ContainerMovement tidak ditemukan"}), 404

    if any(v is None for v in [
        cm.pengajuan_empty_20dc, cm.pengajuan_empty_40hc,
        cm.pengajuan_full_20dc, cm.pengajuan_full_40hc
    ]):
        return jsonify({"msg": "Data pengajuan belum tersedia untuk ContainerMovement ini"}), 400

    violations = []
    if acc_pengajuan_empty_20dc > (cm.pengajuan_empty_20dc or 0):
        violations.append({"field": "acc_pengajuan_empty_20dc", "value": acc_pengajuan_empty_20dc, "max": cm.pengajuan_empty_20dc or 0,
                           "msg": f"ACC Pengajuan Empty 20DC ({acc_pengajuan_empty_20dc}) melebihi Pengajuan ({cm.pengajuan_empty_20dc or 0})."})
    if acc_pengajuan_empty_40hc > (cm.pengajuan_empty_40hc or 0):
        violations.append({"field": "acc_pengajuan_empty_40hc", "value": acc_pengajuan_empty_40hc, "max": cm.pengajuan_empty_40hc or 0,
                           "msg": f"ACC Pengajuan Empty 40HC ({acc_pengajuan_empty_40hc}) melebihi Pengajuan ({cm.pengajuan_empty_40hc or 0})."})
    if acc_pengajuan_full_20dc > (cm.pengajuan_full_20dc or 0):
        violations.append({"field": "acc_pengajuan_full_20dc", "value": acc_pengajuan_full_20dc, "max": cm.pengajuan_full_20dc or 0,
                           "msg": f"ACC Pengajuan Full 20DC ({acc_pengajuan_full_20dc}) melebihi Pengajuan ({cm.pengajuan_full_20dc or 0})."})
    if acc_pengajuan_full_40hc > (cm.pengajuan_full_40hc or 0):
        violations.append({"field": "acc_pengajuan_full_40hc", "value": acc_pengajuan_full_40hc, "max": cm.pengajuan_full_40hc or 0,
                           "msg": f"ACC Pengajuan Full 40HC ({acc_pengajuan_full_40hc}) melebihi Pengajuan ({cm.pengajuan_full_40hc or 0})."})

    if violations:
        return jsonify({"msg": "ACC Pengajuan melebihi nilai Pengajuan", "violations": violations}), 400

    cm.acc_pengajuan_empty_20dc = acc_pengajuan_empty_20dc
    cm.acc_pengajuan_empty_40hc = acc_pengajuan_empty_40hc
    cm.acc_pengajuan_full_20dc = acc_pengajuan_full_20dc
    cm.acc_pengajuan_full_40hc = acc_pengajuan_full_40hc
    cm.total_pengajuan_20dc = total_pengajuan_20dc
    cm.total_pengajuan_40hc = total_pengajuan_40hc
    cm.teus_pengajuan = teus_pengajuan

    # Update / buat PercentageContainerMovement untuk rasio ACC terhadap Pengajuan & Bongkaran
    pcm = PercentageContainerMovement.query.filter_by(cm_id=cm.id).first()
    if not pcm:
        # Seharusnya sudah dibuat saat bongkaran, tapi fallback jika belum ada
        pcm = PercentageContainerMovement(cm_id=cm.id)
        # Tarik total bongkaran dari cm (jika belum diset di pcm)
        pcm.total_bongkaran_20dc = (cm.bongkaran_empty_20dc or 0) + (cm.bongkaran_full_20dc or 0)
        pcm.total_bongkaran_40hc = (cm.bongkaran_empty_40hc or 0) + (cm.bongkaran_full_40hc or 0)
        db.session.add(pcm)

    # Total ACC per size
    total_acc_20dc = acc_pengajuan_empty_20dc + acc_pengajuan_full_20dc
    total_acc_40hc = acc_pengajuan_empty_40hc + acc_pengajuan_full_40hc

    # Helper pembagi aman
    def ratio(pengajuan, bongkaran):
        if bongkaran and bongkaran > 0:
            return pengajuan / bongkaran
        return 0

    # Rasio pengajuan -> ACC per kategori
    pcm.pengajuan_acc_empty_20dc = ratio(acc_pengajuan_empty_20dc, cm.pengajuan_empty_20dc)
    pcm.pengajuan_acc_full_20dc = ratio(acc_pengajuan_full_20dc, cm.pengajuan_full_20dc)
    pcm.pengajuan_acc_empty_40hc = ratio(acc_pengajuan_empty_40hc, cm.pengajuan_empty_40hc)
    pcm.pengajuan_acc_full_40hc = ratio(acc_pengajuan_full_40hc, cm.pengajuan_full_40hc)

    # Simpan total ACC
    pcm.total_acc_20dc = total_acc_20dc
    pcm.total_acc_40hc = total_acc_40hc

    # Persentase ACC terhadap total bongkaran (mirip pola percentage_pengajuan_*)
    pcm.percentage_acc_20dc = ratio(total_acc_20dc, pcm.total_bongkaran_20dc)
    pcm.percentage_acc_40hc = ratio(total_acc_40hc, pcm.total_bongkaran_40hc)

    db.session.commit()

    return jsonify({
        "msg": "Acc Pengajuan & persentase ACC berhasil diperbarui",
        "container_movement": {
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
        },
        "percentage_container_movement": {
            "cm_id": pcm.cm_id,
            "pengajuan_acc_empty_20dc": pcm.pengajuan_acc_empty_20dc,
            "pengajuan_acc_full_20dc": pcm.pengajuan_acc_full_20dc,
            "pengajuan_acc_empty_40hc": pcm.pengajuan_acc_empty_40hc,
            "pengajuan_acc_full_40hc": pcm.pengajuan_acc_full_40hc,
            "total_acc_20dc": pcm.total_acc_20dc,
            "total_acc_40hc": pcm.total_acc_40hc,
            "percentage_acc_20dc": pcm.percentage_acc_20dc,
            "percentage_acc_40hc": pcm.percentage_acc_40hc
        }
    }), 200

@cm_bp.route('/realisasi_shipside', methods=['POST'])
@jwt_required()
def create_realisasi_shipside():
    data = request.get_json()
    cm_id = data.get('id')
    if not cm_id:
        return jsonify({"msg": "id diperlukan"}), 400

    try:
        realisasi_mxd_20dc = max(int(data.get('realisasi_mxd_20dc', 0)), 0)
        realisasi_mxd_40hc = max(int(data.get('realisasi_mxd_40hc', 0)), 0)
        realisasi_fxd_20dc = max(int(data.get('realisasi_fxd_20dc', 0)), 0)
        realisasi_fxd_40hc = max(int(data.get('realisasi_fxd_40hc', 0)), 0)
        shipside_yes_mxd_20dc = max(int(data.get('shipside_yes_mxd_20dc', 0)), 0)
        shipside_yes_mxd_40hc = max(int(data.get('shipside_yes_mxd_40hc', 0)), 0)
        shipside_yes_fxd_20dc = max(int(data.get('shipside_yes_fxd_20dc', 0)), 0)
        shipside_yes_fxd_40hc = max(int(data.get('shipside_yes_fxd_40hc', 0)), 0)
        shipside_no_mxd_20dc = max(int(data.get('shipside_no_mxd_20dc', 0)), 0)
        shipside_no_mxd_40hc = max(int(data.get('shipside_no_mxd_40hc', 0)), 0)
        shipside_no_fxd_20dc = max(int(data.get('shipside_no_fxd_20dc', 0)), 0)
        shipside_no_fxd_40hc = max(int(data.get('shipside_no_fxd_40hc', 0)), 0)
    except (ValueError, TypeError):
        return jsonify({"msg": "Format input realisasi/shipside tidak valid"}), 400

    cm = ContainerMovement.query.filter_by(id=cm_id).first()
    if not cm:
        return jsonify({"msg": "ContainerMovement tidak ditemukan"}), 404
    if any(v is None for v in [cm.acc_pengajuan_empty_20dc, cm.acc_pengajuan_empty_40hc, cm.acc_pengajuan_full_20dc, cm.acc_pengajuan_full_40hc]):
        return jsonify({"msg": "Data ACC Pengajuan belum tersedia untuk ContainerMovement ini"}), 400

    total_realisasi_empty_20dc = realisasi_mxd_20dc + shipside_yes_mxd_20dc + shipside_no_mxd_20dc
    total_realisasi_empty_40hc = realisasi_mxd_40hc + shipside_yes_mxd_40hc + shipside_no_mxd_40hc
    total_realisasi_full_20dc = realisasi_fxd_20dc + shipside_yes_fxd_20dc + shipside_no_fxd_20dc
    total_realisasi_full_40hc = realisasi_fxd_40hc + shipside_yes_fxd_40hc + shipside_no_fxd_40hc

    total_realisasi_20dc = total_realisasi_empty_20dc + total_realisasi_full_20dc
    total_realisasi_40hc = total_realisasi_empty_40hc + total_realisasi_full_40hc

    violations = []
    if total_realisasi_empty_20dc > (cm.acc_pengajuan_empty_20dc or 0):
        violations.append({"field": "realisasi/shipside_empty_20dc", "value": total_realisasi_empty_20dc, "max": cm.acc_pengajuan_empty_20dc or 0,
                           "msg": f"Total Realisasi/Shipside Empty 20DC ({total_realisasi_empty_20dc}) melebihi ACC Pengajuan ({cm.acc_pengajuan_empty_20dc or 0})."})
    if total_realisasi_empty_40hc > (cm.acc_pengajuan_empty_40hc or 0):
        violations.append({"field": "realisasi/shipside_empty_40hc", "value": total_realisasi_empty_40hc, "max": cm.acc_pengajuan_empty_40hc or 0,
                           "msg": f"Total Realisasi/Shipside Empty 40HC ({total_realisasi_empty_40hc}) melebihi ACC Pengajuan ({cm.acc_pengajuan_empty_40hc or 0})."})
    if total_realisasi_full_20dc > (cm.acc_pengajuan_full_20dc or 0):
        violations.append({"field": "realisasi/shipside_full_20dc", "value": total_realisasi_full_20dc, "max": cm.acc_pengajuan_full_20dc or 0,
                           "msg": f"Total Realisasi/Shipside Full 20DC ({total_realisasi_full_20dc}) melebihi ACC Pengajuan ({cm.acc_pengajuan_full_20dc or 0})."})
    if total_realisasi_full_40hc > (cm.acc_pengajuan_full_40hc or 0):
        violations.append({"field": "realisasi/shipside_full_40hc", "value": total_realisasi_full_40hc, "max": cm.acc_pengajuan_full_40hc or 0,
                           "msg": f"Total Realisasi/Shipside Full 40HC ({total_realisasi_full_40hc}) melebihi ACC Pengajuan ({cm.acc_pengajuan_full_40hc or 0})."})

    if violations:
        return jsonify({"msg": "Realisasi/Shipside melebihi batas ACC Pengajuan", "violations": violations}), 400

    cm.realisasi_mxd_20dc = realisasi_mxd_20dc
    cm.realisasi_mxd_40hc = realisasi_mxd_40hc
    cm.realisasi_fxd_20dc = realisasi_fxd_20dc
    cm.realisasi_fxd_40hc = realisasi_fxd_40hc

    cm.shipside_yes_mxd_20dc = shipside_yes_mxd_20dc
    cm.shipside_yes_mxd_40hc = shipside_yes_mxd_40hc
    cm.shipside_yes_fxd_20dc = shipside_yes_fxd_20dc
    cm.shipside_yes_fxd_40hc = shipside_yes_fxd_40hc
    cm.shipside_no_mxd_20dc = shipside_no_mxd_20dc
    cm.shipside_no_mxd_40hc = shipside_no_mxd_40hc
    cm.shipside_no_fxd_20dc = shipside_no_fxd_20dc
    cm.shipside_no_fxd_40hc = shipside_no_fxd_40hc

    teus_realisasi = (total_realisasi_20dc) + (total_realisasi_40hc * 2)
    turun_cy_20dc = (cm.total_pengajuan_20dc - total_realisasi_20dc)
    turun_cy_40hc = (cm.total_pengajuan_40hc - total_realisasi_40hc)
    teus_turun_cy = (turun_cy_20dc) + (turun_cy_40hc * 2)
    percentage_vessel = teus_realisasi / cm.teus_pengajuan if (cm.teus_pengajuan or 0) > 0 else 0

    cm.total_realisasi_20dc = total_realisasi_20dc
    cm.total_realisasi_40hc = total_realisasi_40hc
    cm.teus_realisasi = teus_realisasi
    cm.turun_cy_20dc = turun_cy_20dc
    cm.turun_cy_40hc = turun_cy_40hc
    cm.teus_turun_cy = teus_turun_cy
    cm.percentage_vessel = percentage_vessel

    # Update PercentageContainerMovement (TLSS & Turun CY & Realisasi)
    pcm = PercentageContainerMovement.query.filter_by(cm_id=cm.id).first()
    if not pcm:
        pcm = PercentageContainerMovement(cm_id=cm.id)
        pcm.total_bongkaran_20dc = (cm.bongkaran_empty_20dc or 0) + (cm.bongkaran_full_20dc or 0)
        pcm.total_bongkaran_40hc = (cm.bongkaran_empty_40hc or 0) + (cm.bongkaran_full_40hc or 0)
        db.session.add(pcm)

    # Turun CY per kategori (ACC - realisasi)
    turun_cy_empty_20dc = (cm.acc_pengajuan_empty_20dc or 0) - total_realisasi_empty_20dc
    turun_cy_full_20dc = (cm.acc_pengajuan_full_20dc or 0) - total_realisasi_full_20dc
    turun_cy_empty_40hc = (cm.acc_pengajuan_empty_40hc or 0) - total_realisasi_empty_40hc
    turun_cy_full_40hc = (cm.acc_pengajuan_full_40hc or 0) - total_realisasi_full_40hc

    # Total TLSS & Turun per size
    total_tlss_20dc = total_realisasi_20dc
    total_tlss_40hc = total_realisasi_40hc
    total_turun_20dc = turun_cy_empty_20dc + turun_cy_full_20dc
    total_turun_40hc = turun_cy_empty_40hc + turun_cy_full_40hc

    def ratio(pengajuan, bongkaran):
        if bongkaran and bongkaran > 0:
            return pengajuan / bongkaran
        return 0

    # Rasio ACC -> TLSS (anggap TLSS = total realisasi per kategori)
    pcm.acc_tlss_empty_20dc = ratio(total_realisasi_empty_20dc, cm.acc_pengajuan_empty_20dc)
    pcm.acc_tlss_full_20dc  = ratio(total_realisasi_full_20dc, cm.acc_pengajuan_full_20dc)
    pcm.acc_tlss_empty_40hc = ratio(total_realisasi_empty_40hc, cm.acc_pengajuan_empty_40hc)
    pcm.acc_tlss_full_40hc  = ratio(total_realisasi_full_40hc, cm.acc_pengajuan_full_40hc)

    # Rasio ACC -> Turun CY per kategori
    pcm.acc_turun_cy_empty_20dc = ratio(turun_cy_empty_20dc, cm.acc_pengajuan_empty_20dc)
    pcm.acc_turun_cy_full_20dc  = ratio(turun_cy_full_20dc, cm.acc_pengajuan_full_20dc)
    pcm.acc_turun_cy_empty_40hc = ratio(turun_cy_empty_40hc, cm.acc_pengajuan_empty_40hc)
    pcm.acc_turun_cy_full_40hc  = ratio(turun_cy_full_40hc, cm.acc_pengajuan_full_40hc)

    # Simpan totals TLSS & Turun
    pcm.total_tlss_20dc = total_tlss_20dc
    pcm.total_tlss_40hc = total_tlss_40hc
    pcm.total_turun_20dc = total_turun_20dc
    pcm.total_turun_40hc = total_turun_40hc

    # Persentase TLSS & Realisasi terhadap baseline bongkaran
    pcm.percentage_tl_20dc = ratio(total_tlss_20dc, pcm.total_bongkaran_20dc)
    pcm.percentage_tl_40hc = ratio(total_tlss_40hc, pcm.total_bongkaran_40hc)
    pcm.percentage_realisasi_20dc = pcm.percentage_tl_20dc
    pcm.percentage_realisasi_40hc = pcm.percentage_tl_40hc

    db.session.commit()

    return jsonify({
        "msg": "Realisasi dan Shipside berhasil diperbarui",
        "container_movement": {
            "id": cm.id,
            "voyage_id": cm.voyage_id,
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
            "updated_at": cm.updated_at.isoformat() if cm.updated_at else None
        },
        "percentage_container_movement": {
            "cm_id": pcm.cm_id,
            "acc_tlss_empty_20dc": pcm.acc_tlss_empty_20dc,
            "acc_tlss_full_20dc": pcm.acc_tlss_full_20dc,
            "acc_tlss_empty_40hc": pcm.acc_tlss_empty_40hc,
            "acc_tlss_full_40hc": pcm.acc_tlss_full_40hc,
            "acc_turun_cy_empty_20dc": pcm.acc_turun_cy_empty_20dc,
            "acc_turun_cy_full_20dc": pcm.acc_turun_cy_full_20dc,
            "acc_turun_cy_empty_40hc": pcm.acc_turun_cy_empty_40hc,
            "acc_turun_cy_full_40hc": pcm.acc_turun_cy_full_40hc,
            "total_tlss_20dc": pcm.total_tlss_20dc,
            "total_tlss_40hc": pcm.total_tlss_40hc,
            "total_turun_20dc": pcm.total_turun_20dc,
            "total_turun_40hc": pcm.total_turun_40hc,
            "percentage_tl_20dc": pcm.percentage_tl_20dc,
            "percentage_tl_40hc": pcm.percentage_tl_40hc,
            "percentage_realisasi_20dc": pcm.percentage_realisasi_20dc,
            "percentage_realisasi_40hc": pcm.percentage_realisasi_40hc
        }
    }), 200

@cm_bp.route('/obstacles', methods=['POST'])
@jwt_required()
def add_obstacles():
    data = request.get_json()
    cm_id = data.get('id')
    obstacles = data.get('obstacles', '')

    if not cm_id:
        return jsonify({"msg": "id diperlukan"}), 400

    cm = ContainerMovement.query.filter_by(id=cm_id).first()
    if not cm:
        return jsonify({"msg": "ContainerMovement tidak ditemukan"}), 404

    cm.obstacles = obstacles
    db.session.commit()

    return jsonify({"msg": "Obstacles berhasil diperbarui", "container_movement": {
        "id": cm.id,
        "voyage_id": cm.voyage_id,
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
        Port.id.label('port_id'),
        Port.name.label('port_name'),
        func.sum(ContainerMovement.teus_pengajuan).label('total_pengajuan'),
        func.sum(ContainerMovement.teus_pengajuan).label('acc_pengajuan'),
        func.sum(ContainerMovement.teus_realisasi).label('total_realisasi')
    ).join(Voyage, Voyage.id == ContainerMovement.voyage_id)\
     .join(Port, Voyage.port_id == Port.id)\
     .group_by(Port.id, Port.name)\
     .all()

    result = [
        {
            "port_id": data.port_id,
            "port_name": data.port_name,
            "total_pengajuan": float(data.total_pengajuan or 0),
            "acc_pengajuan": float(data.acc_pengajuan or 0),
            "total_realisasi": float(data.total_realisasi or 0),
        }
        for data in summary_data
    ]
    
    return jsonify(result), 200