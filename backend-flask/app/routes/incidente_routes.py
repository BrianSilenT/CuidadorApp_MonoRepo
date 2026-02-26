from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import incidente_service
from app.models.usuario import Usuario
from app.models.cuidador import Cuidador
from app.utils.permisos import rol_requerido

incidente_bp = Blueprint("incidentes", __name__, url_prefix="/incidentes")

@incidente_bp.route("/", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "cuidador")
def obtener_todos():
    pagina = request.args.get("pagina", 1, type=int)
    por_pagina = request.args.get("por_pagina", 10, type=int)
    
    usuario_id = get_jwt_identity()
    usuario = Usuario.query.get(int(usuario_id))
    
    if usuario.rol == "cuidador":
        cuidador = Cuidador.query.filter_by(usuario_id=usuario.id).first()
        if not cuidador:
            return jsonify({"error": "No tienes un perfil de cuidador asociado"}), 403
        resultado = incidente_service.obtener_incidentes_por_cuidador(cuidador.id, pagina, por_pagina)
    else:
        resultado = incidente_service.obtener_todos_incidentes(pagina, por_pagina)
        
    return jsonify(resultado), 200

@incidente_bp.route("/", methods=["POST"])
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

    resultado = incidente_service.crear_incidente(datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 201

@incidente_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
@rol_requerido("admin")
def actualizar(id):
    datos = request.get_json()
    resultado = incidente_service.actualizar_incidente(id, datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200
