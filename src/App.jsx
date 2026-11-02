import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Páginas Públicas
import Home from "./pages/public/Home";
import Error404 from "./pages/public/Error404";
import Login from "./pages/public/Login";
import Registro from "./pages/public/Registro";

// Privadas y Seguridad
import ProtectedRoute from "./routes/ProtectedRoute";
import EmpleadoLayout from "./components/private/EmpleadoLayout";
import DashboardEmpleado from "./pages/private/DashboardEmpleado";
import EvaluacionesEmpleado from "./pages/private/EvaluacionesEmpleado";
import AdminPrivateRoutes from "./routes/AdminPivateRoutes";
import AdminLayout from "./routes/AdminPivateRoutes"
import Dashboard from "./routes/AdminPivateRoutes"
import Empleados from "./routes/AdminPivateRoutes"
import Empleado from "./routes/AdminPivateRoutes"

function App() {
  return (
    <Router>
      <Routes>
        {/* === RUTAS PÚBLICAS === */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* === RUTAS PRIVADAS === */}
      <Route element={<AdminPrivateRoutes />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="empleados" element={<Empleados />} />
            <Route path="empleados/:id" element={<Empleado />} />
          </Route>
          {/* 2. El Layout envuelve a las páginas con el Navbar de empleado */}
          <Route element={<EmpleadoLayout />}>
            {/* 3. Las vistas específicas */}
            <Route path="/dashboard" element={<DashboardEmpleado />} />
            <Route path="/evaluaciones" element={<EvaluacionesEmpleado />} />
          </Route>
        </Route>

        {/* Ruta Comodín */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
}

export default App;
