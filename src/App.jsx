import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/public/Home";
import Error404 from "./pages/public/Error404";
import Login from "./pages/public/Login";
import Registro from "./pages/public/Registro";
import FooterPublic from "./components/public/FooterPublic";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminPrivateRoutes from "./routes/AdminPrivateRoutes";
import PublicRoute from "./routes/PublicRoute";

import EmpleadoLayout from "./pages/private/empleado/EmpleadoLayout";
import DashboardEmpleado from "./pages/private/empleado/DashboardEmpleado";
import EvaluacionesEmpleado from "./pages/private/empleado/EvaluacionesEmpleado";
import PerfilEmpleado from "./pages/private/empleado/PerfilEmpleado";
import CheckinEmpleado from "./pages/private/empleado/CheckinEmpleado";
import MetasEmpleado from "./pages/private/empleado/MetasEmpleado";

import AdminLayout from "./pages/private/admin/AdminLayout";
import DashboardAdmin from "./pages/private/admin/DashboardAdmin";
import Empleados from "./pages/private/admin/Empleados";
import Empleado from "./pages/private/admin/Empleado";
import FormularioEmpleado from "./pages/private/admin/FormularioEmpleado";
import FormularioEvaluacion from "./pages/private/admin/FormularioEvaluacion";
import ComparacionEmpleados from "./pages/private/admin/ComparacionEmpleados";
import GestionMetas from "./pages/private/admin/GestionMetas";
import GestionProyectos from "./pages/private/admin/GestionProyectos";

function App() {
  return (
    <Router>
      <div className="flex min-h-[90vh] flex-col justify-between bg-slate-50 font-sans text-slate-900">
        <div>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
            </Route>

            <Route element={<AdminPrivateRoutes />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardAdmin />} />
                <Route path="empleados" element={<Empleados />} />
                <Route
                  path="empleados/nuevo"
                  element={<FormularioEmpleado />}
                />
                <Route
                  path="empleados/editar/:id"
                  element={<FormularioEmpleado />}
                />
                <Route path="empleados/:id" element={<Empleado />} />
                <Route
                  path="empleados/:id/evaluar"
                  element={<FormularioEvaluacion />}
                />
                <Route
                  path="empleados/comparar"
                  element={<ComparacionEmpleados />}
                />
                <Route path="metas" element={<GestionMetas />} />
                <Route path="proyectos" element={<GestionProyectos />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/empleado" element={<EmpleadoLayout />}>
                <Route index element={<DashboardEmpleado />} />
                <Route
                  path="evaluaciones"
                  element={<EvaluacionesEmpleado />}
                />
                <Route path="perfil" element={<PerfilEmpleado />} />
                <Route path="checkin" element={<CheckinEmpleado />} />
                <Route path="metas" element={<MetasEmpleado />} />
              </Route>
            </Route>

            <Route path="*" element={<Error404 />} />
          </Routes>
        </div>

        <FooterPublic />
      </div>
    </Router>
  );
}

export default App;