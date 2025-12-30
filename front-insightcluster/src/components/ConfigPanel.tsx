import "../styles/configpanel.css";

interface ConfigPanelProps {
  title: string;
  config: {
    cluster: number;
    random_state: number;
    max_iter: number;
  };
  onChange: (key: string, value: any) => void;
}

export default function ConfigPanel({
  title,
  config,
  onChange,
}: ConfigPanelProps) {

  return (
    <div className="config-panel-container">
      <h2>🏛️ {title}</h2>
      <p className="panel-description">
        Ajuste los parámetros para optimizar el rendimiento del modelo K-Means
      </p>

      <div className="config-grid">
        {/* Número de Clusters */}
        <div className="config-field">
          <label htmlFor="cluster">
            <span className="label-icon">📊</span>
            Número de Clusters (K)
          </label>
          <div className="input-with-info">
            <input
              type="number"
              id="cluster"
              min="2"
              max="10"
              step="1"
              value={config.cluster}
              onChange={(e) =>
                onChange("cluster", parseInt(e.target.value))
              }
              className="config-input"
            />
            <span className="input-info">
              Cantidad de grupos (2-10): divide los datos en K segmentos distintos
            </span>
          </div>
        </div>

        {/* Iteraciones Máximas */}
        <div className="config-field">
          <label htmlFor="max_iter">
            <span className="label-icon">🔄</span>
            Iteraciones Máximas
          </label>
          <div className="input-with-info">
            <input
              type="number"
              id="max_iter"
              min="100"
              max="600"
              step="10"
              value={config.max_iter}
              onChange={(e) =>
                onChange("max_iter", parseInt(e.target.value))
              }
              className="config-input"
            />
            <span className="input-info">
              Número máximo de iteraciones (100-600 en pasos de 10)
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
              min="10"
              max="100"
              step="1"
              value={config.random_state}
              onChange={(e) =>
                onChange("random_state", parseInt(e.target.value))
              }
              className="config-input"
            />
            <span className="input-info">
              Rango 10-100. Recomendado: 42 para reproducibilidad óptima
            </span>
          </div>
        </div>
      </div>

      <div className="recommendations-box">
        <h4>💡 Recomendaciones para K-Means</h4>
        <ul>
          <li>
            <strong>Clusters:</strong> Comience con 3-5 clusters
          </li>
          <li>
            <strong>Random State:</strong> Use 42 como valor estándar
          </li>
          <li>
            <strong>Iteraciones:</strong> 300 iteraciones suelen ser suficientes
          </li>
          
        </ul>
      </div>
    </div>
  );
}
