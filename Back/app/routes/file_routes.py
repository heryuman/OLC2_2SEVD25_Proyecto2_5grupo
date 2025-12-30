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
        columns_num = [
            'cliente_id',
            'frecuencia_compra',
            'monto_total_gastado',
            'monto_promedio_compra',
            'dias_desde_ultima_compra',
            'antiguedad_cliente_meses',
            'numero_productos_distintos',
            'reseña_id'
        ]
        pd.set_option('display.max_columns', None)
        df = pd.read_csv(csv_path)

        print("**************************************************************")
        print("*******************INICIA CARGA*******************************")
        print("**************************************************************")
        print(df.head())
        print("**************************************************************")
        print("**************************************************************")
        df.info()
        #Eliminamos registros con valores nulos
        df = df.dropna(subset=['cliente_id'])
        #Buscamos registros duplicados
        duplicados = df[df.duplicated(subset=['cliente_id'], keep=False)]
        #Eliminamos registros duplicados
        df = df.drop_duplicates(subset=['cliente_id'], keep='first')


        #LIMPIEZA DATA DE TIPO NUMERICO

        for column in columns_num:
            
            # 1️⃣ Validar que sea numérico real (NO limpiar texto raro)
            mask_numeric = df[column].astype(str).str.match(r'^\d+(\.\d+)?$')

            # 2️⃣ Eliminar filas inválidas
            df = df[mask_numeric]

            # 3️⃣ Convertir a numérico
            df[column] = df[column].astype(float)

            

            # 1. Limpiar rango
            #df = df[(df[column] >= 0) & (df[column] <= 100)]

            # 2. Outliers
            Q1 = df[column].quantile(0.25)
            Q3 = df[column].quantile(0.75)
            IQR = Q3 - Q1

            lower = Q1 - 1.5 * IQR
            upper = Q3 + 1.5 * IQR

            # 3. Filtrar
            df = df[(df[column] >= lower) & (df[column] <= upper)]

            # 4. Imputar con median
            df[column] = df[column].fillna(
                df[column].median()
            )


            hay_decimal = (df[column] % 1 != 0).any()

            if hay_decimal:
                print("hay decimales")
            else:
                df[column] = df[column].astype("int64")

        
        df['fecha_reseña'] = pd.to_datetime(
            df['fecha_reseña'],
            format='%d/%m/%Y',
            errors='coerce'
        )
        df = df.dropna(subset=['fecha_reseña'])


        print("**************************************************************")
        print("*********************CON CORRECCIONES*************************")
        print(df.head())
        print("**************************************************************")
        print("**************************************************************")
        df.info()


        ruta = 'clean_files/data_clean.csv'

        if os.path.exists(ruta):
            os.remove(ruta)
            print('Archivo anterior eliminado')
        
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