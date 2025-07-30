import React, { useState } from 'react';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // CAMBIO: Importación corregida

const courseList = [
    "Pre-Kínder", "Kínder", "1° Básico", "2° Básico", "3° Básico", "4° Básico",
    "5° Básico", "6° Básico", "7° Básico", "8° Básico", "1° Medio", "2° Medio",
    "3° Medio", "4° Medio"
];

const ReportsPage = () => {
    const [filters, setFilters] = useState({
        startDate: '', endDate: '', status: '', course: '', role: '', bookTitle: ''
    });
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [bookSearch, setBookSearch] = useState('');
    const [bookResults, setBookResults] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleBookSearch = async (e) => {
        const query = e.target.value;
        setBookSearch(query);
        setSelectedBook(null);
        if (query.length > 2) {
            const res = await api.get(`/search/all-books?q=${query}`);
            setBookResults(res.data);
        } else {
            setBookResults([]);
        }
    };

    const selectBook = (book) => {
        setSelectedBook(book);
        setBookSearch(book.titulo);
        setBookResults([]);
    };

    const handleGenerateReport = async () => {
        setLoading(true);
        setError('');
        setReportData([]);
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.status) params.append('status', filters.status);
            if (filters.course) params.append('course', filters.course);
            if (filters.role) params.append('role', filters.role);
            if (selectedBook) params.append('bookId', selectedBook._id);

            const response = await api.get(`/reports/loans?${params.toString()}`);
            setReportData(response.data);
        } catch (err) {
            setError('Error al generar el reporte.');
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Reporte de Préstamos - Biblioteca Proyect Sophia", 14, 16);
        
        const tableColumn = ["Usuario", "Ítem Prestado", "Fecha Préstamo", "Vencimiento", "Estado"];
        const tableRows = reportData.map(loan => [
            `${loan.usuarioId?.primerNombre || ''} ${loan.usuarioId?.primerApellido || ''}`,
            loan.itemDetails?.name || 'N/A',
            new Date(loan.fechaInicio).toLocaleDateString('es-CL'),
            new Date(loan.fechaVencimiento).toLocaleDateString('es-CL'),
            loan.estado,
        ]);

        // CAMBIO: Se usa autoTable como una función
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        const date = new Date().toISOString().split('T')[0];
        doc.save(`Reporte_Prestamos_${date}.pdf`);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Generar Reportes</h1>
            
            <div className="mt-6 p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* ... (filtros sin cambios) ... */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Inicio</label>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Fin</label>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                     <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por Libro (Opcional)</label>
                        <input type="text" value={bookSearch} onChange={handleBookSearch} placeholder="Escribe para buscar un libro..." className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        {bookResults.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-600">
                                {bookResults.map(book => (
                                    <li key={book._id} onClick={() => selectBook(book)} className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white">
                                        {book.titulo}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rol de Usuario</label>
                        <select name="role" value={filters.role} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="">Todos</option>
                            <option value="alumno">Alumno</option>
                            <option value="profesor">Profesor</option>
                            <option value="personal">Personal</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Curso (solo alumnos)</label>
                        <select name="course" value={filters.course} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={filters.role && filters.role !== 'alumno'}>
                            <option value="">Todos los Cursos</option>
                            {courseList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado del Préstamo</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="">Todos</option>
                            <option value="enCurso">En Curso</option>
                            <option value="devuelto">Devuelto</option>
                            <option value="atrasado">Atrasado</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button onClick={handleGenerateReport} className="px-6 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                        {loading ? 'Generando...' : 'Generar Reporte'}
                    </button>
                </div>
            </div>

            {reportData.length > 0 && (
                <div className="mt-8 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Resultados del Reporte</h2>
                    <button onClick={handleExportPDF} className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                        Exportar a PDF
                    </button>
                </div>
            )}

            <div className="mt-4 overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Ítem Prestado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Fecha Préstamo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Vencimiento</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {reportData.length > 0 ? (
                            reportData.map(loan => (
                                <tr key={loan._id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{loan.usuarioId?.primerNombre} {loan.usuarioId?.primerApellido}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{loan.itemDetails?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{new Date(loan.fechaInicio).toLocaleDateString('es-CL')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{new Date(loan.fechaVencimiento).toLocaleDateString('es-CL')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${loan.estado === 'atrasado' ? 'bg-red-100 text-red-800' : loan.estado === 'devuelto' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{loan.estado}</span></td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    {error || "Aplica los filtros y presiona 'Generar Reporte' para ver los resultados."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportsPage;