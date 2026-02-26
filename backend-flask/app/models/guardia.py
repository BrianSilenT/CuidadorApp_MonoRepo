from app.extensions import db

class Guardia(db.Model):
    __tablename__ = "guardias"

    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, nullable=False)
    hora_inicio = db.Column(db.String(10)) # e.g. "14:00"
    hora_fin = db.Column(db.String(10)) # e.g. "20:00"
    ubicacion = db.Column(db.String(255))
    estado = db.Column(db.String(50), default="Programado") # Programado, En Progreso, Completado
    horas_trabajadas = db.Column(db.Float, default=0)
    informe = db.Column(db.Text)
    estado_informe = db.Column(db.String(50), default="Pendiente") # Pendiente, Aprobado, Requiere Revisión
    calificacion = db.Column(db.Integer, nullable=True) # 1 to 5
    comentario_calificacion = db.Column(db.Text, nullable=True)
    cuidador_id = db.Column(db.Integer, db.ForeignKey("cuidadores.id"), nullable=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey("pacientes.id"), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "fecha": self.fecha.isoformat() if self.fecha else None,
            "horaInicio": self.hora_inicio,
            "horaFin": self.hora_fin,
            "ubicacion": self.ubicacion,
            "estado": self.estado,
            "horasTrabajadas": self.horas_trabajadas,
            "informe": self.informe,
            "estadoInforme": self.estado_informe,
            "calificacion": self.calificacion,
            "comentarioCalificacion": self.comentario_calificacion,
            "cuidador": self.cuidador.to_dict() if self.cuidador else None,
            "paciente": self.paciente.to_dict() if self.paciente else None
        }
