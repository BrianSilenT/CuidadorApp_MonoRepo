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
    total_horas = 0
    for g in guardias:
        total_horas = total_horas + g.horas_trabajadas

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
        total_horas = 0
        for g in guardias:
            total_horas = total_horas + g.horas_trabajadas

        # Pacientes atendidos por este cuidador (sin repetir)
        pacientes_ids = set()
        for g in guardias:
            pacientes_ids.add(g.paciente_id)

        # Pagos del cuidador
        pagos = Pago.query.filter_by(cuidador_id=cuidador.id).all()
        total_pagado = 0
        total_pendiente = 0
        for p in pagos:
            if p.confirmado:
                total_pagado = total_pagado + p.monto
            else:
                total_pendiente = total_pendiente + p.monto

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

    total_monto = 0
    total_pagado = 0
    total_pendiente = 0

    for p in pagos:
        total_monto = total_monto + p.monto
        if p.confirmado:
            total_pagado = total_pagado + p.monto
        else:
            total_pendiente = total_pendiente + p.monto

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

    total_horas = 0
    for g in guardias:
        total_horas = total_horas + g.horas_trabajadas

    return {
        "fechaInicio": fecha_inicio,
        "fechaFin": fecha_fin,
        "totalGuardias": len(guardias),
        "totalHoras": total_horas,
        "guardias": [g.to_dict() for g in guardias]
    }
