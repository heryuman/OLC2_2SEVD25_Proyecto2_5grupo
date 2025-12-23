import { Link } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">Insight Cluster</div>

      <div className="menu">
        <Link to="/">Carga Masiva</Link>
        <Link to="/ajuste">Ajuste</Link>
        <Link to="/evaluacion">Evaluación</Link>
        <Link to="/prediccion">Predicción</Link>
      </div>
    </nav>
  );
}
