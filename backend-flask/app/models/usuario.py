from app.extensions import db

class Usuario(db.Model):
    __tablename__ = "usuarios"
    
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String(255), unique = True, nullable = False)
    password = db.Column(db.String(255), nullable = False)
    
    # los roles pueden ser admin, cuidador, familia
    rol = db.Column(db.String(20), nullable = False)

    cuidador_preferido_id = db.Column(db.Integer, db.ForeignKey('cuidadores.id'), nullable=True)
    # Relationship to the preferred caregiver
    cuidador_preferido = db.relationship("Cuidador", foreign_keys=[cuidador_preferido_id], uselist=False)

    # Relationship to the caregiver profile if this user IS a caregiver
    # Use string for foreign_keys to avoid import issues
    cuidador = db.relationship("Cuidador", backref="usuario", uselist=False, cascade="all, delete-orphan", foreign_keys="Cuidador.usuario_id")
    pacientes = db.relationship("Paciente", backref="usuario", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "rol": self.rol,
            "cuidador_preferido_id": self.cuidador_preferido_id
        }
