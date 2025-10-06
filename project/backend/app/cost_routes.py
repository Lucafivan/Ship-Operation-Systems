from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from .models import db, CostRate, VoyageCostEstimation

cost_bp = Blueprint('cost', __name__)

@cost_bp.route('/cost-rates', methods=['GET'])
@jwt_required()
def list_cost_rates():
    port_id = request.args.get('port_id', type=int)
    q = CostRate.query
    if port_id:
        q = q.filter(CostRate.port_id == port_id)

    fields = [
        'tdk_tl_20mt','tdk_tl_40mt','tdk_tl_20fl','tdk_tl_40fl',
        'tl_20mt','tl_40mt','tl_20fl','tl_40fl',
        'shipside_yes_20mt','shipside_yes_40mt','shipside_yes_20fl','shipside_yes_40fl',
        'shipside_no_20mt','shipside_no_40mt','shipside_no_20fl','shipside_no_40fl',
        'turun_cy_20mt','turun_cy_40mt','turun_cy_20fl','turun_cy_40fl'
    ]

    items = q.order_by(CostRate.port_id).all()
    resp = []
    for r in items:
        row = {'id': r.id, 'port_id': r.port_id}
        for f in fields:
            row[f] = float(getattr(r, f) or 0)
        resp.append(row)
    return jsonify(resp)


@cost_bp.route('/cost-rates', methods=['POST'])
@jwt_required()
def create_cost_rate():
    data = request.get_json() or {}
    port_id = data.get('port_id')
    if not port_id:
        return jsonify({'msg': 'port_id diperlukan'}), 400

    # Prevent duplicate per port (one row per port)
    exists = CostRate.query.filter_by(port_id=port_id).first()
    if exists:
        return jsonify({'msg': 'CostRate untuk port ini sudah ada. Gunakan PUT untuk update.'}), 400

    rec = CostRate(port_id=port_id)
    # Set any provided cost fields
    for key, val in (data or {}).items():
        if hasattr(CostRate, key) and key not in ['id', 'port_id', 'created_at', 'updated_at']:
            setattr(rec, key, val)

    db.session.add(rec)
    db.session.commit()
    return jsonify({'msg': 'Cost rate dibuat', 'id': rec.id}), 201


@cost_bp.route('/cost-rates/<int:rate_id>', methods=['PUT'])
@jwt_required()
def update_cost_rate(rate_id):
    data = request.get_json() or {}
    rate = CostRate.query.get_or_404(rate_id)
    if 'port_id' in data:
        rate.port_id = data['port_id']
    for key, val in (data or {}).items():
        if hasattr(CostRate, key) and key not in ['id', 'port_id', 'created_at', 'updated_at']:
            setattr(rate, key, val)
    db.session.commit()
    return jsonify({'msg': 'Cost rate diperbarui'})


@cost_bp.route('/cost-rates/<int:rate_id>', methods=['DELETE'])
@jwt_required()
def delete_cost_rate(rate_id):
    rate = CostRate.query.get_or_404(rate_id)
    db.session.delete(rate)
    db.session.commit()
    return jsonify({'msg': 'Cost rate dihapus'})


@cost_bp.route('/cost-estimation/<int:voyage_id>', methods=['GET'])
@jwt_required()
def get_voyage_cost_estimation(voyage_id: int):
    """
    Get saved estimation values for a voyage from voyage_cost_estimations table.
    Returns nulls if no record exists yet.
    """
    rec = (VoyageCostEstimation.query
           .filter_by(voyage_id=voyage_id)
           .order_by(VoyageCostEstimation.id.desc())
           .first())

    def to_float(val):
        try:
            return float(val) if val is not None else None
        except Exception:
            return None

    return jsonify({
        'voyage_id': voyage_id,
        'estimation_cost1': to_float(rec.estimation_cost1) if rec else None,
        'estimation_cost2': to_float(rec.estimation_cost2) if rec else None,
        'final_cost': to_float(rec.final_cost) if rec else None,
        'computed_at': rec.computed_at.isoformat() if rec and rec.computed_at else None
    })

