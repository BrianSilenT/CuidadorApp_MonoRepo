from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services import reporte_service
from app.utils.permisos import rol_requerido

reporte_bp = Blueprint("reportes", __name__, url_prefix="/reportes")

@reporte_bp.route("/resumen", methods=["GET"])
@jwt_required()
@rol_requerido("admin")
def resumen_general():
    resultado = reporte_service.obtener_resumen_general()
    return jsonify(resultado), 200

@reporte_bp.route("/cuidadores", methods=["GET"])
@jwt_required()
@rol_requerido("admin")
def reporte_cuidadores():
    resultado = reporte_service.obtener_reporte_cuidadores()
    return jsonify(resultado), 200

@reporte_bp.route("/pagos", methods=["GET"])
@jwt_required()
@rol_requerido("admin")
def reporte_pagos():
    resultado = reporte_service.obtener_reporte_pagos()
    return jsonify(resultado), 200

@reporte_bp.route("/guardias", methods=["GET"])
@jwt_required()
@rol_requerido("admin")
def reporte_guardias_por_fecha():
    fecha_inicio = request.args.get("desde")
    fecha_fin = request.args.get("hasta")

    if not fecha_inicio or not fecha_fin:
        return jsonify({"error": "Los parámetros 'desde' y 'hasta' son obligatorios"}), 400

    resultado = reporte_service.obtener_reporte_guardias_por_fecha(fecha_inicio, fecha_fin)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200
