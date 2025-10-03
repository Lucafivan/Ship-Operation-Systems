from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from .models import db, ContainerMovement, Voyage, Port

percentage_bp = Blueprint("percentage_bp", __name__, url_prefix="/percentages")

def _f(x): return float(x or 0)

def _pct(num, den):
    num = _f(num); den = _f(den)
    return round((num / den * 100.0), 2) if den > 0 else 0.0

def _payload_from_row(row):
    tb20, tb40 = _f(row.tb20), _f(row.tb40)
    tp20, tp40 = _f(row.tp20), _f(row.tp40)
    ta20, ta40 = _f(row.ta20), _f(row.ta40)
    tl20, tl40 = _f(row.tl20), _f(row.tl40)

    tot_bm   = tb20 + tb40
    tot_peng = tp20 + tp40
    tot_acc  = ta20 + ta40
    tot_tlss = tl20 + tl40

    return {
        "port_id": row.port_id,
        "port_name": row.port_name,
        "percentages": {
            # Pengajuan% = Total Pengajuan / Total Bongkar Muat
            "pengajuan": _pct(tot_peng, tot_bm),
            # ACC% = Total ACC / Total Pengajuan
            "acc": _pct(tot_acc, tot_peng),
            # TL% = Total ACC / Total Bongkar Muat
            "tl": _pct(tot_acc, tot_bm),
            # Realisasi% = Total TL+SS / Total Pengajuan
            "realisasi": _pct(tot_tlss, tot_peng),
            "by_size": {
                "20dc": {
                    "pengajuan": _pct(tp20, tb20),
                    "acc": _pct(ta20, tp20),
                    "tl": _pct(ta20, tb20),
                    "realisasi": _pct(tl20, tp20),
                },
                "40hc": {
                    "pengajuan": _pct(tp40, tb40),
                    "acc": _pct(ta40, tp40),
                    "tl": _pct(ta40, tb40),
                    "realisasi": _pct(tl40, tp40),
                },
            },
        },
        "totals": {
            "bongkaran": {"20dc": tb20, "40hc": tb40, "overall": tot_bm},
            "pengajuan": {"20dc": tp20, "40hc": tp40, "overall": tot_peng},
            "acc": {"20dc": ta20, "40hc": ta40, "overall": tot_acc},
            "tlss": {"20dc": tl20, "40hc": tl40, "overall": tot_tlss},
        },
    }

# base query (PORT -> Voyage -> CM; LEFT JOIN CM) 
def _agg_query():
    c = ContainerMovement
    return (
        db.session.query(
            Port.id.label("port_id"),
            Port.name.label("port_name"),
            # Total Bongkaran per size
            func.sum(
                func.coalesce(c.bongkaran_empty_20dc, 0) + func.coalesce(c.bongkaran_full_20dc, 0)
            ).label("tb20"),
            func.sum(
                func.coalesce(c.bongkaran_empty_40hc, 0) + func.coalesce(c.bongkaran_full_40hc, 0)
            ).label("tb40"),
            # Total Pengajuan per size
            func.sum(
                func.coalesce(c.pengajuan_empty_20dc, 0) + func.coalesce(c.pengajuan_full_20dc, 0)
            ).label("tp20"),
            func.sum(
                func.coalesce(c.pengajuan_empty_40hc, 0) + func.coalesce(c.pengajuan_full_40hc, 0)
            ).label("tp40"),
            # Total ACC per size
            func.sum(
                func.coalesce(c.acc_pengajuan_empty_20dc, 0) + func.coalesce(c.acc_pengajuan_full_20dc, 0)
            ).label("ta20"),
            func.sum(
                func.coalesce(c.acc_pengajuan_empty_40hc, 0) + func.coalesce(c.acc_pengajuan_full_40hc, 0)
            ).label("ta40"),
            # Total TL+SS (di CM sudah disimpan sbg total_realisasi_*)
            func.sum(func.coalesce(c.total_realisasi_20dc, 0)).label("tl20"),
            func.sum(func.coalesce(c.total_realisasi_40hc, 0)).label("tl40"),
        )
        .select_from(Port)
        .join(Voyage, Voyage.port_id == Port.id)    # INNER ke voyage
        .outerjoin(c, c.voyage_id == Voyage.id) # LEFT ke CM (agar port dgn CM belum lengkap tetap muncul)
        .group_by(Port.id, Port.name)
        .order_by(Port.name.asc())
    )

@percentage_bp.get("/ping")
def ping():
    return jsonify({"ok": True, "service": "percentages"})

@percentage_bp.get("/summary-by-port")
@jwt_required()
def summary_by_port():
    rows = _agg_query().all()
    return jsonify([_payload_from_row(r) for r in rows]), 200

@percentage_bp.get("/by-port/<int:port_id>")
@jwt_required()
def by_port(port_id: int):
    row = _agg_query().filter(Port.id == port_id).first()
    if row:
        return jsonify(_payload_from_row(row)), 200
    # fallback: port ada tapi belum ada voyage/CM -> kembalikan nol supaya FE tidak error
    port = Port.query.get(port_id)
    if not port:
        return jsonify({"error": "Port not found"}), 404
    zero = type("R", (), dict(
        port_id=port.id, port_name=port.name,
        tb20=0, tb40=0, tp20=0, tp40=0, ta20=0, ta40=0, tl20=0, tl40=0
    ))()
    return jsonify(_payload_from_row(zero)), 200
