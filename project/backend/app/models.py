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
    
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def __repr__(self):
        return f'<ContainerMovement for Voyage ID: {self.voyage_id}>'