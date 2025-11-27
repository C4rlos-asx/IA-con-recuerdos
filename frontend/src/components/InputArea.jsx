import React, { useState, useRef, useEffect } from 'react';
import ModelSelector from './ModelSelector';

const MODEL_TOOLS = {
    // GPT-3.5 Turbo: Solo texto, sin herramientas multimodales
    'gpt-3.5-turbo': [
        { id: 'code_interpreter', name: 'Intérprete de Código' },
        { id: 'function_calling', name: 'Llamadas a Funciones' }
    ],

    // GPT-4: Modelo anterior, sin generación de imágenes nativa
    'gpt-4': [
        { id: 'vision', name: 'Análisis de Imágenes' },
        { id: 'code_interpreter', name: 'Intérprete de Código' },
        { id: 'function_calling', name: 'Llamadas a Funciones' },
        { id: 'browsing', name: 'Navegación Web' }
    ],

    // GPT-4o: TIENE generación de imágenes nativa integrada
    'gpt-4o': [
        { id: 'image_generation', name: 'Generación de Imágenes Nativa' },
        { id: 'vision', name: 'Análisis de Imágenes y Video' },
        { id: 'code_interpreter', name: 'Intérprete de Código' },
        { id: 'function_calling', name: 'Llamadas a Funciones' },
        { id: 'real_time_voice', name: 'Voz en Tiempo Real' }
    ],

    // GPT-4o Mini: NO genera imágenes, solo las analiza
    'gpt-4o-mini': [
        { id: 'vision', name: 'Análisis de Imágenes' },
        { id: 'code_interpreter', name: 'Intérprete de Código' },
        { id: 'function_calling', name: 'Llamadas a Funciones' }
    ],

    // Gemini 2.0 Flash: Velocidad y multimodalidad
    'gemini-2.0-flash': [
        { id: 'vision', name: 'Análisis Multimodal' },
        { id: 'code_execution', name: 'Ejecución de Código' },
        { id: 'search', name: 'Búsqueda de Google' },
        { id: 'long_context', name: 'Contexto Extendido' }
    ],

    // Gemini 2.5 Pro: Modelo más potente
    'gemini-2.5-pro': [
        { id: 'vision', name: 'Análisis Multimodal Avanzado' },
        { id: 'code_execution', name: 'Ejecución de Código' },
        { id: 'search', name: 'Búsqueda de Google' },
        { id: 'long_context', name: 'Contexto Extendido' },
        { id: 'function_calling', name: 'Llamadas a Funciones' }
    ],

    // Gemini Pro Latest: Versión estable
    'gemini-pro-latest': [
        { id: 'vision', name: 'Análisis Multimodal' },
        { id: 'search', name: 'Búsqueda de Google' }
    ],

    // Gemini 2.5 Flash Vision: Especializado en imágenes
    'gemini-2.5-flash-image-preview': [
        { id: 'vision', name: 'Análisis de Imágenes Avanzado' },
        { id: 'search', name: 'Búsqueda de Google' }
    ]
};

