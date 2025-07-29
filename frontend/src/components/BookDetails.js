import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DetailRow = ({ label, value }) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{value || 'No especificado'}</dd>
    </div>
);

const BookDetails = ({ book }) => {
    const [exemplars, setExemplars] = useState([]);

    useEffect(() => {
        if (book) {
            api.get(`/books/${book._id}/exemplars`).then(res => setExemplars(res.data));
        }
    }, [book]);

    const handleStatusChange = (exemplarId, newStatus) => {
        api.put(`/books/exemplars/${exemplarId}`, { estado: newStatus }).then(res => {
            setExemplars(prev => prev.map(ex => ex._id === exemplarId ? res.data : ex));
        });
    };

    if (!book) return null;

    return (
        <div>
            <dl>
                <DetailRow label="Título" value={book.titulo} />
                <DetailRow label="Autor" value={book.autor} />
                <DetailRow label="Editorial" value={book.editorial} />
                <DetailRow label="Sede" value={book.sede} />
                <DetailRow label="Lugar de Publicación" value={book.lugarPublicacion} />
                <DetailRow label="Año de Publicación" value={book.añoPublicacion} />
                <DetailRow label="Tipo de Documento" value={book.tipoDocumento} />
                <DetailRow label="ISBN" value={book.isbn} />
                <DetailRow label="Edición" value={book.edicion} />
                <DetailRow label="N° de Páginas" value={book.numeroPaginas} />
                <DetailRow label="Idioma" value={book.idioma} />
                <DetailRow label="País" value={book.pais} />
                <DetailRow label="CDD" value={book.cdd} />
                <DetailRow label="Ubicación en Estantería" value={book.ubicacionEstanteria} />
                <DetailRow label="Descriptores" value={(book.descriptores || []).join(', ')} />
            </dl>
            <h4 className="mt-6 mb-2 font-bold dark:text-white">Ejemplares Individuales</h4>
            <div className="max-h-48 overflow-y-auto">
                {exemplars.map(ex => (
                    <div key={ex._id} className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                        <span className="dark:text-gray-300">Copia N° {ex.numeroCopia}</span>
                        <select value={ex.estado} onChange={(e) => handleStatusChange(ex._id, e.target.value)} className="px-2 py-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="disponible">Disponible</option>
                            <option value="prestado">Prestado</option>
                            <option value="deteriorado">Deteriorado</option>
                            <option value="extraviado">Extraviado</option>
                        </select>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookDetails;