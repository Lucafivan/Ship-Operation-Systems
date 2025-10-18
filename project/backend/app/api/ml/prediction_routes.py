import os
import joblib
import pandas as pd
from flask import Blueprint, request, jsonify

# 1. Membuat Blueprint untuk semua rute prediksi
ml_bp = Blueprint('ml_api', __name__)

# 2. Setup path dan muat semua model ke dalam sebuah dictionary
#    Ini lebih rapi daripada membuat 12 variabel terpisah.
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
models_path = os.path.join(base_dir, 'ml_models')

# Daftar semua model yang akan dimuat
model_files = {
    # Bongkaran to Pengajuan
    "bongkaran_pengajuan_empty_20": "Bongkaran to Pengajuan/bongkaran_pengajuan_empty_20.pkl",
    "bongkaran_pengajuan_empty_40": "Bongkaran to Pengajuan/bongkaran_pengajuan_empty_40.pkl",
    "bongkaran_pengajuan_full_20": "Bongkaran to Pengajuan/bongkaran_pengajuan_full_20.pkl",
    "bongkaran_pengajuan_full_40": "Bongkaran to Pengajuan/bongkaran_pengajuan_full_40.pkl",
    # Pengajuan to ACC
    "pengajuan_acc_empty_20": "Pengajuan to ACC/pengajuan_acc_empty_20.pkl",
    "pengajuan_acc_empty_40": "Pengajuan to ACC/pengajuan_acc_empty_40.pkl",
    "pengajuan_acc_full_20": "Pengajuan to ACC/pengajuan_acc_full_20.pkl",
    "pengajuan_acc_full_40": "Pengajuan to ACC/pengajuan_acc_full_40.pkl",
    # ACC to Realisasi and Shipside (Multi-output)
    "acc_realisasi_empty_20": "ACC to Realisasi and Shipside/acc_realisasi_shipside_empty_20.pkl",
    "acc_realisasi_empty_40": "ACC to Realisasi and Shipside/acc_realisasi_shipside_empty_40.pkl",
    "acc_realisasi_full_20": "ACC to Realisasi and Shipside/acc_realisasi_shipside_full_20.pkl",
    "acc_realisasi_full_40": "ACC to Realisasi and Shipside/acc_realisasi_shipside_full_40.pkl",
}

# Dictionary untuk menampung model yang sudah di-load
loaded_models = {}

print("Memuat model-model machine learning...")
for key, file_path in model_files.items():
    full_path = os.path.join(models_path, file_path)
    try:
        loaded_models[key] = joblib.load(full_path)
        print(f"  - Model '{key}' berhasil dimuat.")
    except FileNotFoundError:
        loaded_models[key] = None
        print(f"  - ERROR: Model '{key}' tidak ditemukan di {full_path}")
print("Semua model selesai dimuat.")


# Fungsi generik untuk menangani request prediksi
def handle_prediction(model_key, expected_target_name):
    model = loaded_models.get(model_key)
    if model is None:
        return jsonify({"error": f"Model '{model_key}' tidak dapat dimuat."}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "Input JSON tidak valid."}), 400

    try:
        input_df = pd.DataFrame(data, index=[0])
        prediction = model.predict(input_df)
        
        # Mengembalikan hasil prediksi dalam format yang konsisten
        result = {
            "model_used": model_key,
            "prediction": {
                expected_target_name: round(prediction[0])
            }
        }
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Fungsi generik untuk model multi-output
def handle_multi_output_prediction(model_key, target_names):
    model = loaded_models.get(model_key)
    if model is None:
        return jsonify({"error": f"Model '{model_key}' tidak dapat dimuat."}), 500

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

# 3. Definisikan semua rute prediksi

# --- Rute untuk Bongkaran to Pengajuan ---
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


# --- Rute untuk Pengajuan to ACC ---
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


# --- Rute untuk ACC to Realisasi & Shipside (Multi-Output) ---
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