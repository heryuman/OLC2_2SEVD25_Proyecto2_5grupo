from app.utils.response import response_json
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
import os
import pandas as pd
from sklearn.metrics import (
    silhouette_score,
    calinski_harabasz_score,
    davies_bouldin_score
)

def training_model(hyperparams,hyperparams_r):
    ROOT_DIR = os.path.dirname(os.path.abspath(__file__))   # /app/utils
    ROOT_DIR = os.path.dirname(ROOT_DIR)                    # /app
    ROOT_DIR = os.path.dirname(ROOT_DIR)    

    try:

        nombre= "insight_cluster.csv"
        path=os.path.join(ROOT_DIR+"/clean_files",nombre)

        print("leyendo archivo "+path)

        df=pd.read_csv(path)

# ENTRENAMIENTO DE KMEEANS
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

        k = hyperparams[0]
        rs=hyperparams[1]
        ninit=hyperparams[2]
        kmeans_clientes = KMeans(
            n_clusters=k,
            random_state=rs,
            n_init=ninit
        )

        stopwords_es = [
    "de", "la", "que", "el", "en", "y", "a", "los", "del", "se",
    "las", "por", "un", "para", "con", "no", "una", "su", "al",
    "lo", "como", "más", "pero", "sus", "le", "ya", "o", "este",
    "sí", "porque", "esta", "entre", "cuando", "muy", "sin",
    "sobre", "también", "me", "hasta", "hay", "donde", "quien"
]

        df["segmento_cliente"] = kmeans_clientes.fit_predict(X_clientes)
        df["texto_limpio"] = df["texto_reseña"].apply(limpiar_txt)
        vectorizer = TfidfVectorizer(
        stop_words=stopwords_es,
        max_features=500,
        min_df=2,
        max_df=0.9,
        ngram_range=(1, 2)
        )   

        X_tfidf = vectorizer.fit_transform(df["texto_limpio"])

    #kmeans pra reseñas
        k_reseñas = hyperparams_r[0]
        rs_r=hyperparams_r[1]
        ninit_r=hyperparams_r[2]

        kmeans_reseñas = KMeans(
        n_clusters=k_reseñas,
        random_state=rs_r,
        n_init=ninit_r)

        df["tema_reseña"] = kmeans_reseñas.fit_predict(X_tfidf)


    #METRICAS  PARA CLIENTES
        silhouette_c = silhouette_score(X_clientes, df["segmento_cliente"])
        calinski_c = calinski_harabasz_score(X_clientes, df["segmento_cliente"])
        davies_c = davies_bouldin_score(X_clientes, df["segmento_cliente"])
        inercia_c = kmeans_clientes.inertia_
        
        print("Clientes:")
        print("Silhouette:", round(silhouette_c, 3))
        print("Calinski-Harabasz:", round(calinski_c, 2))
        print("Davies-Bouldin:", round(davies_c, 3))
        print("Inercia:", round(inercia_c, 2))

        silhouette_r = silhouette_score(X_tfidf, df["tema_reseña"])
        calinski_r = calinski_harabasz_score(X_tfidf.toarray(), df["tema_reseña"])
        davies_r = davies_bouldin_score(X_tfidf.toarray(), df["tema_reseña"])
        inercia_r = kmeans_reseñas.inertia_

        print("\nReseñas:")
        print("Silhouette:", round(silhouette_r, 3))
        print("Calinski-Harabasz:", round(calinski_r, 2))
        print("Davies-Bouldin:", round(davies_r, 3))
        print("Inercia:", round(inercia_r, 2))

        terms = vectorizer.get_feature_names_out()

        for i in range(k_reseñas):
            centroid = kmeans_reseñas.cluster_centers_[i]
            top_terms = centroid.argsort()[-5:][::-1]
            print(f"Tema {i}: ", [terms[t] for t in top_terms])



        return response_json(
            message=" Modelo entrenado correctamente"
        )
    except :
        return response_json(
            success=False,
            message="No se logró entrenar el modelo",
            error={"Problema al entrenar el modelo"},
            status=500
        )

#CLUSTERING DE RESEÑAS TF-IDF
# LIMPIEZA DE TEXTO


import re

def limpiar_txt(texto):
        texto=texto.lower()
        texto = re.sub(r"[^a-záéíóúñ\s]", "", texto)
        return texto