const InputArea = ({ onSend, onModelChange, selectedModel }) => {
    const [input, setInput] = useState('');
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const [selectedTool, setSelectedTool] = useState(null);
    const [attachedFile, setAttachedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const fileInputRef = useRef(null);

    const currentTools = selectedModel && selectedModel.id && MODEL_TOOLS[selectedModel.id]
        ? MODEL_TOOLS[selectedModel.id]
        : [];

    // Reset selected tool when model changes
    useEffect(() => {
        setSelectedTool(null);
    }, [selectedModel?.id]);

    const selectTool = (toolId) => {
        // Toggle: if clicking the same tool, deselect it
        setSelectedTool(prev => prev === toolId ? null : toolId);
    };

    const handleSend = () => {
        if (input.trim() || attachedFile) {
            onSend(input, selectedTool, attachedFile);
            setInput('');
            removeAttachedFile();
            // Reset textarea height
            const textarea = document.querySelector('textarea[data-id="root"]');
            if (textarea) textarea.style.height = '24px';
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachedFile(file);

            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreview(null);
            }
        }
    };

    const removeAttachedFile = () => {
        setAttachedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        const iconColors = {
            pdf: 'text-red-500',
            doc: 'text-blue-500',
            docx: 'text-blue-500',
            xls: 'text-green-500',
            xlsx: 'text-green-500',
            txt: 'text-gray-400',
            zip: 'text-yellow-500',
            rar: 'text-yellow-500',
        };
        return iconColors[ext] || 'text-gray-500';
    };

    return (
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#202123] via-[#202123] to-transparent pt-10 pb-6 px-4">
            <div className="relative flex h-full flex-1 items-stretch md:flex-col max-w-3xl mx-auto">
                {/* File Preview */}
                {attachedFile && (
                    <div className="mb-2 p-3 bg-[#40414F] rounded-lg border border-gray-600 flex items-center gap-3">
                        {filePreview ? (
                            // Image preview
                            <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-700 flex-shrink-0">
                                <img
                                    src={filePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            // File icon for non-images
                            <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <svg
                                    className={`w-8 h-8 ${getFileIcon(attachedFile.name)}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium truncate">{attachedFile.name}</p>
                            <p className="text-xs text-gray-400">
                                {(attachedFile.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                        <button
                            onClick={removeAttachedFile}
                            className="p-1.5 hover:bg-gray-600 rounded transition-colors flex-shrink-0"
                            title="Eliminar archivo"
                        >
                            <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="flex flex-col w-full relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-[#40414F] rounded-xl shadow-md overflow-visible">
                    {/* Barra superior con selector de modelo y herramientas */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-black/10 dark:border-gray-700/50">
                        <div className="flex items-center gap-4">
                            {onModelChange && (
                                <ModelSelector onModelChange={onModelChange} selectedModel={selectedModel} />
                            )}

                            {/* Tools Dropdown */}
                            {currentTools.length > 0 && (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsToolsOpen(!isToolsOpen)}
                                        className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        <span className="flex items-center gap-1">
                                            {selectedTool
                                                ? currentTools.find(t => t.id === selectedTool)?.name || 'Herramientas'
                                                : 'Herramientas'
                                            }
                                        </span>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {isToolsOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setIsToolsOpen(false)}
                                            />
                                            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-[#202123] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 py-2 overflow-hidden">
                                                <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                                    Selecciona una herramienta
                                                </div>
                                                {currentTools.map((tool) => {
                                                    const isSelected = selectedTool === tool.id;
                                                    return (
                                                        <button
                                                            key={tool.id}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A2B32] transition-colors flex items-center justify-between gap-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                selectTool(tool.id);
                                                            }}
                                                        >
                                                            <span className="flex items-center gap-2 flex-1">
                                                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected
                                                                    ? 'border-blue-500'
                                                                    : 'border-gray-400 dark:border-gray-600'
                                                                    }`}>
                                                                    {isSelected && (
                                                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                                    )}
                                                                </span>
                                                                {tool.name}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Área de input */}
                    <div className="relative flex items-end py-3 pl-4 pr-12">
                        {/* File Attachment Button */}
                        <button
                            onClick={handleFileClick}
                            className="p-2 mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            title="Adjuntar archivo"
                        >
                            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                            </svg>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        <textarea
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                            }}
                            onKeyDown={handleKeyDown}
                            tabIndex={0}
                            data-id="root"
                            style={{ maxHeight: '200px', height: input ? 'auto' : '24px', overflowY: input.split('\n').length > 8 ? 'auto' : 'hidden' }}
                            rows={1}
                            placeholder="Envía un mensaje..."
                            className="m-0 w-full resize-none border-0 bg-transparent p-0 focus:ring-0 focus-visible:ring-0 dark:bg-transparent leading-6"
                        ></textarea>

                        <button
                            onClick={handleSend}
                            className="absolute p-1.5 rounded-md bg-[#19c37d] text-white bottom-2.5 right-3 hover:bg-[#1a885d] disabled:bg-transparent disabled:text-gray-400 transition-colors"
                            disabled={!input.trim()}
                        >
                            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div className="px-3 pt-2 text-center text-xs text-gray-400 md:px-4 md:pt-3">
                <span>ChatGPT puede cometer errores. Considera verificar la información importante.</span>
            </div>
        </div>
    );
};

export default InputArea;
