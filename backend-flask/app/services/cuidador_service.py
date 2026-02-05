from app.extensions import db
from app.models.cuidador import Cuidador

def obtener_todos_cuidadores():
    cuidadores = Cuidador.query.all()
    listado = []
    for c in cuidadores:
        listado.append(c.to_dict())
    return listado

def obtener_cuidador_por_id(id):
    cuidador = Cuidador.query.get(id)
    if cuidador:
        return cuidador.to_dict()
    return None

def crear_cuidador(datos):
    # Validaciones
    if not datos.get("nombre"):
        return {"error": "El nombre es obligatorio"}, 400
    if not datos.get("documento"):
        return {"error": "El documento es obligatorio"}, 400

    cuidador = Cuidador(
        nombre=datos["nombre"],
        documento=datos["documento"],
        telefono=datos.get("telefono"),
        usuario_id=datos.get("usuario_id")
    )
    db.session.add(cuidador)
    db.session.commit()
    return cuidador.to_dict(), 201

def actualizar_cuidador(id, datos):
    cuidador = Cuidador.query.get(id)
    if not cuidador:
        return {"error": "Cuidador no encontrado"}, 404

    # Actualizar solo los campos que vienen en datos
    if datos.get("nombre"):
        cuidador.nombre = datos["nombre"]
    if datos.get("documento"):
        cuidador.documento = datos["documento"]
    if datos.get("telefono"):
        cuidador.telefono = datos["telefono"]
    if "activo" in datos:
        cuidador.activo = datos["activo"]

    db.session.commit()
    return cuidador.to_dict(), 200

def eliminar_cuidador(id):
    cuidador = Cuidador.query.get(id)
    if not cuidador:
        return {"error": "Cuidador no encontrado"}, 404

    db.session.delete(cuidador)
    db.session.commit()
    return {"mensaje": "Cuidador eliminado correctamente"}, 200