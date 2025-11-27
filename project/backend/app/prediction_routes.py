import os
import joblib
import pandas as pd
from flask import Blueprint, request, jsonify
from .models import CostRate, Voyage

ml_bp = Blueprint('ml_api', __name__)
loaded_models = {}
# Variabel 'flag' untuk memastikan model hanya di-load satu kali
models_loaded_flag = False

model_files = {
    "bongkaran_pengajuan_empty_20": "Bongkaran to Pengajuan/bongkaran_pengajuan_empty_20.pkl",
    "bongkaran_pengajuan_empty_40": "Bongkaran to Pengajuan/bongkaran_pengajuan_empty_40.pkl",
    "bongkaran_pengajuan_full_20": "Bongkaran to Pengajuan/bongkaran_pengajuan_full_20.pkl",
    "bongkaran_pengajuan_full_40": "Bongkaran to Pengajuan/bongkaran_pengajuan_full_40.pkl",
    "pengajuan_acc_empty_20": "Pengajuan to ACC/pengajuan_acc_empty_20.pkl",
    "pengajuan_acc_empty_40": "Pengajuan to ACC/pengajuan_acc_empty_40.pkl",
    "pengajuan_acc_full_20": "Pengajuan to ACC/pengajuan_acc_full_20.pkl",
    "pengajuan_acc_full_40": "Pengajuan to ACC/pengajuan_acc_full_40.pkl",
    "acc_realisasi_empty_20": "ACC to Realisasi and Shipside/acc_realisasi_shipside_empty_20.pkl",
    "acc_realisasi_empty_40": "ACC to Realisasi and Shipside/acc_realisasi_shipside_empty_40.pkl",
    "acc_realisasi_full_20": "ACC to Realisasi and Shipside/acc_realisasi_shipside_full_20.pkl",
    "acc_realisasi_full_40": "ACC to Realisasi and Shipside/acc_realisasi_shipside_full_40.pkl",
}

def load_all_models(app):
    backend_path = os.path.dirname(app.root_path)
    models_path = os.path.join(backend_path, 'ml_models')

    print(f"Mencari model di path: {models_path}")
    
    with app.app_context(): # Pastikan kita berada dalam konteks aplikasi
        for key, file_path in model_files.items():
            full_path = os.path.join(models_path, file_path)
            try:
                loaded_models[key] = joblib.load(full_path)
                print(f"  [OK] Model '{key}' berhasil dimuat.")
            except FileNotFoundError:
                loaded_models[key] = None
                print(f"  [ERROR] Model '{key}' tidak ditemukan di {full_path}")

def handle_prediction(model_key, expected_target_name):
    model = loaded_models.get(model_key)
    if model is None:
        return jsonify({"error": f"Model '{model_key}' tidak dapat dimuat atau tidak ditemukan."}), 500
    data = request.get_json()
    if not data:
        return jsonify({"error": "Input JSON tidak valid."}), 400
    try:
        input_df = pd.DataFrame(data, index=[0])
        prediction = model.predict(input_df)
        result = {"model_used": model_key, "prediction": { expected_target_name: round(prediction[0]) }}
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def handle_multi_output_prediction(model_key, target_names):
    model = loaded_models.get(model_key)
    if model is None:
        return jsonify({"error": f"Model '{model_key}' tidak dapat dimuat atau tidak ditemukan."}), 500
    data = request.get_json()
    if not data:
        return jsonify({"error": "Input JSON tidak valid."}), 400
    try:
        input_df = pd.DataFrame(data, index=[0])
        prediction = model.predict(input_df)
        result = {
            "model_used": model_key,
            "prediction": {
                target_names[0]: round(prediction[0][0]),
                target_names[1]: round(prediction[0][1]),
                target_names[2]: round(prediction[0][2]),
            }
        }
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ml_bp.route('/cost_estimation_preview', methods=['POST'])
def cost_estimation_preview():
    """Hitung Estimasi Cost 1 & 2 (moneter) per port berbasis prediksi pengajuan & acc.

    Input JSON:
    {
      "voyage_id": 123,
      "bongkaran": {"empty_20": 10, "empty_40": 5, "full_20": 3, "full_40": 7},
      "ports": [
         {"port_id": 1, "pengajuan": {"empty_20": 8, ...}, "acc": {"empty_20": 6, ...}},
         ...
      ]
    }

    Mengembalikan estimasi_cost1 & estimasi_cost2 per port menggunakan formula:
      Cost1 = p*tl + (b-p)*tdk_tl
      Cost2 = acc*tl + (b-acc)*tdk_tl
    Per kategori size, dijumlahkan menjadi total.
    Jika CostRate untuk port tidak ada -> nilai null.
    """
    data = request.get_json() or {}
    voyage_id = data.get('voyage_id')
    bongkaran = data.get('bongkaran') or {}
    ports_payload = data.get('ports') or []

    # Optional: validasi voyage (tidak wajib ada kalau sekadar preview)
    voyage = None
    if voyage_id:
        voyage = Voyage.query.get(voyage_id)

    def safe_int(x):
        try:
            return int(x or 0)
        except Exception:
            return 0

    # Mapping size key -> suffix rate
    suffix_map = {
        'empty_20': '20mt',
        'empty_40': '40mt',
        'full_20':  '20fl',
        'full_40':  '40fl',
    }

    results = []
    for port_entry in ports_payload:
        port_id = port_entry.get('port_id')
        pengajuan_map = port_entry.get('pengajuan') or {}
        acc_map = port_entry.get('acc') or {}
        rate = CostRate.query.filter_by(port_id=port_id).first()
        if not rate:
            results.append({
                'port_id': port_id,
                'estimation_cost1': None,
                'estimation_cost2': None,
                'detail': {},
                'has_rate': False,
            })
            continue
        total_cost1 = 0.0
        total_cost2 = 0.0
        detail = {}
        for size_key, suffix in suffix_map.items():
            b_val = safe_int(bongkaran.get(size_key))
            p_val = safe_int(pengajuan_map.get(size_key))
            acc_val = safe_int(acc_map.get(size_key))
            tl_rate = float(getattr(rate, f'tl_{suffix}', 0) or 0)
            tdk_tl_rate = float(getattr(rate, f'tdk_tl_{suffix}', 0) or 0)
            cost1_cat = p_val * tl_rate + max(0, b_val - p_val) * tdk_tl_rate
            cost2_cat = acc_val * tl_rate + max(0, b_val - acc_val) * tdk_tl_rate
            total_cost1 += cost1_cat
            total_cost2 += cost2_cat
            detail[size_key] = {
                'b': b_val,
                'p': p_val,
                'acc': acc_val,
                'tl_rate': tl_rate,
                'tdk_tl_rate': tdk_tl_rate,
                'cost1_segment': cost1_cat,
                'cost2_segment': cost2_cat,
            }
        results.append({
            'port_id': port_id,
            'estimation_cost1': round(total_cost1, 2),
            'estimation_cost2': round(total_cost2, 2),
            'detail': detail,
            'has_rate': True,
        })

    return jsonify({
        'voyage_id': voyage_id,
        'has_voyage': voyage is not None,
        'costs': results,
    })

