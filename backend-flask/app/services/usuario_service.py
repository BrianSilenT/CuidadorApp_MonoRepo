from app.extensions import db, bcrypt
from app.models.usuario import Usuario

def obtener_todos_usuarios(pagina=1, por_pagina=10):
    paginacion = Usuario.query.paginate(page=pagina, per_page=por_pagina, error_out=False)
    listado = []
    for u in paginacion.items:
        listado.append(u.to_dict())
    return {
        "datos": listado,
        "pagina": paginacion.page,
        "por_pagina": paginacion.per_page,
        "total": paginacion.total,
        "paginas": paginacion.pages
    }

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

ROLES_VALIDOS = {"admin", "cuidador", "familia"}

def crear_usuario(datos):
    # Validaciones
    if not datos.get("email"):
        return {"error": "El email es obligatorio"}, 400
    if not datos.get("password"):
        return {"error": "La contraseña es obligatoria"}, 400
    if not datos.get("rol"):
        return {"error": "El rol es obligatorio"}, 400

    # Validar rol
    if datos["rol"] not in ROLES_VALIDOS:
        return {"error": "Rol inválido. Roles válidos: admin, cuidador, familia"}, 400

    # Verificar si el email ya existe
    if obtener_usuario_por_email(datos["email"]):
        return {"error": "El email ya está registrado"}, 400

    # Hashear la contraseña
    password_hash = bcrypt.generate_password_hash(datos["password"]).decode('utf-8')

    usuario = Usuario(
        email=datos["email"],
        password=password_hash,
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
        password_hash = bcrypt.generate_password_hash(datos["password"]).decode('utf-8')
        usuario.password = password_hash
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
