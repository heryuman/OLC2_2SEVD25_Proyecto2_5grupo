# Manual Técnico 
# --- *Procesamiento y Limpieza de Datos para Insight Cluster*

## Participantes

-   **Elder Lopez 201700404**\
-   **Selvin Hernandez 201700603**\
-   **Josue Cux 201700688**

------------------------------------------------------------------------

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

#  3. Decisiones del Modelo (Pendiente)

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

