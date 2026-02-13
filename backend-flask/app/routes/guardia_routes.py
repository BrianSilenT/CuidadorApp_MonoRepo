from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services import guardia_service

guardia_bp = Blueprint("guardias", __name__, url_prefix="/guardias")

@guardia_bp.route("/", methods=["GET"])
@jwt_required()
def obtener_todas():
    guardias = guardia_service.obtener_todas_guardias()
    return jsonify(guardias), 200

@guardia_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def obtener_por_id(id):
    guardia = guardia_service.obtener_guardia_por_id(id)
    if guardia:
        return jsonify(guardia), 200
    return jsonify({"error": "Guardia no encontrada"}), 404

@guardia_bp.route("/cuidador/<int:cuidador_id>", methods=["GET"])
@jwt_required()
def obtener_por_cuidador(cuidador_id):
    guardias = guardia_service.obtener_guardias_por_cuidador(cuidador_id)
    return jsonify(guardias), 200

@guardia_bp.route("/paciente/<int:paciente_id>", methods=["GET"])
@jwt_required()
def obtener_por_paciente(paciente_id):
    guardias = guardia_service.obtener_guardias_por_paciente(paciente_id)
    return jsonify(guardias), 200

@guardia_bp.route("/", methods=["POST"])
@jwt_required()
def crear():
    datos = request.get_json()
    resultado = guardia_service.crear_guardia(datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 201

@guardia_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def actualizar(id):
    datos = request.get_json()
    resultado = guardia_service.actualizar_guardia(id, datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200

@guardia_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def eliminar(id):
    resultado = guardia_service.eliminar_guardia(id)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200

@guardia_bp.route("/horas/cuidador/<int:cuidador_id>", methods=["GET"])
@jwt_required()
def horas_por_cuidador(cuidador_id):
    resultado = guardia_service.obtener_horas_por_cuidador(cuidador_id)
    return jsonify(resultado), 200

@guardia_bp.route("/horas/cuidador/<int:cuidador_id>/paciente/<int:paciente_id>", methods=["GET"])
@jwt_required()
def horas_por_cuidador_y_paciente(cuidador_id, paciente_id):
    resultado = guardia_service.obtener_horas_por_cuidador_y_paciente(cuidador_id, paciente_id)
    return jsonify(resultado), 200
