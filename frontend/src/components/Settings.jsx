import React, { useState, useEffect } from 'react';

const Settings = ({ onClose }) => {
    const [openaiKey, setOpenaiKey] = useState('');
    const [geminiKey, setGeminiKey] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load keys from localStorage
        const savedOpenaiKey = localStorage.getItem('openai_api_key') || '';
        const savedGeminiKey = localStorage.getItem('gemini_api_key') || '';
        setOpenaiKey(savedOpenaiKey);
        setGeminiKey(savedGeminiKey);
    }, []);

    const handleSave = () => {
        localStorage.setItem('openai_api_key', openaiKey);
        localStorage.setItem('gemini_api_key', geminiKey);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleClearKeys = () => {
        localStorage.removeItem('openai_api_key');
        localStorage.removeItem('gemini_api_key');
        setOpenaiKey('');
        setGeminiKey('');
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#202123] text-white">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center p-4 border-b border-gray-700">
                <button
                    onClick={onClose}
                    className="p-2 rounded-md hover:bg-gray-700 mr-3 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-semibold">Configuración</h1>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-2xl mx-auto space-y-8">
                    {/* API Keys Section */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                Claves API
                            </h2>
                            <p className="text-sm text-gray-400 mb-6">
                                Configura tus propias claves API para OpenAI y Google Gemini. Las claves se guardan localmente en tu navegador.
                            </p>
                        </div>

                        {/* OpenAI API Key */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                OpenAI API Key
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={openaiKey}
                                    onChange={(e) => setOpenaiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="w-full px-4 py-3 bg-[#40414F] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Obtén tu clave en{' '}
                                <a
                                    href="https://platform.openai.com/api-keys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 underline"
                                >
                                    platform.openai.com/api-keys
                                </a>
                            </p>
                        </div>

                        {/* Gemini API Key */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Google Gemini API Key
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    placeholder="AIza..."
                                    className="w-full px-4 py-3 bg-[#40414F] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Obtén tu clave en{' '}
                                <a
                                    href="https://makersuite.google.com/app/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 underline"
                                >
                                    makersuite.google.com/app/apikey
                                </a>
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleSave}
                                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {saved ? '✓ Guardado' : 'Guardar Claves'}
                            </button>
                            <button
                                onClick={handleClearKeys}
                                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Limpiar
                            </button>
                        </div>

                        {/* Info Alert */}
                        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div className="text-sm">
                                    <p className="font-medium text-yellow-200 mb-1">Seguridad y Privacidad</p>
                                    <p className="text-yellow-300/80">
                                        Tus claves API se almacenan únicamente en tu navegador (localStorage) y nunca se envían a nuestros servidores.
                                        Se utilizan directamente para hacer llamadas a las APIs de OpenAI y Gemini.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
