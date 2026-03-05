import os
os.environ["PYTHONUTF8"] = "1"
from app import create_app
from app.extensions import db
from app.models.usuario import Usuario
from flask_migrate import Migrate

try:
    from seed import seed_data
except ImportError:
    seed_data = None

app = create_app()
migrate = Migrate(app, db)

def initialize_database(app):
    with app.app_context():
        # Ya no usamos db.create_all(), dejamos que Flask-Migrate maneje las tablas
        if seed_data:
            seed_data(app)
        elif Usuario.query.first():
            print("Database initialized.")

if __name__ == "__main__":
    initialize_database(app)
    app.run(debug=os.getenv("FLASK_ENV") == "development")