from app.extensions import db
from app.models.incidente import Incidente
from app.services.pagination import build_paginated_response

def obtener_todos_incidentes(pagina=1, por_pagina=10):
    paginacion = Incidente.query.order_by(Incidente.fecha.desc()).paginate(page=pagina, per_page=por_pagina, error_out=False)
    return build_paginated_response(paginacion, lambda i: i.to_dict())

def obtener_incidentes_por_cuidador(cuidador_id, pagina=1, por_pagina=10):
    paginacion = Incidente.query.filter_by(cuidador_id=cuidador_id).order_by(Incidente.fecha.desc()).paginate(page=pagina, per_page=por_pagina, error_out=False)
    return build_paginated_response(paginacion, lambda i: i.to_dict())

def crear_incidente(datos):
    if not datos.get("tipo") or not datos.get("severidad") or not datos.get("descripcion"):
        return {"error": "Faltan datos obligatorios"}, 400
    
    incidente = Incidente(
        tipo=datos["tipo"],
        severidad=datos["severidad"],
        descripcion=datos["descripcion"],
        cuidador_id=datos["cuidador_id"],
        paciente_id=datos["paciente_id"]
    )
    db.session.add(incidente)
    db.session.commit()
    return incidente.to_dict(), 201

def actualizar_incidente(id, datos):
    incidente = Incidente.query.get(id)
    if not incidente:
        return {"error": "Incidente no encontrado"}, 404
    
    if "estado" in datos:
        incidente.estado = datos["estado"]
    
    db.session.commit()
    return incidente.to_dict(), 200
