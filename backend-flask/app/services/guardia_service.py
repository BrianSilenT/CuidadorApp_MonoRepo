from app.extensions import db
from app.models.guardia import Guardia
from app.models.cuidador import Cuidador
from app.models.paciente import Paciente
from datetime import datetime
from app.services.pagination import build_paginated_response

def obtener_todas_guardias(pagina=1, por_pagina=10):
    paginacion = Guardia.query.paginate(page=pagina, per_page=por_pagina, error_out=False)
    return build_paginated_response(paginacion, lambda g: g.to_dict())

def obtener_guardia_por_id(id):
    guardia = Guardia.query.get(id)
    if guardia:
        return guardia.to_dict()
    return None

def obtener_guardias_por_cuidador(cuidador_id, pagina=1, por_pagina=10):
    paginacion = Guardia.query.filter_by(cuidador_id=cuidador_id).paginate(page=pagina, per_page=por_pagina, error_out=False)
    return build_paginated_response(paginacion, lambda g: g.to_dict())

def obtener_guardias_por_paciente(paciente_id, pagina=1, por_pagina=10):
    paginacion = Guardia.query.filter_by(paciente_id=paciente_id).paginate(page=pagina, per_page=por_pagina, error_out=False)
    return build_paginated_response(paginacion, lambda g: g.to_dict())

def crear_guardia(datos):
    # Validaciones
    if not datos.get("fecha"):
        return {"error": "La fecha es obligatoria"}, 400
    if not datos.get("horas_trabajadas"):
        return {"error": "Las horas trabajadas son obligatorias"}, 400
    if datos["horas_trabajadas"] <= 0:
        return {"error": "Las horas trabajadas deben ser mayores a 0"}, 400
    
    # Cuidador es opcional en la creación para permitir solicitudes de familias
    if datos.get("cuidador_id"):
        if not Cuidador.query.get(datos["cuidador_id"]):
            return {"error": "El cuidador no existe"}, 404

    if not datos.get("paciente_id"):
        return {"error": "El paciente es obligatorio"}, 400

    # Verificar que el paciente exista
    if not Paciente.query.get(datos["paciente_id"]):
        return {"error": "El paciente no existe"}, 404

    # Convertir fecha string a objeto Date
    try:
        fecha = datetime.strptime(datos["fecha"], "%Y-%m-%d").date()
    except ValueError:
        return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}, 400

    guardia = Guardia(
        fecha=fecha,
        hora_inicio=datos.get("hora_inicio"),
        hora_fin=datos.get("hora_fin"),
        ubicacion=datos.get("ubicacion"),
        estado=datos.get("estado", "Programado"),
        horas_trabajadas=datos.get("horas_trabajadas", 0),
        informe=datos.get("informe"),
        estado_informe=datos.get("estado_informe", "Pendiente"),
        calificacion=datos.get("calificacion"),
        comentario_calificacion=datos.get("comentario_calificacion"),
        cuidador_id=datos.get("cuidador_id"),
        paciente_id=datos["paciente_id"]
    )
    db.session.add(guardia)
    db.session.commit()
    return guardia.to_dict(), 201

def actualizar_guardia(id, datos):
    guardia = Guardia.query.get(id)
    if not guardia:
        return {"error": "Guardia no encontrada"}, 404

    if datos.get("fecha"):
        try:
            guardia.fecha = datetime.strptime(datos["fecha"], "%Y-%m-%d").date()
        except ValueError:
            return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}, 400
    if "hora_inicio" in datos:
        guardia.hora_inicio = datos["hora_inicio"]
    if "hora_fin" in datos:
        guardia.hora_fin = datos["hora_fin"]
    if "ubicacion" in datos:
        guardia.ubicacion = datos["ubicacion"]
    if "estado" in datos:
        guardia.estado = datos["estado"]
    if "horas_trabajadas" in datos:
        guardia.horas_trabajadas = datos["horas_trabajadas"]
    if "informe" in datos:
        guardia.informe = datos["informe"]
    if "estado_informe" in datos:
        guardia.estado_informe = datos["estado_informe"]
    if "calificacion" in datos:
        guardia.calificacion = datos["calificacion"]
    if "comentario_calificacion" in datos:
        guardia.comentario_calificacion = datos["comentario_calificacion"]

    db.session.commit()
    return guardia.to_dict(), 200

def eliminar_guardia(id):
    guardia = Guardia.query.get(id)
    if not guardia:
        return {"error": "Guardia no encontrada"}, 404

    db.session.delete(guardia)
    db.session.commit()
    return {"mensaje": "Guardia eliminada correctamente"}, 200


def obtener_horas_por_cuidador(cuidador_id):
    guardias = Guardia.query.filter_by(cuidador_id=cuidador_id).all()
    total_horas = sum(g.horas_trabajadas for g in guardias)
    return {
        "cuidador_id": cuidador_id,
        "total_horas": total_horas,
        "total_guardias": len(guardias)
    }


def obtener_horas_por_cuidador_y_paciente(cuidador_id, paciente_id):
    guardias = Guardia.query.filter_by(
        cuidador_id=cuidador_id,
        paciente_id=paciente_id
    ).all()
    total_horas = sum(g.horas_trabajadas for g in guardias)
    return {
        "cuidador_id": cuidador_id,
        "paciente_id": paciente_id,
        "total_horas": total_horas,
        "total_guardias": len(guardias)
    }

def obtener_guardias_por_familia(usuario_id, pagina=1, por_pagina=10):
    paginacion = Guardia.query.join(Paciente).filter(Paciente.usuario_id==usuario_id).paginate(page=pagina, per_page=por_pagina, error_out=False)
    return build_paginated_response(paginacion, lambda g: g.to_dict())
