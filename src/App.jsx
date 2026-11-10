import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Páginas públicas
import Home from "./pages/public/Home";
import Error404 from "./pages/public/Error404";
import Login from "./pages/public/Login";
import Registro from "./pages/public/Registro";

// Seguridad
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminPrivateRoutes from "./routes/AdminPrivateRoutes";

// Empleado
import EmpleadoLayout from "./pages/private/empleado/EmpleadoLayout";
import DashboardEmpleado from "./pages/private/empleado/DashboardEmpleado";
import EvaluacionesEmpleado from "./pages/private/empleado/EvaluacionesEmpleado";
import PerfilEmpleado from "./pages/private/empleado/PerfilEmpleado";

// Administrador
import AdminLayout from "./pages/private/admin/AdminLayout";
import Dashboard from "./pages/private/admin/Dashboard";
import Empleados from "./pages/private/admin/Empleados";
import Empleado from "./pages/private/admin/Empleado";

function App() {
  return (
    <Router>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* RUTAS DEL ADMINISTRADOR */}
        <Route element={<AdminPrivateRoutes />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="empleados" element={<Empleados />} />
            <Route path="empleados/:id" element={<Empleado />} />
          </Route>
        </Route>

        {/* RUTAS DEL EMPLEADO */}
        <Route element={<ProtectedRoute />}>
          <Route path="/empleado" element={<EmpleadoLayout />}>
            <Route index element={<DashboardEmpleado />} />
            <Route path="/empleado/evaluaciones" element={<EvaluacionesEmpleado />} />
            <Route path="/empleado/perfil" element={<PerfilEmpleado />} />
          </Route>
        </Route>

        {/* RUTA NO ENCONTRADA */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
}

export default App;
