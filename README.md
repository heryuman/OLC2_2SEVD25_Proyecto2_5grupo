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

#  2. Elección del Modelo (Pendiente)

> *En esta sección se documentará el análisis comparativo entre modelos
> candidatos, justificación de la selección y métricas iniciales de
> validación.*

------------------------------------------------------------------------

#  3. Decisiones del Modelo (Pendiente)

------------------------------------------------------------------------

#  4. Conclusiones (Pendiente)

------------------------------------------------------------------------

#  5. Decisiones Tomadas Durante el Desarrollo (Pendiente)
