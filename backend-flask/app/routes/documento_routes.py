from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required
from app.services import documento_service
from app.utils.permisos import rol_requerido

documento_bp = Blueprint("documentos", __name__, url_prefix="/documentos")

@documento_bp.route("/cuidador/<int:cuidador_id>", methods=["POST"])
@jwt_required()
@rol_requerido("admin", "cuidador")
def subir(cuidador_id):
    if "archivo" not in request.files:
        return jsonify({"error": "No se envió el campo 'archivo'"}), 400

    archivo = request.files["archivo"]
    tipo_documento = request.form.get("tipo_documento")

    if not tipo_documento:
        return jsonify({"error": "El tipo_documento es obligatorio"}), 400

    resultado = documento_service.subir_documento(archivo, cuidador_id, tipo_documento)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 201

@documento_bp.route("/cuidador/<int:cuidador_id>", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "cuidador")
def obtener_por_cuidador(cuidador_id):
    documentos = documento_service.obtener_documentos_por_cuidador(cuidador_id)
    return jsonify(documentos), 200

@documento_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
@rol_requerido("admin")
def eliminar(id):
    resultado = documento_service.eliminar_documento(id)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200
