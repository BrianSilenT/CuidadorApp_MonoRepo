import os
from app import create_app
from app.extensions import db
from app.models.usuario import Usuario
try:
    from seed import seed_data
except ImportError:
    seed_data = None

app = create_app()

def initialize_database(app):
    with app.app_context():
        db.create_all()
        if seed_data:
            seed_data(app)
        elif Usuario.query.first():
            print("Database initialized.")

if __name__ == "__main__":
    initialize_database(app)
    app.run(debug=os.getenv("FLASK_ENV") == "development")
