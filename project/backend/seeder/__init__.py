import csv
from datetime import datetime
import pandas as pd
from app import db
from app.models import Vessel, Port, Voyage, ContainerMovement, PercentageContainerMovement, CostRate
from pathlib import Path
from random import uniform

def parse_date(date_str):
    """Parse tanggal dari berbagai format umum ke datetime Python."""
    if not date_str or str(date_str).strip() == "":
        return None

    # Coba beberapa format umum
    for fmt in ("%d/%m/%Y %H.%M", "%d/%m/%Y %H:%M", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue

    # fallback pakai pandas auto parser
    try:
        return pd.to_datetime(date_str, errors="coerce").to_pydatetime()
    except Exception:
        return None

def safe_int(val):
    """Convert angka string ke int dengan aman."""
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return 0

def safe_float(val):
    """Convert angka string ke float dengan aman."""
    try:
        return float(val)
    except (ValueError, TypeError):
        return 0.0

def safe_ratio(num, den):
    try:
        if den and den > 0:
            return round(num / den, 4)
        return 0.0
    except ZeroDivisionError:
        return 0.0
    
def run_seed():
    script_path = Path(__file__).resolve()
    root_dir = script_path.parent.parent.parent
    csv_file = root_dir / "data" / "Ship_Operation_Data_Cleaned.csv"

    print(f" Baca CSV dari: {csv_file}")

    if not csv_file.is_file():
        print(f"ERROR: File tidak ditemukan: {csv_file}")
        return

    try:
        with open(csv_file, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for row in reader:
                # Vessel
                vessel_name = row['VESSEL ID (DMY)'].strip()
                vessel = Vessel.query.filter_by(name=vessel_name).first()
                if not vessel:
                    vessel = Vessel(name=vessel_name)
                    db.session.add(vessel)
                    db.session.flush()

                # Port
                port_name = row['BERTH LOCATION'].strip()
                port = Port.query.filter_by(name=port_name).first()
                if not port:
                    port = Port(name=port_name, code=None)
                    db.session.add(port)
                    db.session.flush()

                # Voyage
                voyage = Voyage(
                    vessel_id=vessel.id,
                    port_id=port.id,
                    voyage_no=row['Voyage No.'],
                    voyage_yr=safe_int(row['Voyage Yr']),
                    date_berth=parse_date(row['Date Berth'])
                )
                db.session.add(voyage)
                db.session.flush()

                # Container Movement
                cm = ContainerMovement(
                    voyage_id=voyage.id,
                    bongkaran_empty_20dc=safe_int(row['TOTAL BONGKARAN_EMPTY_20 DC']),
                    bongkaran_empty_40hc=safe_int(row['TOTAL BONGKARAN_EMPTY_40 HC']),
                    bongkaran_full_20dc=safe_int(row['TOTAL BONGKARAN_FULL_20 DC']),
                    bongkaran_full_40hc=safe_int(row['TOTAL BONGKARAN_FULL_40 HC']),
                    pengajuan_empty_20dc=safe_int(row['PENGAJUAN KE PLANNER_EMPTY_20 DC']),
                    pengajuan_empty_40hc=safe_int(row['PENGAJUAN KE PLANNER_EMPTY_40 HC']),
                    pengajuan_full_20dc=safe_int(row['PENGAJUAN KE PLANNER_FULL_20 DC']),
                    pengajuan_full_40hc=safe_int(row['PENGAJUAN KE PLANNER_FULL_40 HC']),
                    acc_pengajuan_empty_20dc=safe_int(row['ACC PENGAJUAN_EMPTY_20 DC']),
                    acc_pengajuan_empty_40hc=safe_int(row['ACC PENGAJUAN_EMPTY_40 HC']),
                    acc_pengajuan_full_20dc=safe_int(row['ACC PENGAJUAN_FULL_20 DC']),
                    acc_pengajuan_full_40hc=safe_int(row['ACC PENGAJUAN_FULL_40 HC']),
                    total_pengajuan_20dc=safe_int(row['0_TOTAL_BOX_20 DC']),
                    total_pengajuan_40hc=safe_int(row['0_40 HC']),
                    teus_pengajuan=safe_int(row['0_TEUS']),
                    realisasi_mxd_20dc=safe_int(row['REALISASI ALL DEPO_ALL DEPO_MXD_20 DC']),
                    realisasi_mxd_40hc=safe_int(row['REALISASI ALL DEPO_ALL DEPO_MXD_40 HC']),
                    realisasi_fxd_20dc=safe_int(row['REALISASI ALL DEPO_ALL DEPO_FXD_20 DC']),
                    realisasi_fxd_40hc=safe_int(row['REALISASI ALL DEPO_ALL DEPO_FXD_40 HC']),
                    shipside_yes_mxd_20dc=safe_int(row['SHIPSIDE_YES_MXD_20 DC']),
                    shipside_yes_mxd_40hc=safe_int(row['SHIPSIDE_YES_MXD_40 HC']),
                    shipside_yes_fxd_20dc=safe_int(row['SHIPSIDE_YES_FXD_20 DC']),
                    shipside_yes_fxd_40hc=safe_int(row['SHIPSIDE_YES_FXD_40 HC']),
                    shipside_no_mxd_20dc=safe_int(row['SHIPSIDE_NO_MXD_20 DC']),
                    shipside_no_mxd_40hc=safe_int(row['SHIPSIDE_NO_MXD_40 HC']),
                    shipside_no_fxd_20dc=safe_int(row['SHIPSIDE_NO_FXD_20 DC']),
                    shipside_no_fxd_40hc=safe_int(row['SHIPSIDE_NO_FXD_40 HC']),
                    total_realisasi_20dc=safe_int(row['0_TOTAL_BOX_20 DC.1']),
                    total_realisasi_40hc=safe_int(row['0_40 HC.1']),
                    teus_realisasi=safe_int(row['0_TEUS.1']),
                    turun_cy_20dc=safe_int(row['TURUN CY_BOX_20 DC']),
                    turun_cy_40hc=safe_int(row['TURUN CY_BOX_40 HC']),
                    teus_turun_cy=safe_int(row['TURUN CY_TEUS']),
                    percentage_vessel=safe_float(row['PERSENTASE/VESSEL\n(Total Realisasi TL, SS dibagi Total Pengajuan)']),
                    obstacles=row['OBSTACLES']
                )
                db.session.add(cm)
                db.session.flush()

                # Buat PercentageContainerMovement berdasarkan cm
                total_bongkaran_20dc = (cm.bongkaran_empty_20dc or 0) + (cm.bongkaran_full_20dc or 0)
                total_bongkaran_40hc = (cm.bongkaran_empty_40hc or 0) + (cm.bongkaran_full_40hc or 0)
                total_pengajuan_20dc = (cm.pengajuan_empty_20dc or 0) + (cm.pengajuan_full_20dc or 0)
                total_pengajuan_40hc = (cm.pengajuan_empty_40hc or 0) + (cm.pengajuan_full_40hc or 0)
                total_acc_20dc = (cm.acc_pengajuan_empty_20dc or 0) + (cm.acc_pengajuan_full_20dc or 0)
                total_acc_40hc = (cm.acc_pengajuan_empty_40hc or 0) + (cm.acc_pengajuan_full_40hc or 0)
                total_tlss_20dc = (cm.total_realisasi_20dc or 0)
                total_tlss_40hc = (cm.total_realisasi_40hc or 0)

                pcm = PercentageContainerMovement(
                    cm_id=cm.id,
                    total_bongkaran_20dc=total_bongkaran_20dc,
                    total_bongkaran_40hc=total_bongkaran_40hc,
                    total_pengajuan_20dc=total_pengajuan_20dc,
                    total_pengajuan_40hc=total_pengajuan_40hc,
                    total_acc_20dc=total_acc_20dc,
                    total_acc_40hc=total_acc_40hc,
                    total_tlss_20dc=total_tlss_20dc,
                    total_tlss_40hc=total_tlss_40hc,
                    # Persentase
                    percentage_pengajuan_20dc=safe_ratio(total_pengajuan_20dc, total_bongkaran_20dc),
                    percentage_pengajuan_40hc=safe_ratio(total_pengajuan_40hc, total_bongkaran_40hc),
                    percentage_acc_20dc=safe_ratio(total_acc_20dc, total_bongkaran_20dc),
                    percentage_acc_40hc=safe_ratio(total_acc_40hc, total_bongkaran_40hc),
                    percentage_tl_20dc=safe_ratio(total_tlss_20dc, total_bongkaran_20dc),
                    percentage_tl_40hc=safe_ratio(total_tlss_40hc, total_bongkaran_40hc),
                    percentage_realisasi_20dc=safe_ratio(total_tlss_20dc, total_pengajuan_20dc),
                    percentage_realisasi_40hc=safe_ratio(total_tlss_40hc, total_pengajuan_40hc),
                )
                db.session.add(pcm)

            print("Menambahkan dummy CostRate...")
            ports = Port.query.all()
            for port in ports:
                # Cek biar gak dobel seed
                if CostRate.query.filter_by(port_id=port.id).first():
                    continue

                cost_rate = CostRate(
                    port_id=port.id,
                    # --- Tidak TL ---
                    tdk_tl_20mt=100000,
                    tdk_tl_40mt=200000,
                    tdk_tl_20fl=30000,
                    tdk_tl_40fl=12000,

                    # --- TL ---
                    tl_20mt=50000,
                    tl_40mt=100000,
                    tl_20fl=30000,
                    tl_40fl=40000,

                    # --- Ship Side (YES) ---
                    shipside_yes_20mt=10000,
                    shipside_yes_40mt=32500,
                    shipside_yes_20fl=40000,
                    shipside_yes_40fl=40000,

                    # --- Ship Side (NO) ---
                    shipside_no_20mt=42000,
                    shipside_no_40mt=22000,
                    shipside_no_20fl=12000,
                    shipside_no_40fl=32000,

                    # --- Turun CY ---
                    turun_cy_20mt=12000,
                    turun_cy_40mt=12000,
                    turun_cy_20fl=12000,
                    turun_cy_40fl=12000
                )
                db.session.add(cost_rate)


        db.session.commit()
        print("Seeder selesai dijalankan!")

    except Exception as e:
        print(f"ERROR: {e}")