from app.extensions import db
from app.models.paciente import Paciente
from app.services.pagination import build_paginated_response

def obtener_todos_pacientes(pagina=1, por_pagina=10):
    paginacion = Paciente.query.paginate(page=pagina, per_page=por_pagina, error_out=False)
    return build_paginated_response(paginacion, lambda p: p.to_dict())

def obtener_pacientes_por_usuario(usuario_id, pagina=1, por_pagina=10):
    paginacion = Paciente.query.filter_by(usuario_id=usuario_id).paginate(page=pagina, per_page=por_pagina, error_out=False)
    return build_paginated_response(paginacion, lambda p: p.to_dict())

def obtener_paciente_por_id(id):
    paciente = Paciente.query.get(id)
    if paciente:
        return paciente.to_dict()
    return None

def crear_paciente(datos):
    # Validaciones
    if not datos.get("nombre"):
        return {"error": "El nombre es obligatorio"}, 400

    paciente = Paciente(
        nombre=datos["nombre"],
        direccion=datos.get("direccion"),
        contacto_familia=datos.get("contacto_familia"),
        usuario_id=datos.get("usuario_id")
    )
    db.session.add(paciente)
    db.session.commit()
    return paciente.to_dict(), 201

def actualizar_paciente(id, datos):
    paciente = Paciente.query.get(id)
    if not paciente:
        return {"error": "Paciente no encontrado"}, 404

    if datos.get("nombre"):
        paciente.nombre = datos["nombre"]
    if datos.get("direccion"):
        paciente.direccion = datos["direccion"]
    if datos.get("contacto_familia"):
        paciente.contacto_familia = datos["contacto_familia"]

    db.session.commit()
    return paciente.to_dict(), 200

def eliminar_paciente(id):
    paciente = Paciente.query.get(id)
    if not paciente:
        return {"error": "Paciente no encontrado"}, 404

    if getattr(paciente, "incidentes", None):
        if len(paciente.incidentes) > 0:
            return {"error": "No se puede eliminar el paciente porque tiene incidentes asociados"}, 400

    if getattr(paciente, "logs", None):
        if len(paciente.logs) > 0:
            return {"error": "No se puede eliminar el paciente porque tiene logs clínicos asociados"}, 400

    db.session.delete(paciente)
    db.session.commit()
    return {"mensaje": "Paciente eliminado correctamente"}, 200
