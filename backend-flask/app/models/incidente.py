from app.extensions import db
from datetime import datetime

class Incidente(db.Model):
    __tablename__ = "incidentes"

    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    tipo = db.Column(db.String(100), nullable=False)
    severidad = db.Column(db.String(50), nullable=False)
    estado = db.Column(db.String(50), default="Pendiente")
    descripcion = db.Column(db.Text, nullable=False)
    
    cuidador_id = db.Column(db.Integer, db.ForeignKey("cuidadores.id"), nullable=False)
    paciente_id = db.Column(db.Integer, db.ForeignKey("pacientes.id"), nullable=False)

    cuidador = db.relationship("Cuidador", backref="incidentes")
    paciente = db.relationship("Paciente", backref="incidentes")

    def to_dict(self):
        return {
            "id": self.id,
            "fecha": self.fecha.isoformat() if self.fecha else None,
            "tipo": self.tipo,
            "severidad": self.severidad,
            "estado": self.estado,
            "descripcion": self.descripcion,
            "cuidador": self.cuidador.to_dict() if self.cuidador else None,
            "paciente": self.paciente.to_dict() if self.paciente else None
        }
