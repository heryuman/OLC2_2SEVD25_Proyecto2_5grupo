# Manual Técnico 
# --- *Procesamiento y Limpieza de Datos para Insight Cluster*

## Participantes

-   **Elder Lopez 201700404**\
-   **Selvin Hernandez 201700603**\
-   **Josue Cux 201700688**

------------------------------------------------------------------------

# InsightCluster – Proyecto 2

Aplicación full‑stack para segmentación de clientes y agrupamiento de reseñas usando K-Means. Incluye limpieza de datos, entrenamiento, evaluación de métricas internas y visualización en frontend.

## Descripción General del Proyecto

Esta sección realiza un proceso completo de limpieza y depuración de
datos sobre el archivo **`insight_cluster.csv`**, con el objetivo de
dejar un dataset consistente, libre de ruido y listo para la fase de
modelado.

Las etapas cubren: 
- Validación de columnas clave
- Eliminación de registros nulo
- Depuración de valores no numéricos
- Eliminación de duplicados
- Conversión de tipos de datos
- Detección y tratamiento de outliers mediante IQR
- Conversión y validación de fechas
- Exportación del dataset limpio en `clean_files/data_clean.csv`

------------------------------------------------------------------------

# 🧹 1. Proceso de Limpieza de Datos

La limpieza de datos se construye a partir del siguiente archivo fuente:

    insight_cluster.csv

A continuación se documenta técnicamente cada etapa aplicada en el
script.

------------------------------------------------------------------------

## 1.1 Carga inicial del dataset

Se establece la ruta del archivo y se cargan los datos utilizando
`pandas`:

-   Se habilita la visualización completa de columnas.
-   Se imprime un preview (`head`) de los datos cargados.
-   Se muestra el esquema mediante `df.info()` para validar tipos
    iniciales, conteo de nulos y estructura general.

------------------------------------------------------------------------

## 1.2 Manejo de valores faltantes

-   Se eliminan registros donde `cliente_id` sea **nulo**, ya que esta
    columna es considerada identificador único y clave primaria del
    cliente.

``` python
df = df.dropna(subset=['cliente_id'])
```

------------------------------------------------------------------------

## 1.3 Detección y eliminación de duplicados

-   Se detectan registros duplicados por `cliente_id`.
-   Se conservan únicamente los primeros registros, eliminando
    duplicados posteriores.

``` python
duplicados = df[df.duplicated(subset=['cliente_id'], keep=False)]
df = df.drop_duplicates(subset=['cliente_id'], keep='first')
```

------------------------------------------------------------------------

## 1.4 Validación y limpieza de columnas numéricas

Las siguientes columnas se consideran numéricas:

``` python
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
```

Para cada columna se aplica el siguiente pipeline:

### **1. Validación estricta de valores numéricos**

-   Se aplica una expresión regular para aceptar solo valores numéricos
    válidos con o sin decimales.
-   **Registros con texto extraño o formatos inválidos (p. ej.
    `"4g.26"`) se eliminan por completo.**

``` python
mask_numeric = df[column].astype(str).str.match(r'^\d+(\.\d+)?$')
df = df[mask_numeric]
```

### **2. Conversión de tipos**

-   Una vez filtrados, los valores son convertidos a `float`.

``` python
df[column] = df[column].astype(float)
```

### **3. Detección y eliminación de outliers (IQR)**

Se utiliza el rango intercuartílico (IQR) para eliminar valores
atípicos:

-   Cálculo de Q1, Q3 e IQR
-   Determinación de límites válidos
-   Eliminación de valores fuera del rango permitido

``` python
Q1 = df[column].quantile(0.25)
Q3 = df[column].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR
df = df[(df[column] >= lower) & (df[column] <= upper)]
```

### **4. Imputación**

Los valores faltantes restantes se imputan utilizando **la mediana**.

``` python
df[column] = df[column].fillna(df[column].median())
```

### **5. Conversión final a enteros (cuando corresponda)**

Si la columna no contiene valores decimales, se transforma a tipo
`int64`.

------------------------------------------------------------------------

