import "../styles/modelselector.css";

interface ModelSelectorProps {
  algorithm: string;
  onChange: (value: string) => void;
}

export default function ModelSelector({
  algorithm,
  onChange,
}: ModelSelectorProps) {
  const algorithms = [
    {
      value: "kmeans",
      label: "K-Means",
      description:
        "Algoritmo de clustering clásico que agrupa datos en K clusters basándose en la distancia euclidiana",
      icon: "🎯",
    },
    {
      value: "hierarchical",
      label: "Clustering Jerárquico",
      description:
        "Construye una jerarquía de clusters agrupando datos de forma iterativa",
      icon: "🌳",
    },
    {
      value: "dbscan",
      label: "DBSCAN",
      description:
        "Algoritmo basado en densidad que puede encontrar clusters de forma arbitraria",
      icon: "🔍",
    },
  ];

  return (
    <div className="model-selector-container">
      <h2>🤖 Selección de Algoritmo</h2>
      <p className="selector-description">
        Elija el algoritmo de clustering que mejor se adapte a sus necesidades
      </p>

      <div className="algorithm-cards">
        {algorithms.map((algo) => (
          <div
            key={algo.value}
            className={`algorithm-card ${
              algorithm === algo.value ? "selected" : ""
            }`}
            onClick={() => onChange(algo.value)}
          >
            <div className="card-icon">{algo.icon}</div>
            <h3>{algo.label}</h3>
            <p>{algo.description}</p>
            {algorithm === algo.value && (
              <div className="selected-badge">✓ Seleccionado</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
