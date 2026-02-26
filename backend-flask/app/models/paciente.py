from app.extensions import db

class Paciente(db.Model):
    __tablename__ = "pacientes"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    direccion = db.Column(db.String(255))
    contacto_familia = db.Column(db.String(100))
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"))

    # Relaciones
    guardias = db.relationship("Guardia", backref="paciente", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "direccion": self.direccion,
            "contactoFamilia": self.contacto_familia
        }
