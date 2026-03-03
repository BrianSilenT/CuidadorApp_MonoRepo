from app.models.guardia import Guardia
from app.models.cuidador import Cuidador
from app.models.paciente import Paciente
from app.models.pago import Pago
from app.models.usuario import Usuario


def obtener_resumen_general():
    """Resumen general del sistema para el admin"""
    total_cuidadores = Cuidador.query.count()
    cuidadores_activos = Cuidador.query.filter_by(activo=True).count()
    total_pacientes = Paciente.query.count()
    total_guardias = Guardia.query.count()
    total_usuarios = Usuario.query.count()

    # Calcular total de horas trabajadas
    guardias = Guardia.query.all()
    total_horas = sum(g.horas_trabajadas for g in guardias)

    # Pagos
    total_pagos = Pago.query.count()
    pagos_confirmados = Pago.query.filter_by(confirmado=True).count()
    pagos_pendientes = Pago.query.filter_by(confirmado=False).count()

    return {
        "cuidadores": {
            "total": total_cuidadores,
            "activos": cuidadores_activos
        },
        "pacientes": {
            "total": total_pacientes
        },
        "guardias": {
            "total": total_guardias,
            "totalHoras": total_horas
        },
        "usuarios": {
            "total": total_usuarios
        },
        "pagos": {
            "total": total_pagos,
            "confirmados": pagos_confirmados,
            "pendientes": pagos_pendientes
        }
    }


def obtener_reporte_cuidadores():
    """Reporte detallado de cada cuidador con sus horas y guardias"""
    cuidadores = Cuidador.query.all()
    reporte = []

    for cuidador in cuidadores:
        guardias = Guardia.query.filter_by(cuidador_id=cuidador.id).all()
        total_horas = sum(g.horas_trabajadas for g in guardias)

        # Pacientes atendidos por este cuidador (sin repetir)
        pacientes_ids = {g.paciente_id for g in guardias}

        # Pagos del cuidador
        pagos = Pago.query.filter_by(cuidador_id=cuidador.id).all()
        total_pagado = sum(p.monto for p in pagos if p.confirmado)
        total_pendiente = sum(p.monto for p in pagos if not p.confirmado)

        reporte.append({
            "cuidador": cuidador.to_dict(),
            "totalGuardias": len(guardias),
            "totalHoras": total_horas,
            "pacientesAtendidos": len(pacientes_ids),
            "pagos": {
                "totalPagado": total_pagado,
                "totalPendiente": total_pendiente
            }
        })

    return reporte


def obtener_reporte_pagos():
    """Reporte de pagos con totales"""
    pagos = Pago.query.all()

    total_monto = sum(p.monto for p in pagos)
    total_pagado = sum(p.monto for p in pagos if p.confirmado)
    total_pendiente = sum(p.monto for p in pagos if not p.confirmado)

    return {
        "totalPagos": len(pagos),
        "montoTotal": total_monto,
        "montoPagado": total_pagado,
        "montoPendiente": total_pendiente,
        "detalle": [p.to_dict() for p in pagos]
    }


def obtener_reporte_guardias_por_fecha(fecha_inicio, fecha_fin):
    """Reporte de guardias filtrado por rango de fechas"""
    from datetime import datetime

    try:
        inicio = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
        fin = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
    except ValueError:
        return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}, 400

    guardias = Guardia.query.filter(
        Guardia.fecha >= inicio,
        Guardia.fecha <= fin
    ).all()

    total_horas = sum(g.horas_trabajadas for g in guardias)

    return {
        "fechaInicio": fecha_inicio,
        "fechaFin": fecha_fin,
        "totalGuardias": len(guardias),
        "totalHoras": total_horas,
        "guardias": [g.to_dict() for g in guardias]
    }
