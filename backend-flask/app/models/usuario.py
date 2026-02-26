from app.extensions import db

class Usuario(db.Model):
    __tablename__ = "usuarios"
    
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String(255), unique = True, nullable = False)
    password = db.Column(db.String(255), nullable = False)
    
    # los roles pueden ser admin, cuidador, familia
    rol = db.Column(db.String(20), nullable = False)

    cuidador = db.relationship("Cuidador", backref="usuario", uselist=False, cascade="all, delete-orphan")
    paciente = db.relationship("Paciente", backref="usuario", uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "rol": self.rol
        }
