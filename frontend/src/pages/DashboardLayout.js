import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import UserManagementPage from "./UserManagementPage";
import BookManagementPage from "./BookManagementPage";
import ResourceManagementPage from "./ResourceManagementPage";
import LoanManagementPage from "./LoanManagementPage";
import SanctionsPage from "./SanctionsPage";
import ReservationsPage from "./ReservationsPage";
import ReportsPage from "./ReportsPage";
import DashboardPage from "./DashboardPage";
import InventoryManagementPage from "./InventoryManagementPage";
import Footer from "../components/Footer";
import MobileSidebar from "../components/MobileSidebar"; // Importa el nuevo componente
import { Bars3Icon } from "@heroicons/react/24/outline";

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
    setIsMobileMenuOpen(false); // Cierra el menú al navegar
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Menú para pantallas grandes (oculto en móviles) */}
      <div className="hidden md:block">
        <Sidebar onNavigate={handleNavigate} currentPage={currentPage} />
      </div>

      {/* Menú para pantallas pequeñas (móviles) */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      >
        <Sidebar
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

export default DashboardLayout;
