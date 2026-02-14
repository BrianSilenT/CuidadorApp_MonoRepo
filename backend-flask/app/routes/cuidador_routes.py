from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services import cuidador_service

cuidador_bp = Blueprint("cuidadores", __name__, url_prefix="/cuidadores")

@cuidador_bp.route("/", methods=["GET"])
@jwt_required()
def obtener_todos():
    cuidadores = cuidador_service.obtener_todos_cuidadores()
    return jsonify(cuidadores), 200

@cuidador_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def obtener_por_id(id):
    cuidador = cuidador_service.obtener_cuidador_por_id(id)
    if cuidador:
        return jsonify(cuidador), 200
    return jsonify({"error": "Cuidador no encontrado"}), 404

@cuidador_bp.route("/", methods=["POST"])
@jwt_required()
def crear():
    datos = request.get_json()
    resultado = cuidador_service.crear_cuidador(datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 201

@cuidador_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def actualizar(id):
    datos = request.get_json()
    resultado = cuidador_service.actualizar_cuidador(id, datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200

@cuidador_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def eliminar(id):
    resultado = cuidador_service.eliminar_cuidador(id)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200
