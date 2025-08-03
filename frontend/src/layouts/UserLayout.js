import React, { useState } from "react";
import { UserSidebar, MobileSidebar, Footer } from "../components";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { CatalogPage, MyLoansPage, MyReservationsPage, ReportsPage } from "../pages";


const UserLayout = () => {
  const [currentPage, setCurrentPage] = useState("catalog");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "my-loans":
        return <MyLoansPage />;
      case "my-reservations":
        return <MyReservationsPage />;
      case "reports": // Se añade el caso para reportes
        return <ReportsPage />;
      case "catalog-resources": // Se añade el caso para catálogo de recursos
        return <CatalogPage isUserView={true} itemType="resource" />;
      case "catalog-books": // Se modifica el caso por defecto
      default:
        return <CatalogPage isUserView={true} itemType="book" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Menú para pantallas grandes (oculto en móviles) */}
      <div className="hidden md:block">
        <UserSidebar onNavigate={handleNavigate} currentPage={currentPage} />
      </div>

      {/* Menú para pantallas pequeñas (móviles) */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      >
        <UserSidebar
          onNavigate={handleNavigate}
          currentPage={currentPage}
          onCloseRequest={() => setIsMobileMenuOpen(false)} // <-- AÑADE ESTA LÍNEA
        />
      </MobileSidebar>

      <div className="flex flex-col flex-1">
        {/* Botón para abrir el menú en móviles */}
        <header className="md:hidden p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Bars3Icon className="w-6 h-6 text-gray-800 dark:text-white" />
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-10">{renderPage()}</main>
        <Footer />
      </div>
    </div>
  );
};

export default UserLayout;
