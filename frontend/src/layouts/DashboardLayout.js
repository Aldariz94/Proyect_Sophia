import React, { useState } from "react";
import { Sidebar, Footer, MobileSidebar } from "../components"; // <-- Esta importación ya usa el barril de components
import { Bars3Icon } from "@heroicons/react/24/outline";

// --- ESTA ES LA SECCIÓN CORREGIDA ---
// Ahora importamos todas las páginas desde el barril de la carpeta 'pages'
// La ruta '../pages' sube un nivel desde 'layouts' y luego entra a 'pages'
import {
  UserManagementPage,
  BookManagementPage,
  ResourceManagementPage,
  LoanManagementPage,
  SanctionsPage,
  ReservationsPage,
  ReportsPage,
  DashboardPage,
  InventoryManagementPage,
} from "../pages";

const DashboardLayout = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "usuarios":
        return <UserManagementPage />;
      case "libros":
        return <BookManagementPage />;
      case "recursos":
        return <ResourceManagementPage />;
      case "prestamos":
        return <LoanManagementPage />;
      case "reservas":
        return <ReservationsPage />;
      case "sanciones":
        return <SanctionsPage />;
      case "inventario":
        return <InventoryManagementPage />;
      case "reportes":
        return <ReportsPage />;
      case "dashboard":
      default:
        return <DashboardPage />;
    }
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="hidden md:flex">
        <Sidebar onNavigate={handleNavigate} currentPage={currentPage} />
      </div>

      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      >
        <Sidebar
          onNavigate={handleNavigate}
          currentPage={currentPage}
          onCloseRequest={() => setIsMobileMenuOpen(false)}
        />
      </MobileSidebar>

      <div className="flex flex-col flex-1 overflow-x-hidden">
        <header className="md:hidden p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
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

export default DashboardLayout;