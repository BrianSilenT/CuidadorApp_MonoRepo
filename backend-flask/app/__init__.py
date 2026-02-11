from flask import Flask
from config import Config
from app.extensions import db, migrate, cors, bcrypt, jwt


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Conectar extensiones a la app
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Importar modelos para que Flask-Migrate los detecte
    from app.models import Usuario, Cuidador, Paciente, Guardia, Pago

    # Registrar blueprints (rutas)
    from app.routes.auth_routes import auth_bp
    from app.routes.usuario_routes import usuario_bp
    from app.routes.cuidador_routes import cuidador_bp
    from app.routes.paciente_routes import paciente_bp
    from app.routes.guardia_routes import guardia_bp
    from app.routes.pago_routes import pago_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(usuario_bp)
    app.register_blueprint(cuidador_bp)
    app.register_blueprint(paciente_bp)
    app.register_blueprint(guardia_bp)
    app.register_blueprint(pago_bp)

    return app