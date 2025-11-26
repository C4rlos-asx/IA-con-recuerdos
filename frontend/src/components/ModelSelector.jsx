import React, { useState, useRef, useEffect } from 'react';

const ModelSelector = ({ onModelChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState({
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai'
    });
    const menuRef = useRef(null);

    const models = {
        openai: [
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Gratis - Rápido y económico' },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Gratis - Versión optimizada de GPT-4' },
            { id: 'gpt-4o', name: 'GPT-4o', description: 'Más capaz (requiere créditos)' },
        ],
        gemini: [
            { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash', description: 'Gratis - Respuestas ultrarrápidas' },
            { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro', description: 'Gratis - Contexto extenso, multimodal' },
            { id: 'gemini-pro', name: 'Gemini Pro', description: 'Gratis - Versión estándar' },
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

    const handleModelSelect = (modelId, modelName, provider) => {
        const model = { id: modelId, name: modelName, provider };
        setSelectedModel(model);
        setIsOpen(false);
        if (onModelChange) {
            onModelChange(model);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                className="flex items-center gap-2 text-lg font-semibold text-gray-200 hover:bg-[#2A2B32] px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{selectedModel.name}</span>
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-[320px] bg-[#202123] border border-white/10 rounded-xl shadow-xl overflow-visible z-30 text-white p-1">

                    {/* OpenAI Models */}
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                        OpenAI
                    </div>

                    {models.openai.map((model) => (
                        <div
                            key={model.id}
                            className="flex items-center justify-between px-3 py-2.5 hover:bg-[#2A2B32] rounded-md cursor-pointer group"
                            onClick={() => handleModelSelect(model.id, model.name, 'openai')}
                        >
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{model.name}</span>
                                <span className="text-xs text-gray-400">{model.description}</span>
                            </div>
                            {selectedModel.id === model.id && <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </div>
                    ))}

                    <div className="h-px bg-white/10 my-1 mx-2"></div>

                    {/* Google Gemini Models */}
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                        Google Gemini
                    </div>

                    {models.gemini.map((model) => (
                        <div
                            key={model.id}
                            className="flex items-center justify-between px-3 py-2.5 hover:bg-[#2A2B32] rounded-md cursor-pointer group"
                            onClick={() => handleModelSelect(model.id, model.name, 'gemini')}
                        >
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{model.name}</span>
                                <span className="text-xs text-gray-400">{model.description}</span>
                            </div>
                            {selectedModel.id === model.id && <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ModelSelector;
