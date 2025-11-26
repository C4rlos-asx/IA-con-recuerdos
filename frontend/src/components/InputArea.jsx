import React, { useState, useRef } from 'react';
import ModelSelector from './ModelSelector';

const MODEL_TOOLS = {
    'gpt-3.5-turbo': [
        { id: 'dalle', name: 'Image Creation with DALL-E' },
        { id: 'code_interpreter', name: 'Code Interpreter' },
        { id: 'browsing', name: 'Web Browsing' }
    ],
    'gpt-4': [
        { id: 'dalle', name: 'Image Creation with DALL-E 3' },
        { id: 'sora', name: 'Video Creation with Sora' },
        { id: 'analysis', name: 'Advanced Data Analysis' }
    ],
    'gemini-pro': [
        { id: 'imagen', name: 'Generate Images' },
        { id: 'banana', name: 'Nano Banana' },
        { id: 'search', name: 'Google Search' }
    ]
};

const InputArea = ({ onSend, onModelChange, selectedModel }) => {
    const [input, setInput] = useState('');
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const fileInputRef = useRef(null);

    const currentTools = selectedModel ? (MODEL_TOOLS[selectedModel.id] || []) : [];

    const handleSend = () => {
        if (input.trim()) {
            onSend(input);
            setInput('');
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
        if (e.target.files && e.target.files[0]) {
            console.log('File selected:', e.target.files[0]);
            // Here you would handle the file upload logic
        }
    };

    return (
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#202123] via-[#202123] to-transparent pt-10 pb-6 px-4">
            <div className="relative flex h-full flex-1 items-stretch md:flex-col max-w-3xl mx-auto">
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
                                        Tools
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
                                            <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-[#202123] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
                                                {currentTools.map((tool) => (
                                                    <button
                                                        key={tool.id}
                                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A2B32] transition-colors flex items-center gap-2"
                                                        onClick={() => {
                                                            console.log('Tool selected:', tool.name);
                                                            setIsToolsOpen(false);
                                                        }}
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                        {tool.name}
                                                    </button>
                                                ))}
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
                            title="Attach file"
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
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            tabIndex={0}
                            data-id="root"
                            style={{ maxHeight: '200px', height: '24px', overflowY: 'hidden' }}
                            rows={1}
                            placeholder="Send a message..."
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
                <span>ChatGPT can make mistakes. Consider checking important information.</span>
            </div>
        </div>
    );
};

export default InputArea;
