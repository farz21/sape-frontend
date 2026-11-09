import NavbarPublic from './NavbarPublic';

const HeaderPublic = () => {
  return (
    <header className="w-full bg-white border-b border-slate-200">
      {/* Si mañana querés un cartelito de "Versión Beta", lo ponés acá arriba */}
      
      {/* Inyectamos el componente Navbar */}
      <NavbarPublic />
    </header>
  );
};

export default HeaderPublic;