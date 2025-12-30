import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CargaMasiva from "./pages/CargaMasiva";
import Ajuste from "./pages/Ajuste";
import Reporte from "./pages/Reporte";

/*import Evaluacion from "./pages/Evaluacion";
import Prediccion from "./pages/Prediccion";*/

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<CargaMasiva />} />
        <Route path="/ajuste" element={<Ajuste />} />
        <Route path="/reporte" element={<Reporte />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
