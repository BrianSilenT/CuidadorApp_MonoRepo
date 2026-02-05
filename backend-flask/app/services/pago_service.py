from app.extensions import db
from app.models.pago import Pago
from datetime import datetime

def obtener_todos_pagos():
    pagos = Pago.query.all()
    listado = []
    for p in pagos:
        listado.append(p.to_dict())
    return listado

def obtener_pago_por_id(id):
    pago = Pago.query.get(id)
    if pago:
        return pago.to_dict()
    return None

def obtener_pagos_por_cuidador(cuidador_id):
    pagos = Pago.query.filter_by(cuidador_id=cuidador_id).all()
    listado = []
    for p in pagos:
        listado.append(p.to_dict())
    return listado

def crear_pago(datos):
    # Validaciones
    if not datos.get("monto"):
        return {"error": "El monto es obligatorio"}, 400
    if not datos.get("cuidador_id"):
        return {"error": "El cuidador es obligatorio"}, 400

    fecha_pago = None
    if datos.get("fecha_pago"):
        try:
            fecha_pago = datetime.strptime(datos["fecha_pago"], "%Y-%m-%d").date()
        except ValueError:
            return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}, 400

    pago = Pago(
        monto=datos["monto"],
        fecha_pago=fecha_pago,
        metodo=datos.get("metodo"),
        confirmado=datos.get("confirmado", False),
        cuidador_id=datos["cuidador_id"]
    )
    db.session.add(pago)
    db.session.commit()
    return pago.to_dict(), 201

def actualizar_pago(id, datos):
    pago = Pago.query.get(id)
    if not pago:
        return {"error": "Pago no encontrado"}, 404

    if datos.get("monto"):
        pago.monto = datos["monto"]
    if datos.get("fecha_pago"):
        try:
            pago.fecha_pago = datetime.strptime(datos["fecha_pago"], "%Y-%m-%d").date()
        except ValueError:
            return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}, 400
    if datos.get("metodo"):
        pago.metodo = datos["metodo"]
    if "confirmado" in datos:
        pago.confirmado = datos["confirmado"]

    db.session.commit()
    return pago.to_dict(), 200

def eliminar_pago(id):
    pago = Pago.query.get(id)
    if not pago:
        return {"error": "Pago no encontrado"}, 404

    db.session.delete(pago)
    db.session.commit()
    return {"mensaje": "Pago eliminado correctamente"}, 200

def confirmar_pago(id):
    pago = Pago.query.get(id)
    if not pago:
        return {"error": "Pago no encontrado"}, 404

    pago.confirmado = True
    pago.fecha_pago = datetime.now().date()
    db.session.commit()
    return pago.to_dict(), 200
