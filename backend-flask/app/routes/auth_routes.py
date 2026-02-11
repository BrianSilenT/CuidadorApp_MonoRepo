from flask import Blueprint, request, jsonify
from app.extensions import bcrypt
from app.services.usuario_service import obtener_usuario_por_email
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    datos = request.get_json()

    # Validar que vengan los datos
    if not datos.get("email"):
        return jsonify({"error": "El email es obligatorio"}), 400
    if not datos.get("password"):
        return jsonify({"error": "La contraseña es obligatoria"}), 400

    # Buscar el usuario por email
    usuario = obtener_usuario_por_email(datos["email"])
    if not usuario:
        return jsonify({"error": "Credenciales inválidas"}), 401

    # Verificar la contraseña
    password_valida = bcrypt.check_password_hash(usuario.password, datos["password"])
    if not password_valida:
        return jsonify({"error": "Credenciales inválidas"}), 401

    # Crear el token JWT
    token = create_access_token(identity=usuario.id)

    return jsonify({
        "mensaje": "Login exitoso",
        "token": token,
        "usuario": {
            "id": usuario.id,
            "email": usuario.email,
            "rol": usuario.rol
        }
    }), 200
