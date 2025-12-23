import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CargaMasiva from "./pages/CargaMasiva";
/*import Ajuste from "./pages/Ajuste";
import Evaluacion from "./pages/Evaluacion";
import Prediccion from "./pages/Prediccion";*/

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<CargaMasiva />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
