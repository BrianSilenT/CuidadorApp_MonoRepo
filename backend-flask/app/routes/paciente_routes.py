from flask import Blueprint, request, jsonify
from app.services import paciente_service

paciente_bp = Blueprint("pacientes", __name__, url_prefix="/pacientes")

@paciente_bp.route("/", methods=["GET"])
def obtener_todos():
    pacientes = paciente_service.obtener_todos_pacientes()
    return jsonify(pacientes), 200

@paciente_bp.route("/<int:id>", methods=["GET"])
def obtener_por_id(id):
    paciente = paciente_service.obtener_paciente_por_id(id)
    if paciente:
        return jsonify(paciente), 200
    return jsonify({"error": "Paciente no encontrado"}), 404

@paciente_bp.route("/", methods=["POST"])
def crear():
    datos = request.get_json()
    resultado = paciente_service.crear_paciente(datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 201

@paciente_bp.route("/<int:id>", methods=["PUT"])
def actualizar(id):
    datos = request.get_json()
    resultado = paciente_service.actualizar_paciente(id, datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200

@paciente_bp.route("/<int:id>", methods=["DELETE"])
def eliminar(id):
    resultado = paciente_service.eliminar_paciente(id)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200
