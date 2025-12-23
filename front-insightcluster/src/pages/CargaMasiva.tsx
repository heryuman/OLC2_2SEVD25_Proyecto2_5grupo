import { useState } from "react";
import UploadBox from "../components/UploadBox";
import "../styles/cargamasiva.css";

export default function CargaMasiva() {
  const [file, setFile] = useState<File | null>(null);

  const limpiarDatos = async () => {
    const response= await fetch("http://localhost:5000/api/estudiantes/limpieza",{
      method:"GET"
    });

  const data =await response.json();
    if (data.status=='success'){
      alert("Limpieza realizada con éxito");
    }

  };

    const entrenarModelo = async () => {
  

    try{
      const response= await fetch("http://localhost:5000/api/model/",{
        method:"GET",

      });

      const data = await response.json();

      console.log(data);
      if(data.success===true){
        alert("Se entrenó el modelo correctamente");
      }
    }
    catch(err){
      console.error(err);
    }
  };

  const subirArchivo = async () => {
    if (!file) {
      alert("Primero selecciona un archivo");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/file/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log(data)
      console.log(data.mensaje);
      console.log(data.riesgo);
      alert("Archivo subido con éxito");
    } catch (err) {
      console.error(err);
      alert("Error enviando archivo");
    }
  };

  return (
    <div className="carga-container">
      <h2>Carga Masiva</h2>

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
