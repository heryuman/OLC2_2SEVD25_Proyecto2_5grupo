
from datetime import datetime, timedelta, timezone

def obtener_version():
    data={
        "version":"0.0.1",
        "timestam":get_utcm6(),
        "user":"heryuman"
    }
    return data


def get_utcm6():

    utc_now = datetime.now(timezone.utc)

    offset_6_horas = timedelta(hours=6)

    utc_menos_6 = utc_now - offset_6_horas

    return utc_menos_6.isoformat()