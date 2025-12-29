import { useState } from "react";
import ConfigPanel from "../components/ConfigPanel";
import ModelSelector from "../components/ModelSelector";
import "../styles/ajuste.css";
import { API_BASE_URL } from "../constant/url";

type MessageType = "success" | "error" | "info" | null;

interface ModelConfig {
  algorithm: string;
  n_clusters: number;
  max_iterations: number;
  tolerance: number;
  random_state: number;
  init_method: string;
}

export default function Ajuste() {
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<MessageType>(null);
  const [isTraining, setIsTraining] = useState(false);

  const [config, setConfig] = useState<ModelConfig>({
    algorithm: "kmeans",
    n_clusters: 3,
    max_iterations: 300,
    tolerance: 0.0001,
    random_state: 42,
    init_method: "k-means++",
  });

  const showMessage = (msg: string, type: MessageType) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType(null);
    }, 5000);
  };

  const handleConfigChange = (key: keyof ModelConfig, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const entrenarModelo = async () => {
    setIsTraining(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/model/train`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();
      
      if (data.status === "success") {
        showMessage(
          `✅ Modelo entrenado exitosamente con ${config.n_clusters} clusters`,
          "success"
        );
      } else {
        showMessage(`❌ Error: ${data.message}`, "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("❌ Error conectando con el servidor", "error");
    } finally {
      setIsTraining(false);
    }
  };

  const resetConfig = () => {
    setConfig({
      algorithm: "kmeans",
      n_clusters: 3,
      max_iterations: 300,
      tolerance: 0.0001,
      random_state: 42,
      init_method: "k-means++",
    });
    showMessage("⚙️ Configuración restablecida", "info");
  };

  return (
    <div className="ajuste-container">
      <div className="ajuste-header">
        <h1>⚙️ Configuración y Ajuste del Modelo</h1>
        <p className="ajuste-subtitle">
          Configure los parámetros del modelo de clustering para segmentar sus
          clientes y reseñas
        </p>
      </div>

      {message && (
        <div className={`message-box ${messageType}`}>
          <span>{message}</span>
        </div>
      )}

      <div className="ajuste-content">
        <ModelSelector
          algorithm={config.algorithm}
          onChange={(value) => handleConfigChange("algorithm", value)}
        />

        <ConfigPanel
          config={config}
          onChange={handleConfigChange}
          algorithm={config.algorithm}
        />

        <div className="actions-panel">
          <button
            className="btn-train"
            onClick={entrenarModelo}
            disabled={isTraining}
          >
            {isTraining ? (
              <>
                <span className="spinner"></span> Entrenando modelo...
              </>
            ) : (
              <>🚀 Entrenar Modelo</>
            )}
          </button>

          <button className="btn-reset" onClick={resetConfig}>
            🔄 Restablecer Configuración
          </button>
        </div>

        <div className="info-panel">
          <h3>📋 Configuración Actual</h3>
          <div className="config-summary">
            <div className="config-item">
              <span className="label">Algoritmo:</span>
              <span className="value">{config.algorithm.toUpperCase()}</span>
            </div>
            <div className="config-item">
              <span className="label">Número de Clusters:</span>
              <span className="value">{config.n_clusters}</span>
            </div>
            <div className="config-item">
              <span className="label">Iteraciones Máximas:</span>
              <span className="value">{config.max_iterations}</span>
            </div>
            <div className="config-item">
              <span className="label">Tolerancia:</span>
              <span className="value">{config.tolerance}</span>
            </div>
            <div className="config-item">
              <span className="label">Random State:</span>
              <span className="value">{config.random_state}</span>
            </div>
            <div className="config-item">
              <span className="label">Método de Inicialización:</span>
              <span className="value">{config.init_method}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
