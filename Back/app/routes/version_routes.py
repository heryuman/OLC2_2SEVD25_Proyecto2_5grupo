from flask import Blueprint, jsonify, request
from app.services.version_service import (
 obtener_version   
)

version_bp = Blueprint("version", __name__)

@version_bp.get("/")
def get_version():
    return obtener_version()

