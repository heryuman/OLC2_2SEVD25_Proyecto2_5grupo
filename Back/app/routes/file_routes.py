from flask import Blueprint, jsonify, request
from app.services.file_service import (
    upload_file
)
import os
import pandas as pd

file_bp = Blueprint("file", __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
UPLOAD_DIR = os.path.join(PROJECT_ROOT,"uploads")

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

@file_bp.get("/limpieza")
def limpiar():
    

    csv_path = os.path.join(UPLOAD_DIR, "insight_cluster.csv")

    try:
        pd.set_option('display.max_columns', None)
        df = pd.read_csv(csv_path)

        print("**************************************************************")
        print("*******************INICIA CARGA*******************************")
        print("**************************************************************")

        #Eliminamos registros con valores nulos
        df = df.dropna(subset=['cliente_id'])
        #Buscamos registros duplicados
        duplicados = df[df.duplicated(subset=['cliente_id'], keep=False)]
        #Eliminamos registros duplicados
        df = df.drop_duplicates(subset=['cliente_id'], keep='first')

        ruta = 'clean_files/data_clean.csv'

        if os.path.exists(ruta):
            os.remove(ruta)
            print('Archivo anterior eliminado')
        else:
            df.to_csv(ruta, index=False, encoding='utf-8-sig')
            print('Archivo nuevo creado')


        return jsonify({
            "status": "success",
            "rows": len(df),
            "columns": list(df.columns)
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
        



"""
@estudiante_bp.post("/evaluar")
def evaluar():
    data = request.json
    resultado = evaluar_riesgo(data)
    return jsonify(resultado)
"""