from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app.services import usuario_service
from app.models.usuario import Usuario
from app.utils.permisos import rol_requerido

usuario_bp = Blueprint("usuarios", __name__, url_prefix="/usuarios")

@usuario_bp.route("/", methods=["GET"])
@jwt_required()
@rol_requerido("admin")
def obtener_todos():
    pagina = request.args.get("pagina", 1, type=int)
    por_pagina = request.args.get("por_pagina", 10, type=int)
    resultado = usuario_service.obtener_todos_usuarios(pagina, por_pagina)
    return jsonify(resultado), 200

@usuario_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
@rol_requerido("admin")
def obtener_por_id(id):
    usuario = usuario_service.obtener_usuario_por_id(id)
    if usuario:
        return jsonify(usuario), 200
    return jsonify({"error": "Usuario no encontrado"}), 404

@usuario_bp.route("/", methods=["POST"])
def crear():
    datos = request.get_json()

    # Si quiere crear un admin, debe estar logueado como admin
    if datos.get("rol") == "admin":
        try:
            verify_jwt_in_request()
            usuario_id = get_jwt_identity()
            usuario = Usuario.query.get(int(usuario_id))
            if not usuario or usuario.rol != "admin":
                return jsonify({"error": "Solo un admin puede crear otros admins"}), 403
        except Exception:
            return jsonify({"error": "Solo un admin puede crear otros admins"}), 403

    resultado = usuario_service.crear_usuario(datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 201

@usuario_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
@rol_requerido("admin")
def actualizar(id):
    datos = request.get_json()
    resultado = usuario_service.actualizar_usuario(id, datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200

@usuario_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
@rol_requerido("admin")
def eliminar(id):
    resultado = usuario_service.eliminar_usuario(id)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200
