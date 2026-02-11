import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* 1. Header Fijo arriba */}
      <div className="fixed-top" style={{ zIndex: 1030 }}>
        <Header />
      </div>

      <div className="d-flex flex-grow-1" style={{ marginTop: "56px" }}> 
        {/* El marginTop debe coincidir con la altura de tu Header */}

        {/* 2. Sidebar Fijo a la izquierda */}
        <aside className="sticky-top" style={{ height: "calc(100vh - 56px)", top: "56px" }}>
          <Sidebar />
        </aside>

        {/* 3. Contenido con Scroll independiente */}
        <main className="flex-grow-1 d-flex flex-column shadow-sm bg-light" style={{ overflowY: "auto" }}>
          <div className="p-4 flex-grow-1">
            <Outlet />
          </div>
          
          {/* Footer siempre al final del contenido */}
          {/* <Footer /> */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;