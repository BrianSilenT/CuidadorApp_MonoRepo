from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models.usuario import Usuario


def rol_requerido(*roles_permitidos):
    """
    Decorador que verifica si el usuario logueado tiene uno de los roles permitidos.
    Uso: @rol_requerido("admin", "cuidador")
    """
    def decorador(funcion):
        @wraps(funcion)
        def wrapper(*args, **kwargs):
            usuario_id = get_jwt_identity()
            usuario = Usuario.query.get(int(usuario_id))

            if not usuario:
                return jsonify({"error": "Usuario no encontrado"}), 404

            if usuario.rol not in roles_permitidos:
                return jsonify({"error": "No tienes permiso para esta acción"}), 403

            return funcion(*args, **kwargs)
        return wrapper
    return decorador
