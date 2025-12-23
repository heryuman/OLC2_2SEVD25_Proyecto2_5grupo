from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Registrar rutas
    from app.routes.version_routes import version_bp
    from app.routes.file_routes import file_bp
    app.register_blueprint(version_bp, url_prefix="/api/version")
    app.register_blueprint(file_bp,url_prefix="/api/file")

    return app
