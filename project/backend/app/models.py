from . import db, bcrypt
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False, unique=True)
    password_hash = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(100), unique=True)
    role = db.Column(db.String(20), default='user')
    created_at = db.Column(db.DateTime, default=datetime.now)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class Vessel(db.Model):
    __tablename__ = 'vessels'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

    voyages = db.relationship('Voyage', backref='vessel', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Vessel {self.name}>'

class Voyage(db.Model):
    __tablename__ = 'voyages'
    id = db.Column(db.Integer, primary_key=True)
    vessel_id = db.Column(db.Integer, db.ForeignKey('vessels.id'), nullable=False)
    voyage_no = db.Column(db.String(50), nullable=False)
    voyage_yr = db.Column(db.Integer, nullable=False)
    berth_loc = db.Column(db.String(100))
    date_berth = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

    container_movement = db.relationship(
        'ContainerMovement',
        backref='voyage',
        uselist=False,
        lazy=True,
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f'<Voyage {self.voyage_no} by Vessel ID: {self.vessel_id}>'
    
class ContainerMovement(db.Model):
    __tablename__ = 'container_movements'
    id = db.Column(db.Integer, primary_key=True)
    voyage_id = db.Column(db.Integer, db.ForeignKey('voyages.id'), nullable=False, unique=True)

    bongkaran_empty_20dc = db.Column(db.Integer, default=0)
    bongkaran_empty_40hc = db.Column(db.Integer, default=0)
    bongkaran_full_20dc = db.Column(db.Integer, default=0)
    bongkaran_full_40hc = db.Column(db.Integer, default=0)

    pengajuan_empty_20dc = db.Column(db.Integer, default=0)
    pengajuan_empty_40hc = db.Column(db.Integer, default=0)
    pengajuan_full_20dc = db.Column(db.Integer, default=0)
    pengajuan_full_40hc = db.Column(db.Integer, default=0)

    acc_pengajuan_empty_20dc = db.Column(db.Integer, default=0)
    acc_pengajuan_empty_40hc = db.Column(db.Integer, default=0)
    acc_pengajuan_full_20dc = db.Column(db.Integer, default=0)
    acc_pengajuan_full_40hc = db.Column(db.Integer, default=0)

    total_pengajuan_20dc = db.Column(db.Integer, default=0)
    total_pengajuan_40hc = db.Column(db.Integer, default=0)
    teus_pengajuan = db.Column(db.Integer, default=0)

    realisasi_mxd_20dc = db.Column(db.Integer, default=0)
    realisasi_mxd_40hc = db.Column(db.Integer, default=0)
    realisasi_fxd_20dc = db.Column(db.Integer, default=0)
    realisasi_fxd_40hc = db.Column(db.Integer, default=0)

    shipside_yes_mxd_20dc = db.Column(db.Integer, default=0)
    shipside_yes_mxd_40hc = db.Column(db.Integer, default=0)
    shipside_yes_fxd_20dc = db.Column(db.Integer, default=0)
    shipside_yes_fxd_40hc = db.Column(db.Integer, default=0)
    shipside_no_mxd_20dc = db.Column(db.Integer, default=0)
    shipside_no_mxd_40hc = db.Column(db.Integer, default=0)
    shipside_no_fxd_20dc = db.Column(db.Integer, default=0)
    shipside_no_fxd_40hc = db.Column(db.Integer, default=0)

    total_realisasi_20dc = db.Column(db.Integer, default=0)
    total_realisasi_40hc = db.Column(db.Integer, default=0)
    teus_realisasi = db.Column(db.Integer, default=0)

    turun_cy_20dc = db.Column(db.Integer, default=0)
    turun_cy_40hc = db.Column(db.Integer, default=0)
    teus_turun_cy = db.Column(db.Integer, default=0)

    percentage_vessel = db.Column(db.Float, default=0)
    obstacles = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def __repr__(self):
        return f'<ContainerMovement for Voyage ID: {self.voyage_id}>'