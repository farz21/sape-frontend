import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importaciones de páginas públicas
import Home from './pages/public/Home';
import Error404 from './pages/public/Error404';

// Importaciones futuras que hará Tomás
// import Login from './pages/public/Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* === RUTAS PÚBLICAS === */}
        <Route path="/" element={<Home />} />
        
        {/* Tomás descomentará esto cuando cree el Login.jsx */}
        {/* <Route path="/login" element={<Login />} /> */}

        {/* === RUTAS PRIVADAS (Próximamente) === */}
        {/* Acá configuraremos Zustand más adelante para proteger el Dashboard */}

        {/* Ruta Comodín (Error 404 modularizado) */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
}

export default App;