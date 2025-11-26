import React, { useState } from 'react';
import ModelSelector from './ModelSelector';

const InputArea = ({ onSend, onModelChange, selectedModel }) => {
    const [input, setInput] = useState('');

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

    return (
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#202123] via-[#202123] to-transparent pt-10 pb-6 px-4">
            <div className="relative flex h-full flex-1 items-stretch md:flex-col max-w-3xl mx-auto">
                <div className="flex flex-col w-full relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-[#2A2B32] rounded-xl shadow-md">
                    {/* Barra superior con selector de modelo */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-black/10 dark:border-gray-700/50">
                        {onModelChange && (
                            <ModelSelector onModelChange={onModelChange} selectedModel={selectedModel} />
                        )}
                        <div className="flex items-center gap-2">
                            <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg">
                                    <line x1="3" y1="3" x2="21" y2="3"></line>
                                    <line x1="3" y1="12" x2="21" y2="12"></line>
                                    <line x1="3" y1="21" x2="21" y2="21"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    {/* Área de input */}
                    <div className="relative py-3 pl-4">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        tabIndex={0}
                        data-id="root"
                        style={{ maxHeight: '200px', height: '24px', overflowY: 'hidden' }}
                        rows={1}
                        placeholder="Send a message..."
                        className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0"
                    ></textarea>
                    <button
                        onClick={handleSend}
                        className="absolute p-1 rounded-md bg-[#2A2B32] dark:bg-[#2A2B32] text-[#2A2B32] dark:text-[#2A2B32] bottom-1.5 right-1 md:bottom-2.5 md:right-2 hover:opacity-80 disabled:hover:opacity-100 disabled:opacity-50"
                        disabled={!input.trim()}
                    >
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
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
