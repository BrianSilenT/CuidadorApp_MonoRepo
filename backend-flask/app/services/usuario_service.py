from app.extensions import db
from app.models.usuario import Usuario

def obtener_todos_usuarios():
    usuarios = Usuario.query.all()
    listado = []
    for u in usuarios:
        listado.append(u.to_dict())
    return listado

def obtener_usuario_por_id(id):
    usuario = Usuario.query.get(id)
    if usuario:
        return usuario.to_dict()
    return None

def obtener_usuario_por_email(email):
    usuario = Usuario.query.filter_by(email=email).first()
    if usuario:
        return usuario
    return None

def crear_usuario(datos):
    # Validaciones
    if not datos.get("email"):
        return {"error": "El email es obligatorio"}, 400
    if not datos.get("password"):
        return {"error": "La contraseña es obligatoria"}, 400
    if not datos.get("rol"):
        return {"error": "El rol es obligatorio"}, 400

    # Verificar si el email ya existe
    if obtener_usuario_por_email(datos["email"]):
        return {"error": "El email ya está registrado"}, 400

    usuario = Usuario(
        email=datos["email"],
        password=datos["password"],  # TODO: hashear la contraseña
        rol=datos["rol"]
    )
    db.session.add(usuario)
    db.session.commit()
    return usuario.to_dict(), 201

def actualizar_usuario(id, datos):
    usuario = Usuario.query.get(id)
    if not usuario:
        return {"error": "Usuario no encontrado"}, 404

    if datos.get("email"):
        usuario.email = datos["email"]
    if datos.get("password"):
        usuario.password = datos["password"]  # TODO: hashear la contraseña
    if datos.get("rol"):
        usuario.rol = datos["rol"]

    db.session.commit()
    return usuario.to_dict(), 200

def eliminar_usuario(id):
    usuario = Usuario.query.get(id)
    if not usuario:
        return {"error": "Usuario no encontrado"}, 404

    db.session.delete(usuario)
    db.session.commit()
    return {"mensaje": "Usuario eliminado correctamente"}, 200
