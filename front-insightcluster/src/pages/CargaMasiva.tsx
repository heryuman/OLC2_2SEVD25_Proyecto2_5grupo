import { useState } from "react";
import UploadBox from "../components/UploadBox";
import "../styles/cargamasiva.css";
import { API_BASE_URL } from "../constant/url";

type MessageType = "success" | "error" | null;

export default function CargaMasiva() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<MessageType>(null);

  const showMessage = (msg: string, type: MessageType) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType(null);
    }, 5000);
  };

  const limpiarDatos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/file/limpieza`, {
        method: "GET",
      });

      const data = await response.json();
      if (data.status === "success") {
        showMessage(
          `✅ Limpieza realizada con éxito. Filas procesadas: ${data.rows}`,
          "success"
        );
      } else {
        showMessage(`❌ Error en la limpieza: ${data.message}`, "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("❌ Error conectando con el servidor", "error");
    }
  };

  const entrenarModelo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/model/`, {
        method: "GET",
      });

      const data = await response.json();
      console.log(data);
      if (data.success === true) {
        showMessage("✅ Se entrenó el modelo correctamente", "success");
      } else {
        showMessage("❌ Error al entrenar el modelo", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("❌ Error conectando con el servidor", "error");
    }
  };

  const subirArchivo = async () => {
    if (!file) {
      showMessage("⚠️ Primero selecciona un archivo", "error");
      return;
    }

    // Validar que sea un archivo .csv
    if (!file.name.endsWith(".csv")) {
      showMessage(
        "❌ Solo se permiten archivos .csv. El archivo debe tener extensión .csv",
        "error"
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/file/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        showMessage(
          `✅ Archivo "${file.name}" subido con éxito`,
          "success"
        );
        setFile(null);
      } else {
        showMessage(
          `❌ Error al subir archivo: ${data.error || "Error desconocido"}`,
          "error"
        );
      }
    } catch (err) {
      console.error(err);
      showMessage("❌ Error enviando archivo al servidor", "error");
    }
  };

  return (
    <div className="carga-container">
      <h2>Carga Masiva</h2>

      {message && (
        <div className={`message-box message-${messageType}`}>
          {message}
        </div>
      )}

      <div className="carga-content">
        {/* le mandamos a UploadBox la función para guardar el archivo */}
        <UploadBox onFileSelected={setFile} />

        <div className="botones">
          <button onClick={subirArchivo}>Cargar Archivo</button>
          <button onClick={limpiarDatos}>Limpiar datos</button>
          <button onClick={entrenarModelo}>Entrenar modelo</button>
        </div>
      </div>
    </div>
  );
}
