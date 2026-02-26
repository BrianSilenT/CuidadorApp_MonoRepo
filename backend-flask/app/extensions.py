from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
bcrypt = Bcrypt()
jwt = JWTManager()

# Blacklist de tokens revocados (en memoria para desarrollo)
tokens_revocados = set()


@jwt.token_in_blocklist_loader
def verificar_token_revocado(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    return jti in tokens_revocados