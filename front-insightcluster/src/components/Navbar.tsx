import { Link } from "react-router-dom";
import {
  UploadOutlined,
  SettingOutlined,
  ExperimentOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import "../styles/navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">Insight Cluster</div>

      <div className="menu">
        <Link to="/">
          <UploadOutlined /> Carga Masiva
        </Link>
        <Link to="/ajuste">
          <SettingOutlined /> Ajuste
        </Link>
        <Link to="/evaluacion">
          <ExperimentOutlined /> Evaluación
        </Link>
        <Link to="/reporte">
          <BulbOutlined /> Reporte
        </Link>
      </div>
    </nav>
  );
}
