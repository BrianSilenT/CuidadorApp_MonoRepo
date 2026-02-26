from app.extensions import db

class Guardia(db.Model):
    __tablename__ = "guardias"

    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, nullable=False)
    horas_trabajadas = db.Column(db.Integer, nullable=False)
    informe = db.Column(db.Text)
    cuidador_id = db.Column(db.Integer, db.ForeignKey("cuidadores.id"), nullable=False)
    paciente_id = db.Column(db.Integer, db.ForeignKey("pacientes.id"), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "fecha": self.fecha.isoformat() if self.fecha else None,
            "horasTrabajadas": self.horas_trabajadas,
            "informe": self.informe,
            "cuidador": self.cuidador.to_dict() if self.cuidador else None,
            "paciente": self.paciente.to_dict() if self.paciente else None
        }
