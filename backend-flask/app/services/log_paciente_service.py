from app.extensions import db
from app.models.log_paciente import LogPaciente
from datetime import datetime

def obtener_todos_logs(pagina=1, por_pagina=10):
    paginacion = LogPaciente.query.order_by(LogPaciente.fecha.desc()).paginate(page=pagina, per_page=por_pagina, error_out=False)
    return {
        "datos": [l.to_dict() for l in paginacion.items],
        "pagina": paginacion.page,
        "por_pagina": paginacion.per_page,
        "total": paginacion.total,
        "paginas": paginacion.pages
    }

def obtener_logs_por_paciente(paciente_id, pagina=1, por_pagina=10):
    paginacion = LogPaciente.query.filter_by(paciente_id=paciente_id).order_by(LogPaciente.fecha.desc()).paginate(page=pagina, per_page=por_pagina, error_out=False)
    return {
        "datos": [l.to_dict() for l in paginacion.items],
        "pagina": paginacion.page,
        "por_pagina": paginacion.per_page,
        "total": paginacion.total,
        "paginas": paginacion.pages
    }

def crear_log(datos):
    if not datos.get("condicion") or not datos.get("notas"):
        return {"error": "Faltan datos obligatorios"}, 400
    
    log = LogPaciente(
        condicion=datos["condicion"],
        estado=datos.get("estado", "Estable"),
        notas=datos["notas"],
        cuidador_id=datos["cuidador_id"],
        paciente_id=datos["paciente_id"]
    )
    db.session.add(log)
    db.session.commit()
    return log.to_dict(), 201
