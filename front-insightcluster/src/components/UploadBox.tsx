import "../styles/uploadbox.css";

type Props = {
  onFileSelected: (file: File) => void;
};

export default function UploadBox({ onFileSelected }: Props) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file); // <--- enviamos el archivo al padre
      alert("Archivo cargado: " + file.name);
    }
  };

  return (
    <label className="upload-container">
      <input type="file" hidden onChange={handleFileChange} />
      <div className="upload-box">
        <span className="icon">☁️⬆️</span>
        <p>Subir archivo</p>
      </div>
    </label>
  );
}
