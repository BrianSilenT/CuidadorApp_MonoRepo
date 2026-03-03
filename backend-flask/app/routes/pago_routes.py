from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import pago_service
from app.models.usuario import Usuario
from app.models.cuidador import Cuidador
from app.models.pago import Pago
from app.utils.permisos import rol_requerido

pago_bp = Blueprint("pagos", __name__, url_prefix="/pagos")

@pago_bp.route("/", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "cuidador")
def obtener_todos():
    pagina = request.args.get("pagina", 1, type=int)
    por_pagina = request.args.get("por_pagina", 10, type=int)

    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)

    if usuario.rol == "admin":
        resultado = pago_service.obtener_todos_pagos(pagina, por_pagina)
    else:
        cuidador = Cuidador.query.filter_by(usuario_id=usuario.id).first()
        if not cuidador:
            return jsonify({"error": "No tienes un perfil de cuidador asociado"}), 403
        resultado = pago_service.obtener_pagos_por_cuidador(cuidador.id, pagina, por_pagina)

    return jsonify(resultado), 200

@pago_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "cuidador")
def obtener_por_id(id):
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)

    if usuario.rol == "cuidador":
        cuidador = Cuidador.query.filter_by(usuario_id=usuario.id).first()
        if not cuidador:
            return jsonify({"error": "No tienes un perfil de cuidador asociado"}), 403
        pago_model = Pago.query.get(id)
        if not pago_model:
            return jsonify({"error": "Pago no encontrado"}), 404
        if pago_model.cuidador_id != cuidador.id:
            return jsonify({"error": "No tienes permiso para este pago"}), 403

    pago = pago_service.obtener_pago_por_id(id)
    if pago:
        return jsonify(pago), 200
    return jsonify({"error": "Pago no encontrado"}), 404

@pago_bp.route("/cuidador/<int:cuidador_id>", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "cuidador")
def obtener_por_cuidador(cuidador_id):
    pagina = request.args.get("pagina", 1, type=int)
    por_pagina = request.args.get("por_pagina", 10, type=int)

    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)
    if usuario.rol == "cuidador":
        cuidador = Cuidador.query.filter_by(usuario_id=usuario.id).first()
        if not cuidador:
            return jsonify({"error": "No tienes un perfil de cuidador asociado"}), 403
        if cuidador.id != cuidador_id:
            return jsonify({"error": "No tienes permiso para ver pagos de otros cuidadores"}), 403

    resultado = pago_service.obtener_pagos_por_cuidador(cuidador_id, pagina, por_pagina)
    return jsonify(resultado), 200

@pago_bp.route("/", methods=["POST"])
@jwt_required()
@rol_requerido("admin")
def crear():
    datos = request.get_json()
    resultado = pago_service.crear_pago(datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 201

@pago_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
@rol_requerido("admin")
def actualizar(id):
    datos = request.get_json()
    resultado = pago_service.actualizar_pago(id, datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200

@pago_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
@rol_requerido("admin")
def eliminar(id):
    resultado = pago_service.eliminar_pago(id)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200

@pago_bp.route("/<int:id>/confirmar", methods=["PUT"])
@jwt_required()
@rol_requerido("admin")
def confirmar(id):
    resultado = pago_service.confirmar_pago(id)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200
