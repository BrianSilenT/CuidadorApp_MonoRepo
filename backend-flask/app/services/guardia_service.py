from app.extensions import db
from app.models.guardia import Guardia
from app.models.cuidador import Cuidador
from app.models.paciente import Paciente
from datetime import datetime

def obtener_todas_guardias(pagina=1, por_pagina=10):
    paginacion = Guardia.query.paginate(page=pagina, per_page=por_pagina, error_out=False)
    listado = []
    for g in paginacion.items:
        listado.append(g.to_dict())
    return {
        "datos": listado,
        "pagina": paginacion.page,
        "por_pagina": paginacion.per_page,
        "total": paginacion.total,
        "paginas": paginacion.pages
    }

def obtener_guardia_por_id(id):
    guardia = Guardia.query.get(id)
    if guardia:
        return guardia.to_dict()
    return None

def obtener_guardias_por_cuidador(cuidador_id, pagina=1, por_pagina=10):
    paginacion = Guardia.query.filter_by(cuidador_id=cuidador_id).paginate(page=pagina, per_page=por_pagina, error_out=False)
    listado = []
    for g in paginacion.items:
        listado.append(g.to_dict())
    return {
        "datos": listado,
        "pagina": paginacion.page,
        "por_pagina": paginacion.per_page,
        "total": paginacion.total,
        "paginas": paginacion.pages
    }

def obtener_guardias_por_paciente(paciente_id, pagina=1, por_pagina=10):
    paginacion = Guardia.query.filter_by(paciente_id=paciente_id).paginate(page=pagina, per_page=por_pagina, error_out=False)
    listado = []
    for g in paginacion.items:
        listado.append(g.to_dict())
    return {
        "datos": listado,
        "pagina": paginacion.page,
        "por_pagina": paginacion.per_page,
        "total": paginacion.total,
        "paginas": paginacion.pages
    }

def crear_guardia(datos):
    # Validaciones
    if not datos.get("fecha"):
        return {"error": "La fecha es obligatoria"}, 400
    if not datos.get("horas_trabajadas"):
        return {"error": "Las horas trabajadas son obligatorias"}, 400
    if datos["horas_trabajadas"] <= 0:
        return {"error": "Las horas trabajadas deben ser mayores a 0"}, 400
    if not datos.get("cuidador_id"):
        return {"error": "El cuidador es obligatorio"}, 400
    if not datos.get("paciente_id"):
        return {"error": "El paciente es obligatorio"}, 400

    # Verificar que el cuidador exista
    if not Cuidador.query.get(datos["cuidador_id"]):
        return {"error": "El cuidador no existe"}, 404

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
        horas_trabajadas=datos["horas_trabajadas"],
        informe=datos.get("informe"),
        cuidador_id=datos["cuidador_id"],
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
    if datos.get("horas_trabajadas"):
        guardia.horas_trabajadas = datos["horas_trabajadas"]
    if datos.get("informe"):
        guardia.informe = datos["informe"]

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
    total_horas = 0
    for g in guardias:
        total_horas = total_horas + g.horas_trabajadas
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
    total_horas = 0
    for g in guardias:
        total_horas = total_horas + g.horas_trabajadas
    return {
        "cuidador_id": cuidador_id,
        "paciente_id": paciente_id,
        "total_horas": total_horas,
        "total_guardias": len(guardias)
    }