## 1.5 Limpieza de la columna de fecha

La columna `fecha_reseña` se convierte a tipo fecha con formato
`YYYY-MM-DD`.\
Los registros con fechas inválidas se eliminan.

``` python
df['fecha_reseña'] = pd.to_datetime(df['fecha_reseña'], format='%Y-%m-%d', errors='coerce')
df = df.dropna(subset=['fecha_reseña'])
```

------------------------------------------------------------------------

## 💾 1.6 Exportación del dataset final

El dataset limpio se exporta a:

    clean_files/data_clean.csv

Si el archivo existe, se elimina y se genera uno nuevo.

------------------------------------------------------------------------

#  2. Elección del Modelo

## Elección del Modelo: K-Means

**Motivo de elección:**  

El modelo **K-Means** se seleccionó por su **eficiencia y simplicidad** para agrupar datos sin etiquetas en **clusters homogéneos**. Es ideal cuando se busca **identificar patrones de similitud** y segmentar datos de manera rápida.

**Razones específicas:**

1. **Simplicidad y rapidez:**  
   K-Means es fácil de implementar y computacionalmente eficiente para conjuntos de datos medianos y grandes.

2. **Interpretabilidad:**  
   Los clusters resultantes son fáciles de interpretar, ya que cada punto pertenece a un solo cluster y se puede analizar su centroide.

3. **Flexibilidad:**  
   Permite controlar el número de clusters (*K*), ajustándose a la necesidad de segmentación del problema.

4. **Efectividad para datos continuos:**  
   Funciona muy bien con datos numéricos y escalados, como métricas de desempeño, consumo o características medibles de objetos/usuarios.



------------------------------------------------------------------------

#  3. Decisiones del Modelo

## Decisiones del Modelo

Durante el desarrollo del proyecto, se tomaron varias decisiones importantes para garantizar que el modelo K-Means funcionara de manera efectiva y consistente:

1. **Número de Clusters (*K*):**  
   Se decidió determinar el número óptimo de clusters utilizando el **método del codo (Elbow Method)**, evaluando la variación intra-cluster para encontrar un balance entre complejidad y representatividad de los datos.

2. **Escalado de datos:**  
   Todas las variables numéricas fueron normalizadas usando **StandardScaler** para asegurar que cada característica contribuyera de manera equitativa al cálculo de distancias, evitando que variables con mayor magnitud dominen el clustering.


3. **Número de iteraciones:**  
   Se configuró un límite máximo de iteraciones para garantizar que el algoritmo convergiera de manera eficiente, evitando ciclos infinitos en casos de datos con alta dispersión.

4. **Evaluación de clusters:**  
   Se utilizaron métricas internas como **inercia** y **silhouette score** para validar la calidad de los clusters y ajustar parámetros según la estructura de los datos.

5. **Tratamiento de valores atípicos:**  
   Se decidió analizar y, en ciertos casos, excluir valores atípicos que podían sesgar los centroides y afectar la segmentación final.

Estas decisiones permiten que el modelo K-Means entregue resultados confiables y útiles para la interpretación y segmentación de los datos.

Para las reseñas se realizan las elecciones similares, pero aca se añade el proceso de Normalización del texto y la vecotrización Numerica mediante *TF-IDF*

------------------------------------------------------------------------

#  4. Conclusiones

## Conclusiones

Después de aplicar el modelo K-Means y analizar los resultados, se pueden extraer las siguientes conclusiones:

1. **Segmentación efectiva de los datos:**  
   El modelo logró agrupar los datos en clusters coherentes, permitiendo identificar patrones y comportamientos similares dentro de cada grupo.

2. **Importancia de la limpieza y escalado:**  
   La normalización de los datos y la eliminación de valores atípicos resultaron fundamentales para obtener clusters precisos y representativos.

3. **Validación de parámetros:**  
   La elección del número de clusters mediante el método del codo y la evaluación con métricas como **silhouette score** aseguraron que la segmentación fuera significativa y no arbitraria.

4. **Aplicabilidad práctica:**  
   Los clusters obtenidos pueden utilizarse para **toma de decisiones**

