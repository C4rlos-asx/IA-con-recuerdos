import React, { useState, useRef, useEffect } from 'react';
import InputArea from './InputArea';
import { motion, AnimatePresence } from 'framer-motion';

const ChatArea = ({ isSidebarOpen, toggleSidebar, currentChatId, onChatCreated }) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState({ id: 'gpt-3.5-turbo', name: 'GPT-3.5', provider: 'openai' });
    const messagesEndRef = useRef(null);
    const userId = 'test-user'; // Hardcoded for now

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Fetch chat history when currentChatId changes
    useEffect(() => {
        const fetchChatHistory = async () => {
            if (!currentChatId) {
                setMessages([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat?userId=${userId}&chatId=${currentChatId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.messages) {
                        setMessages(data.messages);
                    }
                }
            } catch (error) {
                console.error('Error fetching chat history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChatHistory();
    }, [currentChatId, userId]);

    const handleSend = async (text) => {
        if (!text.trim()) return;

        const newMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, newMessage]);
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, newMessage],
                    userId,
                    model: selectedModel,
                    chatId: currentChatId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);

            if (!currentChatId && data.chatId) {
                onChatCreated(data.chatId);
            }

        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#202123] relative">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center p-2 text-gray-200 bg-[#202123] border-b border-black/10">
                {!isSidebarOpen && (
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-md hover:bg-gray-900/10 mr-2"
                    >
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                    </button>
                )}
                <div className="flex-1 text-center font-normal text-sm">
                    {selectedModel.name}
                </div>
                <div className="w-8"></div> {/* Spacer for centering */}
            </div>

            {/* Messages Area */}
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
                                className={`w-full group ${msg.role === 'assistant' ? 'bg-[#444654]' : 'bg-[#202123]'
                                    }`}
                            >
                                <div className="max-w-3xl mx-auto flex gap-4 p-4 md:p-6 text-base">
                                    <div className="flex-shrink-0 flex flex-col relative items-end">
                                        <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${msg.role === 'assistant' ? 'bg-green-500' : 'bg-[#5436DA]'
                                            }`}>
                                            {msg.role === 'assistant' ? (
                                                <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12 2.1 12a10.1 10.1 0 0 0 1.6 4.3l8.3-4.3z"></path><path d="M12 12v9.9a10.1 10.1 0 0 0 4.3-1.6l-4.3-8.3z"></path><path d="M12 12 21.9 12a10.1 10.1 0 0 0-1.6-4.3l-8.3 4.3z"></path></svg>
                                            ) : (
                                                <span className="text-white text-xs font-bold">U</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative flex-1 overflow-hidden break-words text-gray-100">
                                        <div className="prose prose-invert max-w-none leading-7">
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full bg-[#444654]"
                            >
                                <div className="max-w-3xl mx-auto flex gap-4 p-4 md:p-6">
                                    <div className="w-8 h-8 bg-green-500 rounded-sm flex items-center justify-center">
                                        <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white animate-pulse" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12 2.1 12a10.1 10.1 0 0 0 1.6 4.3l8.3-4.3z"></path><path d="M12 12v9.9a10.1 10.1 0 0 0 4.3-1.6l-4.3-8.3z"></path><path d="M12 12 21.9 12a10.1 10.1 0 0 0-1.6-4.3l-8.3 4.3z"></path></svg>
                                    </div>
                                    <div className="flex items-center">
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

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#202123] via-[#202123] to-transparent pt-10 pb-6">
                <div className="max-w-3xl mx-auto px-4">
                    <InputArea
                        onSend={handleSend}
                        disabled={isLoading}
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                    />
                    <div className="text-center text-xs text-gray-400 mt-2">
                        Free Research Preview. ChatGPT may produce inaccurate information about people, places, or facts.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatArea;
