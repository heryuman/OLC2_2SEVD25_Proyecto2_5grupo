import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../styles/reporte.css";


type SegmentoCliente = {
  antiguedad_cliente_meses: number;
  dias_desde_ultima_compra: number;
  frecuencia_compra: number;
  monto_promedio_compra: number;
  monto_total_gastado: number;
  numero_productos_distintos: number;
  segmento_cliente: number;
};

type TemaResena = {
  tema_id: number;
  aspecto_inferido: string;
  descripcion: string;
  palabras_clave: string[];
};

export default function Reporte() {
  const [segmentos, setSegmentos] = useState<SegmentoCliente[]>([]);
  const [metricasClientes, setMetricasClientes] = useState<any>({});
  const [metricasResenas, setMetricasResenas] = useState<any>({});
  const [temas, setTemas] = useState<TemaResena[]>([]);

  const dashboardRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    fetch("http://localhost:5000/api/model/report")
      .then((res) => res.json())
      .then((data) => {
        setSegmentos(data.info_clientes.data_segmentos);
        setMetricasClientes(data.info_clientes.metricas);
        setMetricasResenas(data.info_reseñas.metricas);
        setTemas(Object.values(data.info_reseñas.descripcion));
      })
      .catch((err) => console.error(err));
  }, []);

const descargarPDF = async () => {
  if (!dashboardRef.current) return;

  const element = dashboardRef.current;

  // Forzar fondo oscuro
  const originalBg = element.style.backgroundColor;
  element.style.backgroundColor = "#2b2b2b";

  await new Promise((r) => setTimeout(r, 300));

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#2b2b2b",
    useCORS: true,
    scrollY: -window.scrollY,
  });

  element.style.backgroundColor = originalBg;

  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Relación px → mm
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pageHeightPx = (canvas.width * pageHeight) / pageWidth;

  let renderedHeight = 0;
  let pageNumber = 0;

  while (renderedHeight < canvas.height) {
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = Math.min(pageHeightPx, canvas.height - renderedHeight);

    const ctx = pageCanvas.getContext("2d")!;
    ctx.drawImage(
      canvas,
      0,
      renderedHeight,
      canvas.width,
      pageCanvas.height,
      0,
      0,
      canvas.width,
      pageCanvas.height
    );

    const imgData = pageCanvas.toDataURL("image/png");

    if (pageNumber > 0) pdf.addPage();

    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      imgWidth,
      (pageCanvas.height * imgWidth) / pageCanvas.width
    );

    renderedHeight += pageHeightPx;
    pageNumber++;
  }

  pdf.save("reporte-dashboard.pdf");
};


  return (
    <div className="reporte-container" ref={dashboardRef}>
      <h2>Reporte de Análisis</h2>

      {/* ================= CLIENTES ================= */}
      <h3>Segmentación de Clientes</h3>

      <table className="reporte-table">
        <thead>
          <tr>
            <th>Segmento</th>
            <th>Antigüedad (meses)</th>
            <th>Días última compra</th>
            <th>Frecuencia</th>
            <th>Monto promedio</th>
            <th>Monto total</th>
            <th># Productos</th>
          </tr>
        </thead>
        <tbody>
          {segmentos.map((s) => (
            <tr key={s.segmento_cliente}>
              <td>{s.segmento_cliente}</td>
              <td>{s.antiguedad_cliente_meses.toFixed(2)}</td>
              <td>{s.dias_desde_ultima_compra.toFixed(2)}</td>
              <td>{s.frecuencia_compra.toFixed(2)}</td>
              <td>{s.monto_promedio_compra.toFixed(2)}</td>
              <td>{s.monto_total_gastado.toFixed(2)}</td>
              <td>{s.numero_productos_distintos.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= MÉTRICAS CLIENTES ================= */}
      <h3>Métricas de Clustering (Clientes)</h3>

      <div className="metricas-grid">
        {Object.entries(metricasClientes).map(([k, v]) => (
          <div key={k} className="metrica-card">
            <strong>{k}</strong>
            <p>{v}</p>
          </div>
        ))}
      </div>

      {/* ================= RESEÑAS ================= */}
      <h3>Análisis de Reseñas</h3>

      <div className="temas-grid">
        {temas.map((t) => (
          <div key={t.tema_id} className="tema-card">
            <h4>Tema {t.tema_id}: {t.aspecto_inferido}</h4>
            <p>{t.descripcion}</p>

            <div className="keywords">
              {t.palabras_clave.map((p, i) => (
                <span key={i} className="keyword">{p}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ================= MÉTRICAS RESEÑAS ================= */}
      <h3>Métricas de Clustering (Reseñas)</h3>

      <div className="metricas-grid">
        {Object.entries(metricasResenas).map(([k, v]) => (
          <div key={k} className="metrica-card">
            <strong>{k}</strong>
            <p>{v}</p>
          </div>
        ))}
      </div>

      <div className="btn-container">
        <button className="btn-download" onClick={descargarPDF}>
        Descargar PDF
        </button>

      </div>
    </div>
  );
}
