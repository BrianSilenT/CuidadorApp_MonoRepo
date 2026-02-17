from flask import Blueprint, request, jsonify
from app.extensions import bcrypt, db, tokens_revocados
from app.models.usuario import Usuario
from app.services.usuario_service import obtener_usuario_por_email
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt

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
    token = create_access_token(identity=str(usuario.id))

    return jsonify({
        "mensaje": "Login exitoso",
        "token": token,
        "usuario": {
            "id": usuario.id,
            "email": usuario.email,
            "rol": usuario.rol
        }
    }), 200


@auth_bp.route('/cambiar-password', methods=['PUT'])
@jwt_required()
def cambiar_password():
    datos = request.get_json()

    if not datos.get("password_actual"):
        return jsonify({"error": "La contraseña actual es obligatoria"}), 400
    if not datos.get("password_nueva"):
        return jsonify({"error": "La contraseña nueva es obligatoria"}), 400
    if len(datos["password_nueva"]) < 6:
        return jsonify({"error": "La contraseña nueva debe tener al menos 6 caracteres"}), 400

    usuario_id = get_jwt_identity()
    usuario = Usuario.query.get(int(usuario_id))

    # Verificar que la contraseña actual sea correcta
    if not bcrypt.check_password_hash(usuario.password, datos["password_actual"]):
        return jsonify({"error": "La contraseña actual es incorrecta"}), 401

    # Actualizar la contraseña
    usuario.password = bcrypt.generate_password_hash(datos["password_nueva"]).decode('utf-8')
    db.session.commit()

    return jsonify({"mensaje": "Contraseña actualizada correctamente"}), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    tokens_revocados.add(jti)
    return jsonify({"mensaje": "Sesión cerrada correctamente"}), 200
