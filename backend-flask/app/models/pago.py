from app.extensions import db

class Pago(db.Model):
    __tablename__ = "pagos"

    id = db.Column(db.Integer, primary_key=True)
    monto = db.Column(db.Float, nullable=False)
    fecha_pago = db.Column(db.Date)
    metodo = db.Column(db.String(50))  # MercadoPago, Transferencia, etc.
    confirmado = db.Column(db.Boolean, default=False)
    cuidador_id = db.Column(db.Integer, db.ForeignKey("cuidadores.id"), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "monto": self.monto,
            "fechaPago": self.fecha_pago.isoformat() if self.fecha_pago else None,
            "metodo": self.metodo,
            "confirmado": self.confirmado,
            "cuidador": self.cuidador.to_dict() if self.cuidador else None
        }
