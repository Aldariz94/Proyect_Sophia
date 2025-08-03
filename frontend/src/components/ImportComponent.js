import React, { useState } from 'react';
import api from '../services/api';

const ImportComponent = ({ importType, onImportSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setResult({ msg: 'Por favor, selecciona un archivo de Excel.', errors: 'No se seleccionó ningún archivo.' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        setLoading(true);

        try {
            const response = await api.post(`/import/${importType}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResult(response.data);
            if (response.data.successCount > 0) {
                onImportSuccess();
            }
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData) {
                setResult(errorData);
            } else {
                setResult({ msg: 'Error de red al subir el archivo.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const getTemplateUrl = () => {
        switch (importType) {
            case 'users':
                return '/templates/plantilla_usuarios.xlsx';
            case 'books':
                return '/templates/plantilla_libros.xlsx';
            case 'resources':
                return '/templates/plantilla_recursos.xlsx';
            default:
                return '#';
        }
    };

    const renderInstructions = () => {
        let requiredFields = '';
        switch (importType) {
            case 'users':
                requiredFields = 'primerNombre, primerApellido, rut, correo, password, rol.';
                break;
            case 'books':
                requiredFields = 'titulo, autor, editorial, lugarPublicacion, añoPublicacion, sede, cantidadEjemplares.';
                break;
            case 'resources':
                requiredFields = 'nombre, categoria, sede, cantidadInstancias.';
                break;
            default:
                return null;
        }
        return (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md border dark:border-gray-700">
                <p className="font-bold mb-1">Columnas Obligatorias:</p>
                <p>{requiredFields}</p>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    El archivo debe tener las columnas correctas. Descarga la plantilla para ver un ejemplo.
                    <strong className="text-red-500"> Recuerda borrar la fila de ejemplo antes de subir tu archivo.</strong>
                </p>
                <a 
                    href={getTemplateUrl()} 
                    download 
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                    Descargar Plantilla de {importType === 'users' ? 'Usuarios' : importType === 'books' ? 'Libros' : 'Recursos'}
                </a>
                {renderInstructions()}
            </div>

            <input 
                type="file" 
                onChange={handleFileChange} 
                accept=".xlsx, .xls"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            
            <button 
                onClick={handleUpload} 
                disabled={!file || loading}
                className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
            >
                {loading ? 'Procesando...' : 'Importar Datos'}
            </button>

            {result && (
                <div className={`mt-4 p-4 rounded-md text-sm ${result.errors || result.msg.startsWith('Error') ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-green-100 dark:bg-green-900'}`}>
                    <p className={`font-semibold ${result.errors || result.msg.startsWith('Error') ? 'text-yellow-800 dark:text-yellow-200' : 'text-green-800 dark:text-green-200'}`}>
                        {result.msg}
                    </p>
                    {result.errors && (
                        <pre className="mt-2 text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap font-sans">{result.errors}</pre>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImportComponent;