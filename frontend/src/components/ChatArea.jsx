import React, { useState, useRef, useEffect } from 'react';
import InputArea from './InputArea';
import { motion, AnimatePresence } from 'framer-motion';

const ChatArea = ({ isSidebarOpen, toggleSidebar, currentChatId, onChatCreated }) => {
    const [messages, setMessages] = useState([]);
    const [chatTitle, setChatTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState({ id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash', provider: 'gemini' });
    const messagesEndRef = useRef(null);
    const userId = 'test-user';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        const fetchChatHistory = async () => {
            if (!currentChatId) {
                setMessages([]);
                setChatTitle('Nuevo Chat');
                return;
            }

            setIsLoading(true);
            try {
                const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
                const response = await fetch(`${apiUrl}/api/chat?userId=${userId}&chatId=${currentChatId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.messages) setMessages(data.messages);
                    if (data.title) setChatTitle(data.title);
                }
            } catch (error) {
                console.error('Error fetching chat history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChatHistory();
    }, [currentChatId, userId]);

    const handleSend = async (text, selectedTool = null, file = null) => {
        if (!text.trim() && !file) return;

        let fileData = null;
        if (file) {
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            fileData = {
                name: file.name,
                type: file.type,
                data: base64
            };
        }

        const newMessage = {
            role: 'user',
            content: text,
            file: fileData
        };
        setMessages(prev => [...prev, newMessage]);
        setIsLoading(true);

        try {
            const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

            const response = await fetch(`${apiUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, newMessage],
                    userId,
                    model: selectedModel,
                    chatId: currentChatId,
                    tool: selectedTool || undefined,
                    file: fileData,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);

            if (data.title) setChatTitle(data.title);
            if (!currentChatId && data.chatId) onChatCreated(data.chatId);

        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#202123] relative">
            <div className="sticky top-0 z-10 flex items-center p-2 text-gray-200 bg-[#202123] border-b border-black/10">
                {!isSidebarOpen && (
                    <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-900/10 mr-2">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                    </button>
                )}
                <div className="flex-1 text-center font-normal text-sm">{chatTitle || selectedModel.name}</div>
                <div className="w-8"></div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col pb-32 pt-4">
                    <AnimatePresence mode="popLayout">
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="w-full group text-gray-800 dark:text-gray-100"
                            >
                                <div className={`max-w-3xl mx-auto flex gap-4 p-4 md:p-6 text-base ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <div className="relative flex-1 overflow-hidden break-words">
                                        <div className={`font-bold mb-1 opacity-90 ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                                            {msg.role === 'assistant' ? selectedModel.name : 'Usuario'}
                                        </div>
                                        {msg.file && msg.file.type.startsWith('image/') && (
                                            <div className={`mb-3 ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                                                <img
                                                    src={msg.file.data}
                                                    alt={msg.file.name}
                                                    className="max-w-xs rounded-lg border border-gray-600 shadow-md inline-block"
                                                />
                                            </div>
                                        )}
                                        <div className={`prose prose-invert max-w-none leading-7 ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {isLoading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                                <div className="max-w-3xl mx-auto flex gap-4 p-4 md:p-6 flex-row-reverse">
                                    <div className="flex items-center justify-end w-full">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1 delay-75"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#202123] via-[#202123] to-transparent pt-10 pb-6">
                <div className="max-w-3xl mx-auto px-4">
                    <InputArea onSend={handleSend} disabled={isLoading} selectedModel={selectedModel} onModelChange={setSelectedModel} />
                    <div className="text-center text-xs text-gray-400 mt-2">
                        Vista Previa de Investigación Gratuita. ChatGPT puede producir información inexacta sobre personas, lugares o hechos.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatArea;
