from datetime import datetime, timedelta, timezone
from flask import jsonify, make_response

def response_json(success=True, message="", data=None, error=None, status=200):
    # Crear el diccionario con los datos
    payload = {
        "success": success,
        "message": message,
        "data": data,
        "error": error,
        "timestamp": get_utcm6(),
    }
    
    # Usar jsonify para serializar el diccionario y crear la respuesta HTTP
    response = jsonify(payload)
    # Establecer el código de estado HTTP
    response.status_code = status
    
    return response


def get_utcm6():

    utc_now = datetime.now(timezone.utc)

    offset_6_horas = timedelta(hours=6)

    utc_menos_6 = utc_now - offset_6_horas

    return utc_menos_6.isoformat()