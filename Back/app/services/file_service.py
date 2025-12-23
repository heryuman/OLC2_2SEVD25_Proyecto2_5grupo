from app.utils.response import response_json
import os

def __init__(self):
    self._filename=None


def upload_file(archivo):
    ROOT_DIR = os.path.dirname(os.path.abspath(__file__))   # /app/utils
    ROOT_DIR = os.path.dirname(ROOT_DIR)                    # /app
    ROOT_DIR = os.path.dirname(ROOT_DIR)    

    try:

        nombre= "insight_cluster.csv"
        path=os.path.join(ROOT_DIR+"/uploads",nombre)
        
        archivo.save(path)

        print("ruta del archivo"+path)
        print("PID en upload:", os.getpid())
        return response_json(
            message="Archivo: "+nombre+"Persistido correctamente"
        )
    except :
        return response_json(
            success=False,
            message="No se logro persistir el archivo: "+nombre,
            error={"description: no se persisito el archivo"},
            status=500
        )