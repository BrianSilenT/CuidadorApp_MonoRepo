from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import paciente_service
from app.models.usuario import Usuario
from app.utils.permisos import rol_requerido

paciente_bp = Blueprint("pacientes", __name__, url_prefix="/pacientes")

@paciente_bp.route("/", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "cuidador", "familia")
def obtener_todos():
    pagina = request.args.get("pagina", 1, type=int)
    por_pagina = request.args.get("por_pagina", 10, type=int)
    
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)
    
    if usuario and usuario.rol == "familia":
        resultado = paciente_service.obtener_pacientes_por_usuario(usuario_id, pagina, por_pagina)
    else:
        resultado = paciente_service.obtener_todos_pacientes(pagina, por_pagina)
    
    return jsonify(resultado), 200

@paciente_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "cuidador", "familia")
def obtener_por_id(id):
    paciente = paciente_service.obtener_paciente_por_id(id)
    if paciente:
        # Check permissions if family
        usuario_id = int(get_jwt_identity())
        usuario = Usuario.query.get(usuario_id)
        if usuario.rol == "familia":
            if paciente.get('usuario_id') != usuario_id:
                 return jsonify({"error": "No tiene permiso"}), 403
        return jsonify(paciente), 200
    return jsonify({"error": "Paciente no encontrado"}), 404

@paciente_bp.route("/", methods=["POST"])
@jwt_required()
@rol_requerido("admin", "familia")
def crear():
    datos = request.get_json()
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)
    
    if usuario.rol == "familia":
        datos['usuario_id'] = usuario_id

    resultado = paciente_service.crear_paciente(datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 201

@paciente_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
@rol_requerido("admin", "familia")
def actualizar(id):
    datos = request.get_json()
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)

    if usuario.rol == "familia":
        paciente_actual = paciente_service.obtener_paciente_por_id(id)
        if not paciente_actual:
            return jsonify({"error": "Paciente no encontrado"}), 404
        if paciente_actual.get("usuario_id") != usuario_id:
            return jsonify({"error": "No tiene permiso"}), 403

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
