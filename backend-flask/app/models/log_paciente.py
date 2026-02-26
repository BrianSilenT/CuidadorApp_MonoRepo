from app.extensions import db
from datetime import datetime

class LogPaciente(db.Model):
    __tablename__ = "logs_pacientes"

    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    condicion = db.Column(db.String(100), nullable=False)
    estado = db.Column(db.String(50), default="Estable")
    notas = db.Column(db.Text, nullable=False)
    
    cuidador_id = db.Column(db.Integer, db.ForeignKey("cuidadores.id"), nullable=False)
    paciente_id = db.Column(db.Integer, db.ForeignKey("pacientes.id"), nullable=False)

    cuidador = db.relationship("Cuidador", backref="logs")
    paciente = db.relationship("Paciente", backref="logs")

    def to_dict(self):
        return {
            "id": self.id,
            "fecha": self.fecha.isoformat() if self.fecha else None,
            "condicion": self.condicion,
            "estado": self.estado,
            "notas": self.notas,
            "cuidador": self.cuidador.to_dict() if self.cuidador else None,
            "paciente": self.paciente.to_dict() if self.paciente else None
        }
