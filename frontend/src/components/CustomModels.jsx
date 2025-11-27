import React, { useState, useEffect } from 'react';

const CustomModels = ({ onClose, onCreateChat }) => {
    const [customModels, setCustomModels] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        instructions: '',
        baseModel: { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'gemini' }
    });

    const baseModels = {
        gemini: [
            { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'gemini' },
            { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'gemini' },
            { id: 'gemini-pro-latest', name: 'Gemini Pro Latest', provider: 'gemini' },
            { id: 'gemini-2.5-flash-image-preview', name: 'Gemini 2.5 Flash Vision', provider: 'gemini' },
        ],
        openai: [
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
            { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
        ]
    };

    const userId = 'test-user'; // Hardcoded for now, same as Sidebar

    useEffect(() => {
        loadCustomModels();
    }, []);

    const loadCustomModels = async () => {
        try {
            const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
            const response = await fetch(`${apiUrl}/api/custom-model?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                // Map API response to frontend format if needed
                const mappedModels = data.map(m => ({
                    id: m.id,
                    name: m.name,
                    description: m.description,
                    instructions: m.instructions,
                    baseModel: {
                        id: m.baseModelId,
                        name: m.baseModelName,
                        provider: m.provider
                    },
                    createdAt: m.createdAt
                }));
                setCustomModels(mappedModels);
            }
        } catch (error) {
            console.error('Error loading custom models:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.instructions.trim()) {
            alert('El nombre y las instrucciones son obligatorios');
            return;
        }

        const modelData = {
            userId,
            name: formData.name,
            description: formData.description,
            instructions: formData.instructions,
            baseModelId: formData.baseModel.id,
            baseModelName: formData.baseModel.name,
            provider: formData.baseModel.provider
        };

        try {
            const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
            let response;

            if (editingId) {
                response = await fetch(`${apiUrl}/api/custom-model`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingId, ...modelData })
                });
            } else {
                response = await fetch(`${apiUrl}/api/custom-model`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(modelData)
                });
            }

            if (response.ok) {
                const savedModel = await response.json();

                // If creating new, optionally create a chat
                if (!editingId && onCreateChat) {
                    const chatId = `chat_${savedModel.id}`;
                    // We might need to pass the full model object
                    const fullModel = {
                        id: savedModel.id,
                        name: savedModel.name,
                        description: savedModel.description,
                        instructions: savedModel.instructions,
                        baseModel: {
                            id: savedModel.baseModelId,
                            name: savedModel.baseModelName,
                            provider: savedModel.provider
                        }
                    };
                    onCreateChat(chatId, fullModel);
                }

                loadCustomModels(); // Reload list
                resetForm();
            } else {
                console.error('Error saving model');
            }
        } catch (error) {
            console.error('Error saving custom model:', error);
        }
    };

    const handleEdit = (model) => {
        setFormData({
            name: model.name,
            description: model.description || '',
            instructions: model.instructions,
            baseModel: model.baseModel
        });
        setEditingId(model.id);
        setIsCreating(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este modelo?')) return;

        try {
            const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
            const response = await fetch(`${apiUrl}/api/custom-model?id=${id}&userId=${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadCustomModels();
            }
        } catch (error) {
            console.error('Error deleting custom model:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            instructions: '',
            baseModel: { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'gemini' }
        });
        setIsCreating(false);
        setEditingId(null);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#202123] text-white overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-700">
                <h1 className="text-xl font-semibold">Modelos Personalizados</h1>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {/* Create/Edit Form */}
                {isCreating ? (
                    <div className="bg-[#2A2B32] rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">
                            {editingId ? 'Editar Modelo' : 'Crear Nuevo Modelo'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nombre *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#40414F] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="Ej: Asistente de Código"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Descripción</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#40414F] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="Ej: Especializado en desarrollo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Modelo Base</label>
                                <select
                                    value={formData.baseModel.id}
                                    onChange={(e) => {
                                        const allModels = [
                                            ...baseModels.gemini,
                                            ...baseModels.openai
                                        ];
                                        const selected = allModels.find(m => m.id === e.target.value);
                                        setFormData({ ...formData, baseModel: selected });
                                    }}
                                    className="w-full px-4 py-2 bg-[#40414F] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                                >
                                    <optgroup label="Google Gemini">
                                        {baseModels.gemini.map(model => (
                                            <option key={model.id} value={model.id}>{model.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="OpenAI">
                                        {baseModels.openai.map(model => (
                                            <option key={model.id} value={model.id}>{model.name}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Instrucciones del Sistema *</label>
                                <textarea
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#40414F] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 min-h-[120px]"
                                    placeholder="Ej: Eres un experto programador especializado en JavaScript y React..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#19c37d] hover:bg-[#1a885d] rounded-lg font-medium transition-colors"
                                >
                                    {editingId ? 'Guardar Cambios' : 'Crear Modelo'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="w-full px-4 py-3 bg-[#19c37d] hover:bg-[#1a885d] rounded-lg font-medium transition-colors mb-6 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Crear Nuevo Modelo
                    </button>
                )}

                {/* Models List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold mb-4">Tus Modelos ({customModels.length})</h2>
                    {customModels.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p>No tienes modelos personalizados aún</p>
                            <p className="text-sm mt-2">Crea uno para empezar</p>
                        </div>
                    ) : (
                        customModels.map(model => (
                            <div key={model.id} className="bg-[#2A2B32] rounded-lg p-4 hover:bg-[#2f3038] transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-1">{model.name}</h3>
                                        {model.description && (
                                            <p className="text-sm text-gray-400 mb-2">{model.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span className="px-2 py-1 bg-[#40414F] rounded">
                                                {model.baseModel.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(model)}
                                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(model.id)}
                                            className="p-2 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomModels;
