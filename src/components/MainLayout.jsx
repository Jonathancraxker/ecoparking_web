import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const MainLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebarMobile = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* 1. Header Fijo arriba */}
      <div className="fixed-top" style={{ zIndex: 1030 }}>
        <Header toggleSidebar={toggleSidebar} />
      </div>

      <div className="d-flex flex-grow-1" style={{ marginTop: "56px" }}>
        {/* Fondo oscuro en móvil al abrir el Sidebar (cierra al tocar fuera) */}
        {isMobile && isSidebarOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 1040 }}
            onClick={closeSidebarMobile}
          />
        )}

        {/* 2. Sidebar Fijo a la izquierda con scroll */}
        {isSidebarOpen && (
          <aside
            className={isMobile ? "position-fixed start-0" : "sticky-top"}
            style={{
              height: "calc(100vh - 56px)",
              top: "56px",
              zIndex: isMobile ? 1045 : 1020,
            }}
          >
            <Sidebar closeSidebar={closeSidebarMobile} />
          </aside>
        )}

        {/* 3. Contenido con Scroll independiente */}
        <main
          className="flex-grow-1 d-flex flex-column shadow-sm bg-light"
          style={{ overflowY: "auto", minWidth: 0 }}
        >
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