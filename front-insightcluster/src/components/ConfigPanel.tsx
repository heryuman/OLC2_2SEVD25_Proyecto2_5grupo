import "../styles/configpanel.css";

interface ConfigPanelProps {
  config: {
    n_clusters: number;
    max_iterations: number;
    tolerance: number;
    random_state: number;
    init_method: string;
  };
  onChange: (key: string, value: any) => void;
  algorithm: string;
}

export default function ConfigPanel({
  config,
  onChange,
  algorithm,
}: ConfigPanelProps) {
  const initMethods = ["k-means++", "random", "manual"];

  return (
    <div className="config-panel-container">
      <h2>🎛️ Parámetros del Modelo</h2>
      <p className="panel-description">
        Ajuste los parámetros para optimizar el rendimiento del modelo
      </p>

      <div className="config-grid">
        {/* Número de Clusters */}
        <div className="config-field">
          <label htmlFor="n_clusters">
            <span className="label-icon">📊</span>
            Número de Clusters (K)
          </label>
          <div className="input-with-info">
            <input
              type="number"
              id="n_clusters"
              min="2"
              max="20"
              value={config.n_clusters}
              onChange={(e) =>
                onChange("n_clusters", parseInt(e.target.value))
              }
              className="config-input"
            />
            <span className="input-info">
              Cantidad de grupos en los que se dividirán los datos
            </span>
          </div>
        </div>

        {/* Iteraciones Máximas */}
        <div className="config-field">
          <label htmlFor="max_iterations">
            <span className="label-icon">🔄</span>
            Iteraciones Máximas
          </label>
          <div className="input-with-info">
            <input
              type="number"
              id="max_iterations"
              min="50"
              max="1000"
              step="50"
              value={config.max_iterations}
              onChange={(e) =>
                onChange("max_iterations", parseInt(e.target.value))
              }
              className="config-input"
            />
            <span className="input-info">
              Número máximo de veces que se repetirá el algoritmo
            </span>
          </div>
        </div>

        {/* Tolerancia */}
        <div className="config-field">
          <label htmlFor="tolerance">
            <span className="label-icon">⚖️</span>
            Tolerancia de Convergencia
          </label>
          <div className="input-with-info">
            <input
              type="number"
              id="tolerance"
              min="0.00001"
              max="0.01"
              step="0.00001"
              value={config.tolerance}
              onChange={(e) =>
                onChange("tolerance", parseFloat(e.target.value))
              }
              className="config-input"
            />
            <span className="input-info">
              Criterio de parada cuando el cambio es menor a este valor
            </span>
          </div>
        </div>

        {/* Random State */}
        <div className="config-field">
          <label htmlFor="random_state">
            <span className="label-icon">🎲</span>
            Semilla Aleatoria (Random State)
          </label>
          <div className="input-with-info">
            <input
              type="number"
              id="random_state"
              min="0"
              max="999"
              value={config.random_state}
              onChange={(e) =>
                onChange("random_state", parseInt(e.target.value))
              }
              className="config-input"
            />
            <span className="input-info">
              Controla la reproducibilidad de los resultados
            </span>
          </div>
        </div>

        {/* Método de Inicialización (solo para K-Means) */}
        {algorithm === "kmeans" && (
          <div className="config-field">
            <label htmlFor="init_method">
              <span className="label-icon">🎯</span>
              Método de Inicialización
            </label>
            <div className="input-with-info">
              <select
                id="init_method"
                value={config.init_method}
                onChange={(e) => onChange("init_method", e.target.value)}
                className="config-select"
              >
                {initMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
              <span className="input-info">
                Estrategia para seleccionar los centroides iniciales
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="recommendations-box">
        <h4>💡 Recomendaciones</h4>
        <ul>
          <li>
            Para conjuntos de datos grandes, use entre 3-8 clusters inicialmente
          </li>
          <li>K-means++ suele dar mejores resultados que inicialización aleatoria</li>
          <li>
            Aumente las iteraciones si el modelo no converge adecuadamente
          </li>
          <li>
            Una tolerancia menor (0.0001) garantiza mayor precisión pero más
            tiempo de entrenamiento
          </li>
        </ul>
      </div>
    </div>
  );
}