5. **Posibles mejoras:**  
   Futuras iteraciones podrían incluir la comparación con otros algoritmos de clustering (por ejemplo, DBSCAN o Gaussian Mixture Models) y la incorporación de más variables para aumentar la riqueza del análisis.

En general, el modelo K-Means demostró ser **una herramienta eficiente y confiable** para el análisis no supervisado de este conjunto de datos.


------------------------------------------------------------------------

#  5. Decisiones Tomadas Durante el Desarrollo

## Decisiones Tomadas Durante el Desarrollo

Durante el desarrollo del proyecto se tomaron decisiones clave para asegurar la correcta preparación de los datos y la efectividad del modelo K-Means:

1. **Selección de variables relevantes:**  
   Se analizaron todas las variables disponibles y se eligieron únicamente aquellas que aportan información significativa para el clustering, eliminando columnas redundantes o con muchos valores faltantes.

2. **Tratamiento de datos faltantes:**  
   Se optó por imputar o eliminar registros según el contexto de la variable, garantizando que los datos utilizados fueran consistentes y no afectaran la segmentación.

3. **Normalización y escalado:**  
   Todas las características numéricas fueron normalizadas para asegurar que cada variable contribuyera equitativamente al cálculo de distancias entre los datos.

4. **Elección de la técnica de clustering:**  
   Se seleccionó **K-Means** por su simplicidad, rapidez y facilidad de interpretación, siendo adecuado para conjuntos de datos medianos y continuos.

5. **Determinación del número de clusters (*K*):**  
   Se utilizó el **método del codo (Elbow Method)** para encontrar un balance entre la compactación de los clusters y la complejidad del modelo.


6. **Manejo de valores atípicos:**  
   Se identificaron y trataron valores atípicos que podrían distorsionar los centroides y afectar la interpretación de los clusters.

Estas decisiones fueron fundamentales para **asegurar la confiabilidad del modelo** y obtener resultados que puedan ser utilizados para análisis y toma de decisiones posteriores.




---

## Arquitectura
- **Backend:** Flask (Python), endpoints REST en `Back/app/routes/`, lógica en `Back/app/services/`, respuestas uniformes con `Back/app/utils/response.py`.
- **Modelo:** K-Means (scikit-learn) para dos vistas: clientes (datos numéricos + categoría) y reseñas (texto con TF-IDF).
- **Frontend:** React + Vite + TypeScript (`front-insightcluster/`), rutas con React Router.

## Flujo de trabajo (end-to-end)
1) **Carga**: Subir CSV en la vista Carga Masiva (`/`) → POST `/api/file/upload`.
2) **Limpieza**: Ejecutar limpieza → GET `/api/file/limpieza` → genera `Back/clean_files/data_clean.csv`.
3) **Ajuste**: Configurar hiperparámetros en Ajuste (`/ajuste`) → POST `/api/model/set_stats` (clientes y reseñas por separado).
4) **Entrenamiento**: Se ejecuta K-Means para clientes y reseñas; guarda artefactos en `Back/models_ml/`.
5) **Evaluación**: Consultar métricas en Evaluación (`/evaluacion`) → GET `/api/model/stats`.

## Endpoints principales
- POST `/api/file/upload` – sube CSV crudo.
- GET `/api/file/limpieza` – limpia y escribe `clean_files/data_clean.csv`.
- GET `/api/model/training` – entrenamiento con valores por defecto (K=5, RS=42, max_iter=20 en código base).
- POST `/api/model/set_stats` – entrenamiento con hiperparámetros enviados desde el frontend.
- GET `/api/model/stats` – expone métricas internas de clustering para clientes y reseñas.

## Modelo y preprocesamiento
**Clientes**
- Features: frecuencia_compra, monto_total_gastado, monto_promedio_compra, dias_desde_ultima_compra, antiguedad_cliente_meses, numero_productos_distintos, canal_principal.
- Preproceso: one-hot a canal_principal, escalado con StandardScaler.
- Modelo: K-Means (n_clusters=K, random_state=RS, max_iter=MI, n_init=20).
- Artefactos: columnas, scaler, modelo guardados en `models_ml/clientes/`.

