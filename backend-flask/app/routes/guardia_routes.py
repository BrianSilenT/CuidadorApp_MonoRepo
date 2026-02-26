from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import guardia_service
from app.models.cuidador import Cuidador
from app.models.usuario import Usuario
from app.models.guardia import Guardia
from app.utils.permisos import rol_requerido

guardia_bp = Blueprint("guardias", __name__, url_prefix="/guardias")

@guardia_bp.route("/", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "cuidador")
def obtener_todas():
    pagina = request.args.get("pagina", 1, type=int)
    por_pagina = request.args.get("por_pagina", 10, type=int)
    resultado = guardia_service.obtener_todas_guardias(pagina, por_pagina)
    return jsonify(resultado), 200

@guardia_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "cuidador")
def obtener_por_id(id):
    guardia = guardia_service.obtener_guardia_por_id(id)
    if guardia:
        return jsonify(guardia), 200
    return jsonify({"error": "Guardia no encontrada"}), 404

@guardia_bp.route("/cuidador/<int:cuidador_id>", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "cuidador")
def obtener_por_cuidador(cuidador_id):
    pagina = request.args.get("pagina", 1, type=int)
    por_pagina = request.args.get("por_pagina", 10, type=int)
    resultado = guardia_service.obtener_guardias_por_cuidador(cuidador_id, pagina, por_pagina)
    return jsonify(resultado), 200

@guardia_bp.route("/paciente/<int:paciente_id>", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "familia")
def obtener_por_paciente(paciente_id):
    pagina = request.args.get("pagina", 1, type=int)
    por_pagina = request.args.get("por_pagina", 10, type=int)
    resultado = guardia_service.obtener_guardias_por_paciente(paciente_id, pagina, por_pagina)
    return jsonify(resultado), 200

@guardia_bp.route("/", methods=["POST"])
@jwt_required()
@rol_requerido("admin", "cuidador")
def crear():
    datos = request.get_json()
    usuario_id = get_jwt_identity()
    usuario = Usuario.query.get(int(usuario_id))

    # Si es cuidador, solo puede crear guardias propias
    if usuario.rol == "cuidador":
        cuidador = Cuidador.query.filter_by(usuario_id=usuario.id).first()
        if not cuidador:
            return jsonify({"error": "No tienes un perfil de cuidador asociado"}), 403
        if datos.get("cuidador_id") != cuidador.id:
            return jsonify({"error": "No puedes crear guardias de otros cuidadores"}), 403

    resultado = guardia_service.crear_guardia(datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 201

@guardia_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
@rol_requerido("admin", "cuidador")
def actualizar(id):
    datos = request.get_json()
    usuario_id = get_jwt_identity()
    usuario = Usuario.query.get(int(usuario_id))

    # Si es cuidador, solo puede actualizar guardias propias
    if usuario.rol == "cuidador":
        cuidador = Cuidador.query.filter_by(usuario_id=usuario.id).first()
        if not cuidador:
            return jsonify({"error": "No tienes un perfil de cuidador asociado"}), 403
        guardia = Guardia.query.get(id)
        if not guardia:
            return jsonify({"error": "Guardia no encontrada"}), 404
        if guardia.cuidador_id != cuidador.id:
            return jsonify({"error": "No puedes modificar guardias de otros cuidadores"}), 403

    resultado = guardia_service.actualizar_guardia(id, datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200

@guardia_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
@rol_requerido("admin", "cuidador")
def eliminar(id):
    usuario_id = get_jwt_identity()
    usuario = Usuario.query.get(int(usuario_id))

    # Si es cuidador, solo puede eliminar guardias propias
    if usuario.rol == "cuidador":
        cuidador = Cuidador.query.filter_by(usuario_id=usuario.id).first()
        if not cuidador:
            return jsonify({"error": "No tienes un perfil de cuidador asociado"}), 403
        guardia = Guardia.query.get(id)
        if not guardia:
            return jsonify({"error": "Guardia no encontrada"}), 404
        if guardia.cuidador_id != cuidador.id:
            return jsonify({"error": "No puedes eliminar guardias de otros cuidadores"}), 403

    resultado = guardia_service.eliminar_guardia(id)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200

@guardia_bp.route("/horas/cuidador/<int:cuidador_id>", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "cuidador")
def horas_por_cuidador(cuidador_id):
    resultado = guardia_service.obtener_horas_por_cuidador(cuidador_id)
    return jsonify(resultado), 200

@guardia_bp.route("/horas/cuidador/<int:cuidador_id>/paciente/<int:paciente_id>", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "cuidador")
def horas_por_cuidador_y_paciente(cuidador_id, paciente_id):
    resultado = guardia_service.obtener_horas_por_cuidador_y_paciente(cuidador_id, paciente_id)
    return jsonify(resultado), 200
