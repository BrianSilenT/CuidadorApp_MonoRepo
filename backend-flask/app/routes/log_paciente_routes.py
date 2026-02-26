from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import log_paciente_service
from app.models.usuario import Usuario
from app.models.cuidador import Cuidador
from app.utils.permisos import rol_requerido

log_paciente_bp = Blueprint("logs_pacientes", __name__, url_prefix="/logs-pacientes")

@log_paciente_bp.route("/", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "cuidador", "familia")
def obtener_todos():
    pagina = request.args.get("pagina", 1, type=int)
    por_pagina = request.args.get("por_pagina", 10, type=int)
    resultado = log_paciente_service.obtener_todos_logs(pagina, por_pagina)
    return jsonify(resultado), 200

@log_paciente_bp.route("/paciente/<int:paciente_id>", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "cuidador", "familia")
def obtener_por_paciente(paciente_id):
    pagina = request.args.get("pagina", 1, type=int)
    por_pagina = request.args.get("por_pagina", 10, type=int)
    resultado = log_paciente_service.obtener_logs_por_paciente(paciente_id, pagina, por_pagina)
    return jsonify(resultado), 200

@log_paciente_bp.route("/", methods=["POST"])
@jwt_required()
@rol_requerido("admin", "cuidador")
def crear():
    datos = request.get_json()
    usuario_id = get_jwt_identity()
    usuario = Usuario.query.get(int(usuario_id))

    if usuario.rol == "cuidador":
        cuidador = Cuidador.query.filter_by(usuario_id=usuario.id).first()
        if not cuidador:
            return jsonify({"error": "No tienes un perfil de cuidador asociado"}), 403
        datos["cuidador_id"] = cuidador.id

    resultado = log_paciente_service.crear_log(datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 201
