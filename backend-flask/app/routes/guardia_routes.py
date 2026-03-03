from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.services import guardia_service
from app.models.cuidador import Cuidador
from app.models.usuario import Usuario
from app.models.guardia import Guardia
from app.models.paciente import Paciente
from app.utils.permisos import rol_requerido

guardia_bp = Blueprint("guardias", __name__, url_prefix="/guardias")

@guardia_bp.route("/", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "cuidador", "familia")
def obtener_todas():
    pagina = request.args.get("pagina", 1, type=int)
    por_pagina = request.args.get("por_pagina", 10, type=int)
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)

    if usuario.rol == "admin":
        resultado = guardia_service.obtener_todas_guardias(pagina, por_pagina)
    elif usuario.rol == "cuidador":
        cuidador = Cuidador.query.filter_by(usuario_id=usuario.id).first()
        if not cuidador:
            return jsonify({"error": "No tienes un perfil de cuidador asociado"}), 403
        resultado = guardia_service.obtener_guardias_por_cuidador(cuidador.id, pagina, por_pagina)
    else:
        resultado = guardia_service.obtener_guardias_por_familia(usuario_id, pagina, por_pagina)

    return jsonify(resultado), 200

@guardia_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "cuidador", "familia")
def obtener_por_id(id):
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)
    guardia_model = Guardia.query.get(id)

    if not guardia_model:
        return jsonify({"error": "Guardia no encontrada"}), 404

    if usuario.rol == "cuidador":
        cuidador = Cuidador.query.filter_by(usuario_id=usuario.id).first()
        if not cuidador:
            return jsonify({"error": "No tienes un perfil de cuidador asociado"}), 403
        if guardia_model.cuidador_id != cuidador.id:
            return jsonify({"error": "No tienes permiso para ver esta guardia"}), 403

    if usuario.rol == "familia":
        if not guardia_model.paciente or guardia_model.paciente.usuario_id != usuario.id:
            return jsonify({"error": "No tienes permiso para ver esta guardia"}), 403

    guardia = guardia_service.obtener_guardia_por_id(id)
    if guardia:
        return jsonify(guardia), 200
    return jsonify({"error": "Guardia no encontrada"}), 404

@guardia_bp.route("/cuidador/<int:cuidador_id>", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "cuidador", "familia")
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
            return jsonify({"error": "No tienes permiso para ver guardias de otros cuidadores"}), 403

    if usuario.rol == "familia":
        return jsonify({"error": "No tienes permiso para esta acción"}), 403

    resultado = guardia_service.obtener_guardias_por_cuidador(cuidador_id, pagina, por_pagina)
    return jsonify(resultado), 200

@guardia_bp.route("/paciente/<int:paciente_id>", methods=["GET"])
@jwt_required()
@rol_requerido("admin", "cuidador", "familia")
def obtener_por_paciente(paciente_id):
    pagina = request.args.get("pagina", 1, type=int)
    por_pagina = request.args.get("por_pagina", 10, type=int)
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)

    if usuario.rol == "familia":
        paciente = Paciente.query.get(paciente_id)
        if not paciente or paciente.usuario_id != usuario.id:
            return jsonify({"error": "No tienes permiso para ver guardias de este paciente"}), 403

    resultado = guardia_service.obtener_guardias_por_paciente(paciente_id, pagina, por_pagina)

    if usuario.rol == "cuidador":
        cuidador = Cuidador.query.filter_by(usuario_id=usuario.id).first()
        if not cuidador:
            return jsonify({"error": "No tienes un perfil de cuidador asociado"}), 403
        resultado["datos"] = [g for g in resultado.get("datos", []) if g.get("cuidador", {}).get("id") == cuidador.id]
        resultado["total"] = len(resultado["datos"])

    return jsonify(resultado), 200

@guardia_bp.route("/mis-guardias", methods=["GET"])
@jwt_required()
@rol_requerido("familia")
def obtener_mis_guardias():
    pagina = request.args.get("pagina", 1, type=int)
    por_pagina = request.args.get("por_pagina", 10, type=int)
    usuario_id = int(get_jwt_identity())
    resultado = guardia_service.obtener_guardias_por_familia(usuario_id, pagina, por_pagina)
    return jsonify(resultado), 200

@guardia_bp.route("/", methods=["POST"])
@jwt_required()
@rol_requerido("admin", "cuidador", "familia")
def crear():
    datos = request.get_json()
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)

    # Si es cuidador, solo puede crear guardias propias
    if usuario.rol == "cuidador":
        cuidador = Cuidador.query.filter_by(usuario_id=usuario.id).first()
        if not cuidador:
            return jsonify({"error": "No tienes un perfil de cuidador asociado"}), 403
        if datos.get("cuidador_id") and int(datos.get("cuidador_id")) != cuidador.id:
            return jsonify({"error": "No puedes crear guardias de otros cuidadores"}), 403
        datos['cuidador_id'] = cuidador.id
    
    # Si es familia, verifica que el paciente sea suyo
    if usuario.rol == "familia":
        paciente_id = datos.get("paciente_id")
        if not paciente_id:
             return jsonify({"error": "Falta paciente_id"}), 400
        # Check permissions
        es_paciente_suyo = any(p.id == int(paciente_id) for p in usuario.pacientes)
        if not es_paciente_suyo:
             return jsonify({"error": "Este paciente no pertenece a su grupo familiar"}), 403
        
        cuidador_seleccionado_id = datos.get("cuidador_id")
        if cuidador_seleccionado_id:
            usuario.cuidador_preferido_id = cuidador_seleccionado_id
            datos['estado'] = 'Pendiente'
        else:
            if usuario.cuidador_preferido_id:
                datos['cuidador_id'] = usuario.cuidador_preferido_id
            else:
                return jsonify({"error": "Debe seleccionar un cuidador para solicitar una guardia"}), 400
            datos['estado'] = 'Pendiente'

    resultado = guardia_service.crear_guardia(datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 201

@guardia_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
@rol_requerido("admin", "cuidador", "familia")
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

    if usuario.rol == "familia":
        guardia = Guardia.query.get(id)
        if not guardia:
            return jsonify({"error": "Guardia no encontrada"}), 404

        if not guardia.paciente or guardia.paciente.usuario_id != usuario.id:
            return jsonify({"error": "No tienes permiso para modificar esta guardia"}), 403

        estado_solicitado = (datos or {}).get("estado")
        if estado_solicitado != "Cancelado" or len((datos or {}).keys()) != 1:
            return jsonify({"error": "La familia solo puede cancelar la guardia"}), 403

        estado_actual = (guardia.estado or "").lower()
        if estado_actual in ["completado", "cancelado"]:
            return jsonify({"error": "Esta guardia no se puede cancelar"}), 400

    resultado = guardia_service.actualizar_guardia(id, datos)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado), 200

@guardia_bp.route("/<int:id>/aceptar", methods=["PUT"])
@jwt_required()
@rol_requerido("cuidador")
def aceptar_guardia(id):
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)
    cuidador = Cuidador.query.filter_by(usuario_id=usuario.id).first()
    if not cuidador:
        return jsonify({"error": "No tienes un perfil de cuidador asociado"}), 403

    guardia = Guardia.query.get(id)
    if not guardia:
        return jsonify({"error": "Guardia no encontrada"}), 404

    if guardia.cuidador_id and guardia.cuidador_id != cuidador.id:
        return jsonify({"error": "No puedes aceptar guardias de otros cuidadores"}), 403

    guardia.cuidador_id = cuidador.id
    guardia.estado = "Programado"
    db.session.commit()

    return jsonify(guardia.to_dict()), 200

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
