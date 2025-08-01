// frontend/src/components/MobileSidebar.js
import React from 'react';

const MobileSidebar = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Fondo oscuro semitransparente */}
            <div 
                className="absolute inset-0 bg-black opacity-50" 
                onClick={onClose}
            ></div>
            
            {/* Contenido del Sidebar */}
            <div className="relative h-full">
                {children}
            </div>
        </div>
    );
};

export default MobileSidebar;