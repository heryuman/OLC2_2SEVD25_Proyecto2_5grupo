import { useState } from "react";
import ConfigPanel from "../components/ConfigPanel";
import "../styles/ajuste.css";
import { API_BASE_URL } from "../constant/url";

type MessageType = "success" | "error" | "info" | null;

interface ClusterConfig {
  cluster: number;
  random_state: number;
  max_iter: number;
}

export default function Ajuste() {
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<MessageType>(null);
  const [isTraining, setIsTraining] = useState(false);

  const [configClientes, setConfigClientes] = useState<ClusterConfig>({
    cluster: 3,
    random_state: 42,
    max_iter: 300,
  });

  const [configReseñas, setConfigReseñas] = useState<ClusterConfig>({
    cluster: 3,
    random_state: 42,
    max_iter: 300,
  });

  const showMessage = (msg: string, type: MessageType) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType(null);
    }, 5000);
  };

  const handleConfigClientesChange = (key: string, value: any) => {
    setConfigClientes((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleConfigReseñasChange = (key: string, value: any) => {
    setConfigReseñas((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const entrenarModelo = async () => {
    setIsTraining(true);
    try {
      const payload = {
        hyperparameters: {
          clientes: configClientes,
          reseñas: configReseñas,
        },
      };

      const response = await fetch(`${API_BASE_URL}/api/model/set_stats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage(
          `✅ Modelo entrenado exitosamente. Clientes: ${configClientes.cluster} clusters, Reseñas: ${configReseñas.cluster} clusters`,
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
    setConfigClientes({
      cluster: 3,
      random_state: 42,
      max_iter: 300,
    });
    setConfigReseñas({
      cluster: 3,
      random_state: 42,
      max_iter: 300,
    });
    showMessage("⚙️ Configuración restablecida", "info");
  };

  return (
    <div className="ajuste-container">
      

      {message && (
        <div className={`message-box ${messageType}`}>
          <span>{message}</span>
        </div>
      )}

      <div className="ajuste-content">
        

        <ConfigPanel
          title="Configuración de Clientes"
          config={configClientes}
          onChange={handleConfigClientesChange}
        />

        <ConfigPanel
          title="Configuración de Reseñas"
          config={configReseñas}
          onChange={handleConfigReseñasChange}
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
          <div className="config-summary-grid">
            <div className="config-section">
              <h4>👥 Clientes</h4>
              <div className="config-item">
                <span className="label">Clusters:</span>
                <span className="value">{configClientes.cluster}</span>
              </div>
              <div className="config-item">
                <span className="label">Random State:</span>
                <span className="value">{configClientes.random_state}</span>
              </div>
              <div className="config-item">
                <span className="label">Max Iteraciones:</span>
                <span className="value">{configClientes.max_iter}</span>
              </div>
            </div>
            <div className="config-section">
              <h4>💬 Reseñas</h4>
              <div className="config-item">
                <span className="label">Clusters:</span>
                <span className="value">{configReseñas.cluster}</span>
              </div>
              <div className="config-item">
                <span className="label">Random State:</span>
                <span className="value">{configReseñas.random_state}</span>
              </div>
              <div className="config-item">
                <span className="label">Max Iteraciones:</span>
                <span className="value">{configReseñas.max_iter}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
