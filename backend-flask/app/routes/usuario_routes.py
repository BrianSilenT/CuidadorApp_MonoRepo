from flask import Blueprint, request, jsonify
from app.services import usuario_service

usuario_bp = Blueprint("usuarios", __name__, url_prefix="/usuarios")

@usuario_bp.route("/", methods=["GET"])
def obtener_todos():
    usuarios = usuario_service.obtener_todos_usuarios()
    return jsonify(usuarios), 200

@usuario_bp.route("/<int:id>", methods=["GET"])
def obtener_por_id(id):
    usuario = usuario_service.obtener_usuario_por_id(id)
    if usuario:
        return jsonify(usuario), 200
    return jsonify({"error": "Usuario no encontrado"}), 404

@usuario_bp.route("/", methods=["POST"])
def crear():
    datos = request.get_json()
    resultado = usuario_service.crear_usuario(datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 201

@usuario_bp.route("/<int:id>", methods=["PUT"])
def actualizar(id):
    datos = request.get_json()
    resultado = usuario_service.actualizar_usuario(id, datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200

@usuario_bp.route("/<int:id>", methods=["DELETE"])
def eliminar(id):
    resultado = usuario_service.eliminar_usuario(id)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200
