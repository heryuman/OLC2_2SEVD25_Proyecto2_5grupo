import { useEffect, useMemo, useState } from "react";
import "../styles/evaluacion.css";
import { API_BASE_URL } from "../constant/url";

type MetricKey = "Silhouette" | "Calinski-Harabasz" | "Davies-Bouldin" | "Inercia";

type MetricSet = Record<MetricKey, number>;

interface StatsData {
  clientes: MetricSet;
  reseñas: MetricSet;
}

type MessageType = "info" | "success" | "error";

type Quality = "excelente" | "buena" | "aceptable" | "deficiente";

export default function Evaluacion() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: MessageType; text: string } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/model/stats`);
      const json = await response.json();

      if (json?.success && json?.data) {
        setStats(json.data as StatsData);
        setMessage({ type: "success", text: json.message || "Métricas cargadas" });
        setLastUpdated(new Date().toLocaleString());
      } else {
        setMessage({ type: "error", text: json?.message || "No se pudieron obtener las métricas" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Error conectando con el servidor" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const metricInfo: Array<{
    key: MetricKey;
    title: string;
    description: string;
    target: string;
    invert?: boolean;
  }> = useMemo(
    () => [
      {
        key: "Silhouette",
        title: "Silhouette",
        description: "Rango [-1, 1]. > 0.5 indica segmentos bien separados.",
        target: "Mayor es mejor",
      },
      {
        key: "Calinski-Harabasz",
        title: "Calinski-Harabasz",
        description: "Mayor puntaje = clusters más compactos y separados.",
        target: "Mayor es mejor",
      },
      {
        key: "Davies-Bouldin",
        title: "Davies-Bouldin",
        description: "Mide solapamiento de clusters. < 1 suele ser bueno.",
        target: "Menor es mejor",
        invert: true,
      },
      {
        key: "Inercia",
        title: "Inercia",
        description: "Suma de distancias internas. Útil para comparar entre runs.",
        target: "Menor es mejor",
        invert: true,
      },
    ],
    []
  );

  const qualityBadge = (key: MetricKey, value: number): Quality => {
    if (key === "Silhouette") {
      if (value >= 0.6) return "excelente";
      if (value >= 0.5) return "buena";
      if (value >= 0.35) return "aceptable";
      return "deficiente";
    }
    if (key === "Davies-Bouldin") {
      if (value < 0.6) return "excelente";
      if (value < 0.9) return "buena";
      if (value < 1.5) return "aceptable";
      return "deficiente";
    }
    if (key === "Calinski-Harabasz") {
      if (value >= 300) return "excelente";
      if (value >= 200) return "buena";
      if (value >= 100) return "aceptable";
      return "deficiente";
    }
    // Inercia: difícil de comparar absoluta; usamos heurística relativa
    if (value <= 0) return "deficiente";
    return value < 1000 ? "buena" : value < 5000 ? "aceptable" : "deficiente";
  };

  const renderMetricCard = (title: string, set: MetricSet) => (
    <div className="metric-cards">
      {metricInfo.map((metric) => {
        const value = set[metric.key];
        const badge = qualityBadge(metric.key, value);
        const badgeClass = `badge ${badge}`;
        return (
          <div className="metric-card" key={`${title}-${metric.key}`}>
            <div className="metric-card-header">
              <div>
                <p className="metric-name">{metric.title}</p>
                <p className="metric-target">{metric.target}</p>
              </div>
              <span className={badgeClass}>{badge}</span>
            </div>
            <div className="metric-value">{value ?? "-"}</div>
            <p className="metric-description">{metric.description}</p>
          </div>
        );
      })}
    </div>
  );

  const isEmpty = (set: MetricSet | undefined) => {
    if (!set) return true;
    return Object.values(set).every((v) => v === 0 || v === null || v === undefined);
  };

  return (
    <div className="evaluacion-container">
      <div className="evaluacion-header">
        <h1>📈 Evaluación y Métricas del Modelo</h1>
        <p>
          Consulta las métricas internas del clustering para clientes y reseñas. Usa estos
          indicadores para validar la separación y cohesión de los segmentos descubiertos.
        </p>
        <div className="header-actions">
          <button className="btn-refresh" onClick={fetchStats} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar métricas"}
          </button>
          {lastUpdated && <span className="timestamp">Última actualización: {lastUpdated}</span>}
        </div>
      </div>

      {message && <div className={`alert ${message.type}`}>{message.text}</div>}

      <div className="panels">
        <div className="panel">
          <div className="panel-title">
            <span>👥 Clientes</span>
            {isEmpty(stats?.clientes) && <small className="warning">Entrena el modelo para ver datos</small>}
          </div>
          {stats?.clientes ? renderMetricCard("clientes", stats.clientes) : <div className="empty">Sin datos</div>}
        </div>

        <div className="panel">
          <div className="panel-title">
            <span>💬 Reseñas</span>
            {isEmpty(stats?.reseñas) && <small className="warning">Entrena el modelo para ver datos</small>}
          </div>
          {stats?.reseñas ? renderMetricCard("reseñas", stats.reseñas) : <div className="empty">Sin datos</div>}
        </div>
      </div>

      <div className="notes">
        <h3>📌 Cómo interpretar</h3>
        <ul>
          <li><strong>Silhouette:</strong> &gt; 0.5 indica buena separación. Valores negativos significan clusters superpuestos.</li>
          <li><strong>Calinski-Harabasz:</strong> Mayor es mejor; compara densidad intra-cluster vs inter-cluster.</li>
          <li><strong>Davies-Bouldin:</strong> Menor es mejor; mide solapamiento. Cerca de 0 es ideal.</li>
          <li><strong>Inercia:</strong> Menor es mejor, pero úsalas para comparar corridas con el mismo K.</li>
        </ul>
      </div>
    </div>
  );
}
