import React, { useState, useRef, useEffect } from 'react';

const ModelSelector = ({ onModelChange, selectedModel: propSelectedModel }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalSelectedModel, setInternalSelectedModel] = useState({
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'gemini'
    });

    // Usar el modelo del prop si existe, sino usar el interno
    const selectedModel = propSelectedModel || internalSelectedModel;
    const menuRef = useRef(null);

    const models = {
        gemini: [
            {
                id: 'gemini-2.0-flash',
                name: 'Gemini 2.0 Flash',
                description: 'Nueva generación - Velocidad extrema',
                provider: 'gemini'
            },
            {
                id: 'gemini-2.5-pro',
                name: 'Gemini 2.5 Pro',
                description: 'Modelo más potente y capaz',
                provider: 'gemini'
            },
            {
                id: 'gemini-pro-latest',
                name: 'Gemini Pro Latest',
                description: 'Última versión estable de Pro',
                provider: 'gemini'
            },
            {
                id: 'gemini-2.5-flash-image-preview',
                name: 'Gemini 2.5 Flash Vision',
                description: 'Especializado en análisis de imágenes',
                provider: 'gemini'
            },
        ],
        openai: [
            {
                id: 'gpt-3.5-turbo',
                name: 'GPT-3.5 Turbo',
                description: 'Gratis - Rápido y económico',
                provider: 'openai'
            },
            {
                id: 'gpt-4o-mini',
                name: 'GPT-4o Mini',
                description: 'Gratis - Versión optimizada de GPT-4',
                provider: 'openai'
            },
            {
                id: 'gpt-4o',
                name: 'GPT-4o',
                description: 'Más capaz (requiere créditos)',
                provider: 'openai'
            },
        ]
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleModelSelect = (model) => {
        const modelData = {
            id: model.id,
            name: model.name,
            provider: model.provider
        };
        setInternalSelectedModel(modelData);
        setIsOpen(false);
        if (onModelChange) {
            onModelChange(modelData);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-gray-100 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{selectedModel?.name || 'Gemini 2.0 Flash'}</span>
                <svg
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-[280px] bg-[#1f1f23] border border-gray-700/50 rounded-lg shadow-2xl overflow-hidden z-50 text-white">
                    <div className="p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400 mb-1">
                            Elige tu modelo
                        </div>

                        {/* Gemini Models */}
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                            Gemini
                        </div>
                        {models.gemini.map((model) => {
                            const isSelected = selectedModel?.id === model.id;
                            return (
                                <div
                                    key={model.id}
                                    className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                                    onClick={() => handleModelSelect(model)}
                                >
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-sm font-medium text-gray-100">{model.name}</span>
                                        <span className="text-xs text-gray-400 mt-0.5">{model.description}</span>
                                    </div>
                                    {isSelected && (
                                        <svg
                                            stroke="currentColor"
                                            fill="none"
                                            strokeWidth="2.5"
                                            viewBox="0 0 24 24"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-4 w-4 text-blue-400 flex-shrink-0 ml-2"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                </div>
                            );
                        })}

                        <div className="h-px bg-gray-700/50 my-2 mx-2"></div>

                        {/* OpenAI Models */}
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                            OpenAI
                        </div>
                        {models.openai.map((model) => {
                            const isSelected = selectedModel?.id === model.id;
                            return (
                                <div
                                    key={model.id}
                                    className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                                    onClick={() => handleModelSelect(model)}
                                >
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-sm font-medium text-gray-100">{model.name}</span>
                                        <span className="text-xs text-gray-400 mt-0.5">{model.description}</span>
                                    </div>
                                    {isSelected && (
                                        <svg
                                            stroke="currentColor"
                                            fill="none"
                                            strokeWidth="2.5"
                                            viewBox="0 0 24 24"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-4 w-4 text-blue-400 flex-shrink-0 ml-2"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModelSelector;
