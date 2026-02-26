from datetime import date

from app import create_app
from app.extensions import bcrypt, db
from app.models.cuidador import Cuidador
from app.models.guardia import Guardia
from app.models.paciente import Paciente
from app.models.usuario import Usuario


DEFAULT_USERS = {
    "admin": {
        "email": "admin@cuidadorapp.com",
        "password": "admin123",
        "rol": "admin",
    },
    "cuidador": {
        "email": "cuidador@cuidadorapp.com",
        "password": "cuidador123",
        "rol": "cuidador",
    },
    "familia": {
        "email": "familia@cuidadorapp.com",
        "password": "familia123",
        "rol": "familia",
    },
}


def _upsert_usuario(email, password, rol):
    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario:
        usuario = Usuario(email=email, rol=rol)
        db.session.add(usuario)

    usuario.rol = rol
    usuario.password = bcrypt.generate_password_hash(password).decode("utf-8")
    db.session.flush()
    return usuario


def seed_data(app):
    with app.app_context():
        db.create_all()

        admin = _upsert_usuario(**DEFAULT_USERS["admin"])
        cuidador_user = _upsert_usuario(**DEFAULT_USERS["cuidador"])
        familia_user = _upsert_usuario(**DEFAULT_USERS["familia"])

        cuidador_profile = Cuidador.query.filter_by(usuario_id=cuidador_user.id).first()
        if not cuidador_profile:
            cuidador_profile = Cuidador(usuario_id=cuidador_user.id)
            db.session.add(cuidador_profile)

        cuidador_profile.nombre = "Cuidador Demo"
        cuidador_profile.documento = "10000001"
        cuidador_profile.telefono = "555-0101"
        cuidador_profile.activo = True
        db.session.flush()

        paciente = Paciente.query.filter_by(usuario_id=familia_user.id, nombre="Paciente Demo").first()
        if not paciente:
            paciente = Paciente(
                nombre="Paciente Demo",
                direccion="Av. Principal 123",
                contacto_familia="Familiar Demo",
                usuario_id=familia_user.id,
            )
            db.session.add(paciente)
            db.session.flush()

        guardia = Guardia.query.filter_by(paciente_id=paciente.id, fecha=date.today()).first()
        if not guardia:
            guardia = Guardia(
                fecha=date.today(),
                hora_inicio="09:00",
                hora_fin="13:00",
                ubicacion=paciente.direccion,
                estado="Pendiente",
                horas_trabajadas=4.0,
                cuidador_id=cuidador_profile.id,
                paciente_id=paciente.id,
            )
            db.session.add(guardia)

        familia_user.cuidador_preferido_id = cuidador_profile.id

        db.session.commit()

        print("Credenciales demo garantizadas:")
        print(" - Admin: admin@cuidadorapp.com / admin123")
        print(" - Cuidador: cuidador@cuidadorapp.com / cuidador123")
        print(" - Familia: familia@cuidadorapp.com / familia123")


if __name__ == "__main__":
    app = create_app()
    seed_data(app)
