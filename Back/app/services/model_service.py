from app.utils.response import response_json
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import os
import pandas as pd

def training_model():
    ROOT_DIR = os.path.dirname(os.path.abspath(__file__))   # /app/utils
    ROOT_DIR = os.path.dirname(ROOT_DIR)                    # /app
    ROOT_DIR = os.path.dirname(ROOT_DIR)    

    try:

        nombre= "insight_cluster.csv"
        path=os.path.join(ROOT_DIR+"/uploads",nombre)

        df=pd.read_csv(path)

        features_clientes = [
    "frecuencia_compra",
    "monto_total_gastado",
    "monto_promedio_compra",
    "dias_desde_ultima_compra",
    "antiguedad_cliente_meses",
    "numero_productos_distintos",
    "canal_principal"
]

        df_clientes = df[features_clientes].copy()

        df_clientes = pd.get_dummies(df_clientes, columns=["canal_principal"])

        scaler = StandardScaler()
        X_clientes = scaler.fit_transform(df_clientes)

        k = 4
        kmeans_clientes = KMeans(
            n_clusters=k,
            random_state=42,
            n_init=10
        )
        
        df["segmento_cliente"] = kmeans_clientes.fit_predict(X_clientes)


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

