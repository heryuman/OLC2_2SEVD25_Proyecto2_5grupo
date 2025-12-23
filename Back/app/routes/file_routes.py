from flask import Blueprint, jsonify, request
from app.services.file_service import (
    upload_file
)

file_bp = Blueprint("file", __name__)

@file_bp.post("/upload")
def subir():

    if "file" not in request.files:
        return jsonify({"error": "No se envió ningún archivo"}), 400

    archivo = request.files["file"]  # <-- así extraes el archivo

    # Aquí puedes acceder a:
    # archivo.filename  -> nombre original del archivo
    # archivo.read()    -> contenido binario
    # archivo.save(path)-> guardarlo en disco

    
    #print(upload_file(archivo))

    #return jsonify("mensaje:ok")
    return (upload_file(archivo))

"""
@estudiante_bp.post("/evaluar")
def evaluar():
    data = request.json
    resultado = evaluar_riesgo(data)
    return jsonify(resultado)
"""