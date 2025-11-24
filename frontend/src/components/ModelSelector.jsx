import React, { useState, useRef, useEffect } from 'react';

const ModelSelector = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showSubmenu, setShowSubmenu] = useState(false);
    const [selectedModel, setSelectedModel] = useState('GPT-5.1');
    const [selectedType, setSelectedType] = useState('Auto');
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
                setShowSubmenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMainOptionClick = (type) => {
        setSelectedType(type);
        setIsOpen(false);
    };

    const handleSubOptionClick = (model) => {
        setSelectedModel(model);
        setSelectedType('Auto'); // Reset type or handle as needed
        setIsOpen(false);
        setShowSubmenu(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                className="flex items-center gap-2 text-lg font-semibold text-gray-200 hover:bg-[#2A2B32] px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>ChatGPT <span className="text-gray-400">5.1</span></span>
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-[300px] bg-[#202123] border border-white/10 rounded-xl shadow-xl overflow-visible z-30 text-white p-1">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                        GPT-5.1
                    </div>

                    <div
                        className="flex items-center justify-between px-3 py-2.5 hover:bg-[#2A2B32] rounded-md cursor-pointer group"
                        onClick={() => handleMainOptionClick('Auto')}
                    >
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Auto</span>
                            <span className="text-xs text-gray-400">Decide cuánto tiempo pensar</span>
                        </div>
                        {selectedType === 'Auto' && <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>

                    <div
                        className="flex items-center justify-between px-3 py-2.5 hover:bg-[#2A2B32] rounded-md cursor-pointer group"
                        onClick={() => handleMainOptionClick('Instant')}
                    >
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Instant</span>
                            <span className="text-xs text-gray-400">Respuestas al instante</span>
                        </div>
                        {selectedType === 'Instant' && <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>

                    <div
                        className="flex items-center justify-between px-3 py-2.5 hover:bg-[#2A2B32] rounded-md cursor-pointer group"
                        onClick={() => handleMainOptionClick('Thinking')}
                    >
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Thinking</span>
                            <span className="text-xs text-gray-400">Piensa más, responde mejor</span>
                        </div>
                        {selectedType === 'Thinking' && <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>

                    <div className="h-px bg-white/10 my-1 mx-2"></div>

                    <div
                        className="flex items-center justify-between px-3 py-2.5 hover:bg-[#2A2B32] rounded-md cursor-pointer relative"
                        onMouseEnter={() => setShowSubmenu(true)}
                        onMouseLeave={() => setShowSubmenu(false)}
                    >
                        <span className="text-sm font-medium">Modelos anteriores</span>
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg"><polyline points="9 18 15 12 9 6"></polyline></svg>

                        {showSubmenu && (
                            <div className="absolute top-0 left-full ml-2 w-[200px] bg-[#202123] border border-white/10 rounded-xl shadow-xl overflow-hidden z-40 p-1">
                                <div
                                    className="px-3 py-2.5 hover:bg-[#2A2B32] rounded-md cursor-pointer text-sm font-medium"
                                    onClick={(e) => { e.stopPropagation(); handleSubOptionClick('GPT-5 Instant'); }}
                                >
                                    GPT-5 Instant
                                </div>
                                <div
                                    className="px-3 py-2.5 hover:bg-[#2A2B32] rounded-md cursor-pointer text-sm font-medium"
                                    onClick={(e) => { e.stopPropagation(); handleSubOptionClick('GPT-5 Thinking'); }}
                                >
                                    GPT-5 Thinking
                                </div>
                                <div
                                    className="px-3 py-2.5 hover:bg-[#2A2B32] rounded-md cursor-pointer text-sm font-medium"
                                    onClick={(e) => { e.stopPropagation(); handleSubOptionClick('GPT-4o'); }}
                                >
                                    GPT-4o
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModelSelector;
