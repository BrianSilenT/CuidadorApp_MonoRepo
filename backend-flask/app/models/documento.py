from app.extensions import db
from datetime import datetime

class Documento(db.Model):
    __tablename__ = "documentos"

    id = db.Column(db.Integer, primary_key=True)
    nombre_archivo = db.Column(db.String(255), nullable=False)
    tipo_documento = db.Column(db.String(50), nullable=False)  # cedula, certificado, antecedentes
    ruta_archivo = db.Column(db.String(500), nullable=False)
    fecha_subida = db.Column(db.DateTime, default=datetime.utcnow)
    cuidador_id = db.Column(db.Integer, db.ForeignKey("cuidadores.id"), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "nombreArchivo": self.nombre_archivo,
            "tipoDocumento": self.tipo_documento,
            "rutaArchivo": self.ruta_archivo,
            "fechaSubida": self.fecha_subida.strftime("%Y-%m-%d %H:%M:%S"),
            "cuidadorId": self.cuidador_id
        }
