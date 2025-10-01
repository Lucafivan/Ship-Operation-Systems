import requests
import json
from flask import Blueprint, request, jsonify

llm_bp = Blueprint("llm", __name__, url_prefix="/llm")

# === Prompt Template ===
def build_prompt(data):
    """
    data = dict dari FE, misalnya:
    {
      "VESSEL_ID": "V17",
      "PORT": "ADP",
      "BONGKARAN_EMPTY_20DC": 120,
      "OBSTACLES": "sandaran bersamaan V04 & V09"
    }
    """
    prompt = f"""
    Anda adalah sistem prediksi operasi kapal.

    Input Data:
    - VESSEL_ID: {data.get('VESSEL_ID')}
    - PORT: {data.get('PORT')}
    - BONGKARAN_EMPTY_20DC: {data.get('BONGKARAN_EMPTY_20DC')}
    - OBSTACLES: {data.get('OBSTACLES')}

    Tugas: Prediksi peluang Pengajuan, ACC, dan Realisasi.
    Format output HARUS JSON seperti ini:
    {{
      "Pengajuan_Prob": 0.0-1.0,
      "ACC_Prob": 0.0-1.0,
      "Realisasi": {{
        "TL": 0.0-1.0,
        "SS": 0.0-1.0,
        "CY": 0.0-1.0
      }},
      "Reasoning": "alasan singkat"
    }}
    """
    return prompt.strip()


@llm_bp.route("/predict", methods=["POST"])
def predict():
    try:
        # Ambil input dari FE
        data = request.json or {}

        # Bangun prompt
        prompt = build_prompt(data)

        # Kirim ke API Kobold
        payload = {
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "mode": "instruct"
        }

        response = requests.post(
            "http://pe.spil.co.id/kobold/v1/chat/completions",
            headers={"Content-Type": "application/json"},
            json=payload
        )

        if response.status_code != 200:
            return jsonify({"error": response.text}), response.status_code

        # Ambil hasil dari API
        result = response.json()
        llm_output = result["choices"][0]["message"]["content"]

        # Coba parse JSON
        try:
            parsed = json.loads(llm_output)
            return jsonify(parsed)
        except Exception:
            return jsonify({"raw_output": llm_output})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
