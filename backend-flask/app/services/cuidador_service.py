from app.extensions import db
from app.models.cuidador import Cuidador
from app.services.pagination import build_paginated_response

def obtener_todos_cuidadores(pagina=1, por_pagina=10):
    paginacion = Cuidador.query.paginate(page=pagina, per_page=por_pagina, error_out=False)
    return build_paginated_response(paginacion, lambda c: c.to_dict())

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
        activo=datos.get("activo", True),
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
    if datos.get("usuario_id"):
        cuidador.usuario_id = datos["usuario_id"]

    db.session.commit()
    return cuidador.to_dict(), 200

def eliminar_cuidador(id):
    cuidador = Cuidador.query.get(id)
    if not cuidador:
        return {"error": "Cuidador no encontrado"}, 404

    if getattr(cuidador, "incidentes", None):
        if len(cuidador.incidentes) > 0:
            return {"error": "No se puede eliminar el cuidador porque tiene incidentes asociados"}, 400

    if getattr(cuidador, "logs", None):
        if len(cuidador.logs) > 0:
            return {"error": "No se puede eliminar el cuidador porque tiene logs clínicos asociados"}, 400

    db.session.delete(cuidador)
    db.session.commit()
    return {"mensaje": "Cuidador eliminado correctamente"}, 200