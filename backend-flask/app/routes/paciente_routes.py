from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services import paciente_service
from app.utils.permisos import rol_requerido

paciente_bp = Blueprint("pacientes", __name__, url_prefix="/pacientes")

@paciente_bp.route("/", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "familia")
def obtener_todos():
    pacientes = paciente_service.obtener_todos_pacientes()
    return jsonify(pacientes), 200

@paciente_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "familia")
def obtener_por_id(id):
    paciente = paciente_service.obtener_paciente_por_id(id)
    if paciente:
        return jsonify(paciente), 200
    return jsonify({"error": "Paciente no encontrado"}), 404

@paciente_bp.route("/", methods=["POST"])
@jwt_required()
@rol_requerido("admin", "familia")
def crear():
    datos = request.get_json()
    resultado = paciente_service.crear_paciente(datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 201

@paciente_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
@rol_requerido("admin", "familia")
def actualizar(id):
    datos = request.get_json()
    resultado = paciente_service.actualizar_paciente(id, datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200

@paciente_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
@rol_requerido("admin")
def eliminar(id):
    resultado = paciente_service.eliminar_paciente(id)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200
