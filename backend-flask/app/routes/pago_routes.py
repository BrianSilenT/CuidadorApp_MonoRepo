from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services import pago_service

pago_bp = Blueprint("pagos", __name__, url_prefix="/pagos")

@pago_bp.route("/", methods=["GET"])
@jwt_required()
def obtener_todos():
    pagos = pago_service.obtener_todos_pagos()
    return jsonify(pagos), 200

@pago_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def obtener_por_id(id):
    pago = pago_service.obtener_pago_por_id(id)
    if pago:
        return jsonify(pago), 200
    return jsonify({"error": "Pago no encontrado"}), 404

@pago_bp.route("/cuidador/<int:cuidador_id>", methods=["GET"])
@jwt_required()
def obtener_por_cuidador(cuidador_id):
    pagos = pago_service.obtener_pagos_por_cuidador(cuidador_id)
    return jsonify(pagos), 200

@pago_bp.route("/", methods=["POST"])
@jwt_required()
def crear():
    datos = request.get_json()
    resultado = pago_service.crear_pago(datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 201

@pago_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def actualizar(id):
    datos = request.get_json()
    resultado = pago_service.actualizar_pago(id, datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200

@pago_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def eliminar(id):
    resultado = pago_service.eliminar_pago(id)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200

@pago_bp.route("/<int:id>/confirmar", methods=["PUT"])
@jwt_required()
def confirmar(id):
    resultado = pago_service.confirmar_pago(id)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200