**Reseñas**
- Texto en `texto_reseña`.
- Preproceso: limpieza básica (lower, sin números/puntuación), TF-IDF (max_features=500, min_df=2, max_df=0.9, ngram_range=(1,2), stopwords ES).
- Modelo: K-Means con los mismos hiperparámetros.
- Artefactos: vectorizador y modelo en `models_ml/reseñas/`.
- Descripción de temas: top palabras de cada centroide + mapeo a aspectos (usabilidad, rendimiento, experiencia, cumplimiento, soporte).
## Estructura del backend
```
Back/
├── app.py                  # Punto de entrada Flask
├── requirements.txt        # Dependencias backend
├── app/
│   ├── __init__.py
│   ├── routes/
│   │   ├── file_routes.py      # Upload y limpieza
│   │   └── version_routes.py   # Información de versión/health
│   ├── services/
│   │   ├── file_service.py     # Lógica de carga/limpieza
│   │   └── version_service.py  # Lógica de versión
│   └── utils/response.py       # Respuestas estándar
├── clean_files/
│   └── data_clean.csv          # Dataset limpio generado
├── models_ml/                  # Modelos y artefactos
└── uploads/                    # Archivos subidos
```

## Estructura del frontend
```
front-insightcluster/
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig*.json
├── public/
└── src/
    ├── main.tsx               # Entrypoint React
    ├── App.tsx                # Rutas principales
    ├── constant/url.ts        # Base URL API
    ├── pages/
    │   ├── CargaMasiva.tsx    # Subida y limpieza
    │   ├── Ajuste.tsx         # Ajuste de KMeans
    │   └── Evaluacion.tsx     # Métricas de clustering
    ├── components/
    │   ├── Navbar.tsx
    │   ├── UploadBox.tsx
    │   └── ConfigPanel.tsx
    └── styles/                # CSS modular (ajuste, evaluación, etc.)
```

## Licencia
Proyecto académico; uso interno para la entrega del curso.
- `models/modelo_entrenado.pkl`: Modelo entrenado y métricas.

---

## 7. Problemas Comunes y Solución

- "No hay datos cargados": Cargar CSV vía `/api/cargaMasiva` antes de limpiar/entrenar.
- "Modelo no disponible": Ejecutar entrenamiento para generar `models/modelo_entrenado.pkl`.
- Error en predicción por campos faltantes: completar todos los requeridos del endpoint.
- Métricas no disponibles: entrenar y luego consultar `/api/Rendimiento/consultar_metricas`.

### 7.1 Dependencias del Backend

Se definió las siguientes dependencias en `requirements.txt`:

```
Flask==3.1.2          # Framework web
flask-cors==6.0.1     # Manejo de CORS
matplotlib==3.10.7    # Visualización de datos
numpy==2.3.5          # Operaciones numéricas
pandas==2.3.3         # Manipulación de datos
scikit-learn==1.7.2   # Machine Learning
```

---

## 8. Estructura del Frontend

El desarrollador implementó el frontend con la siguiente organización:

### 8.1 Estructura de Directorios

```
frontend/
├── index.html              # Punto de entrada HTML
├── package.json            # Configuración y dependencias
├── vite.config.js         # Configuración de Vite
├── public/                # Recursos estáticos
└── src/                   # Código fuente
    ├── main.jsx           # Entrada de React
    ├── App.jsx            # Componente principal
    ├── App.css            # Estilos globales
    ├── index.css          # Estilos base
    ├── style.css          # Estilos adicionales
    ├── components/        # Componentes reutilizables
    │   ├── CargaArchivo.jsx    
    │   ├── Limpieza.jsx
    │   ├── Metricas.jsx
    │   ├── ModeloE.jsx
    │   └── Prediccion.jsx
    ├── pages/             # Páginas principales
    │   ├── Dashboard.jsx
    │   ├── Dashboard.module.css
    │   └── Home.jsx
    ├── constant/          # Constantes de configuración
    │   └── url.js
    └── hooks/             # React Hooks personalizados
```