@ml_bp.route('/bongkaran_to_pengajuan/empty_20', methods=['POST'])
def pred_bongkaran_pengajuan_e20():
    return handle_prediction("bongkaran_pengajuan_empty_20", "PENGAJUAN KE PLANNER_EMPTY_20 DC")

@ml_bp.route('/bongkaran_to_pengajuan/empty_40', methods=['POST'])
def pred_bongkaran_pengajuan_e40():
    return handle_prediction("bongkaran_pengajuan_empty_40", "PENGAJUAN KE PLANNER_EMPTY_40 HC")

@ml_bp.route('/bongkaran_to_pengajuan/full_20', methods=['POST'])
def pred_bongkaran_pengajuan_f20():
    return handle_prediction("bongkaran_pengajuan_full_20", "PENGAJUAN KE PLANNER_FULL_20 DC")

@ml_bp.route('/bongkaran_to_pengajuan/full_40', methods=['POST'])
def pred_bongkaran_pengajuan_f40():
    return handle_prediction("bongkaran_pengajuan_full_40", "PENGAJUAN KE PLANNER_FULL_40 HC")

@ml_bp.route('/pengajuan_to_acc/empty_20', methods=['POST'])
def pred_pengajuan_acc_e20():
    return handle_prediction("pengajuan_acc_empty_20", "ACC PENGAJUAN_EMPTY_20 DC")

@ml_bp.route('/pengajuan_to_acc/empty_40', methods=['POST'])
def pred_pengajuan_acc_e40():
    return handle_prediction("pengajuan_acc_empty_40", "ACC PENGAJUAN_EMPTY_40 HC")

@ml_bp.route('/pengajuan_to_acc/full_20', methods=['POST'])
def pred_pengajuan_acc_f20():
    return handle_prediction("pengajuan_acc_full_20", "ACC PENGAJUAN_FULL_20 DC")

@ml_bp.route('/pengajuan_to_acc/full_40', methods=['POST'])
def pred_pengajuan_acc_f40():
    return handle_prediction("pengajuan_acc_full_40", "ACC PENGAJUAN_FULL_40 HC")

@ml_bp.route('/acc_to_realisasi/empty_20', methods=['POST'])
def pred_acc_realisasi_e20():
    targets = ["REALISASI_ALL_DEPO_MXD_20_DC", "SHIPSIDE_YES_MXD_20_DC", "SHIPSIDE_NO_MXD_20_DC"]
    return handle_multi_output_prediction("acc_realisasi_empty_20", targets)

@ml_bp.route('/acc_to_realisasi/empty_40', methods=['POST'])
def pred_acc_realisasi_e40():
    targets = ["REALISASI_ALL_DEPO_MXD_40_HC", "SHIPSIDE_YES_MXD_40_HC", "SHIPSIDE_NO_MXD_40_HC"]
    return handle_multi_output_prediction("acc_realisasi_empty_40", targets)

@ml_bp.route('/acc_to_realisasi/full_20', methods=['POST'])
def pred_acc_realisasi_f20():
    targets = ["REALISASI_ALL_DEPO_FXD_20_DC", "SHIPSIDE_YES_FXD_20_DC", "SHIPSIDE_NO_FXD_20_DC"]
    return handle_multi_output_prediction("acc_realisasi_full_20", targets)

@ml_bp.route('/acc_to_realisasi/full_40', methods=['POST'])
def pred_acc_realisasi_f40():
    targets = ["REALISASI_ALL_DEPO_FXD_40_HC", "SHIPSIDE_YES_FXD_40_HC", "SHIPSIDE_NO_FXD_40_HC"]
    return handle_multi_output_prediction("acc_realisasi_full_40", targets)