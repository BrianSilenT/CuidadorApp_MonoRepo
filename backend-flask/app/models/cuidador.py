from app.extensions import db

class Cuidador(db.Model):
    __tablename__ = "cuidadores"
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    documento = db.Column(db.String(20), nullable=False)
    telefono = db.Column(db.String(20))
    activo = db.Column(db.Boolean, default=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"))

    # Relaciones
    guardias = db.relationship("Guardia", backref="cuidador", cascade="all, delete-orphan")
    pagos = db.relationship("Pago", backref="cuidador", cascade="all, delete-orphan")
    documentos = db.relationship("Documento", backref="cuidador", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "documento": self.documento,
            "telefono": self.telefono,
            "activo": self.activo
        }