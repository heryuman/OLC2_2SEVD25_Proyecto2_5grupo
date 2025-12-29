from app.utils.response import response_json
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
import nltk
import os
import joblib
import pandas as pd
from sklearn.metrics import (
    silhouette_score,
    calinski_harabasz_score,
    davies_bouldin_score
)

nltk.download('punkt_tab')
from nltk.tokenize import word_tokenize
from nltk.tokenize import sent_tokenize
# Descargar la lista de palabras (solo la primera vez)
nltk.download('stopwords')
from nltk.corpus import stopwords

# Obtener la lista de stop words en español
lista_spanish = stopwords.words('spanish')


ASPECTOS = {
    "usabilidad": [
        "interfaz", "intuitiva", "fácil", "uso", "aprendizaje"
    ],
    "rendimiento": [
        "rendimiento", "lento", "rápido", "velocidad", "desempeño","mejora","mejorar"
    ],
    "experiencia": [
        "experiencia", "agradable", "satisfacción", "sensación"
    ],
    "cumplimiento": [
        "cumple", "básico", "esperado", "promete"
    ],
    "soporte": [
        "soporte", "atención", "ayuda", "acompañamiento"
    ]
}



def training_model(hyperparams,hyperparams_r):
    ROOT_DIR = os.path.dirname(os.path.abspath(__file__))   # /app/utils
    ROOT_DIR = os.path.dirname(ROOT_DIR)                    # /app
    ROOT_DIR = os.path.dirname(ROOT_DIR)    

    try:

        nombre= "data_clean.csv"
        path=os.path.join(ROOT_DIR+"/clean_files",nombre)

        print("leyendo archivo "+path)

        df=pd.read_csv(path)

        seg_clientes=segmentacion_clientes(df,hyperparams)
        seg_reseñas= segmentacion_reseñas(df,hyperparams_r)

        

        #Tabla cruzada Segmento vs Tema 
        tabla_relacion = pd.crosstab(
            df["segmento_cliente"],
            df["tema_reseña"]
        )

        resp={
             "info_clientes":seg_clientes,
             "info_reseñas": seg_reseñas
       }

        return response_json(
            message=" Modelo entrenado correctamente",
            data=resp
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
    if texto is not None:
        texto=texto.lower()
        # Eliminar números
        texto = re.sub(r'\d+', '', texto)
        #texto

        # Eliminar puntuación
        texto = re.sub(r'[^\w\s]', '', texto)
        #texto

        # Eliminar espacios extra
        texto = re.sub(r'\s+', ' ', texto).strip()
        texto

        return texto
    return ""

def segmentacion_clientes(df,hyperparams):
     
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

        df["segmento_cliente"] = kmeans_clientes.fit_predict(X_clientes)

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

        os.makedirs("models_ml/clientes", exist_ok=True)

        # Guardar columnas
        joblib.dump(df_clientes.columns.tolist(), "models_ml/clientes/columnas_clientes.pkl")

        # Guardar scaler y modelo
        joblib.dump(scaler, "models_ml/clientes/scaler_clientes.pkl")
        joblib.dump(kmeans_clientes, "models_ml/clientes/kmeans_clientes.pkl")

                # obtener el perfil promedo de cada segmento
        perfil_segmentos = (
        df.groupby("segmento_cliente")[
        [
            "frecuencia_compra",
            "monto_total_gastado",
            "monto_promedio_compra",
            "dias_desde_ultima_compra",
            "antiguedad_cliente_meses",
            "numero_productos_distintos"
        ]
    ]
    .mean()
    .round(2)
    
)
        perfil_segmentos_reset=perfil_segmentos.reset_index()
        perfil_json=perfil_segmentos_reset.to_dict(orient="records")
        data_metricas={
             "Silhouette": round(silhouette_c, 3),
             "Calinski-Harabasz":round(calinski_c, 2),
             "Davies-Bouldin":round(davies_c, 3),
             "Inercia:": round(inercia_c, 2)
             
        }

        data_sementacion={
             "data_segmentos":perfil_json,
             "metricas":data_metricas
        }

        return data_sementacion

def segmentacion_reseñas(df,hyperparams_r):
        stopwords_es = [
    "de", "la", "que", "el", "en", "y", "a", "los", "del", "se",
    "las", "por", "un", "para", "con", "no", "una", "su", "al",
    "lo", "como", "más", "pero", "sus", "le", "ya", "o", "este",
    "sí", "porque", "esta", "entre", "cuando", "muy", "sin",
    "sobre", "también", "me", "hasta", "hay", "donde", "quien",
    "aunque","es"
]


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



        silhouette_r = silhouette_score(X_tfidf, df["tema_reseña"])
        calinski_r = calinski_harabasz_score(X_tfidf.toarray(), df["tema_reseña"])
        davies_r = davies_bouldin_score(X_tfidf.toarray(), df["tema_reseña"])
        inercia_r = kmeans_reseñas.inertia_

        print("\nReseñas:")
        print("Silhouette:", round(silhouette_r, 3))
        print("Calinski-Harabasz:", round(calinski_r, 2))
        print("Davies-Bouldin:", round(davies_r, 3))
        print("Inercia:", round(inercia_r, 2))

#interpretacon de los temas de reseñas
        """
        terms = vectorizer.get_feature_names_out()
        for i in range(k_reseñas):
            centroid = kmeans_reseñas.cluster_centers_[i]
            top_terms = centroid.argsort()[-5:][::-1]
            print(f"Tema {i}: ", [terms[t] for t in top_terms])
        """
        terms = vectorizer.get_feature_names_out()
        temas = {}

        for i, centroid in enumerate(kmeans_reseñas.cluster_centers_):
            top_indices = centroid.argsort()[-5:][::-1]
            palabras = [terms[idx] for idx in top_indices]
        #print("descripcion")
            temas[i]=(generar_descripcion(i,palabras,ASPECTOS))
            #temas[i] = palabras

        print(temas)


        os.makedirs("models_ml/reseñas", exist_ok=True)

        joblib.dump(vectorizer, "models_ml/reseñas/tfidf_vectorizer.pkl")
        joblib.dump(kmeans_reseñas, "models_ml/reseñas/kmeans_reseñas.pkl")
        data_metricas={
             "Silhouette": round(silhouette_r, 3),
             "Calinski-Harabasz":round(calinski_r, 2),
             "Davies-Bouldin":round(davies_r, 3),
             "Inercia:": round(inercia_r, 2)
             
        }

        data_reseñas={
             "descripcion":temas,
             "metricas":data_metricas
        }

        return data_reseñas

def inferir_aspecto(palabras_tema, aspectos):
    scores = {aspecto: 0 for aspecto in aspectos}

    for palabra in palabras_tema:
        for aspecto, keywords in aspectos.items():
            if any(k in palabra for k in keywords):
                scores[aspecto] += 1

    # elegir el aspecto más representativo
    aspecto_principal = max(scores, key=scores.get)

    # si no hay coincidencias claras
    if scores[aspecto_principal] == 0:
        return "aspecto general no definido"

    return aspecto_principal
def generar_descripcion(tema_id, palabras, aspectos):
    aspecto = inferir_aspecto(palabras, aspectos)

    return {
        "tema_id": tema_id,
        "aspecto_inferido": aspecto,
        "descripcion": (
            f"Este tema agrupa reseñas que, en este conjunto de datos, "
            f"se centran principalmente en aspectos relacionados con {aspecto}."
        ),
        "palabras_clave": palabras
    }
