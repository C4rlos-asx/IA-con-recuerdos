import React, { useState, useRef, useEffect } from 'react';
import InputArea from './InputArea';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatArea = ({ isSidebarOpen, toggleSidebar, currentChatId, onChatCreated, customModel }) => {
    console.log('ChatArea rendered with currentChatId:', currentChatId); // Debug log
    const [messages, setMessages] = useState([]);
    const [chatTitle, setChatTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState({ id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'gemini' });
    const messagesEndRef = useRef(null);
    const userId = 'test-user';

    // Ref to track currentChatId without stale closures
    const chatIdRef = useRef(currentChatId);

    useEffect(() => {
        chatIdRef.current = currentChatId;
        console.log('ChatArea: chatIdRef updated to:', currentChatId);
    }, [currentChatId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        if (customModel) {
            setSelectedModel({
                id: customModel.baseModelId || customModel.baseModel?.id,
                name: customModel.baseModelName || customModel.baseModel?.name,
                provider: customModel.provider || customModel.baseModel?.provider
            });
            setChatTitle(customModel.name);
        }
    }, [customModel]);

    useEffect(() => {
        const fetchChatHistory = async () => {
            if (!currentChatId) {
                setMessages([]);
                setChatTitle(customModel ? customModel.name : 'Nuevo Chat');
                return;
            }

            setIsLoading(true);
            setMessages([]); // Clear messages to prevent glitch when switching chats
            try {
                const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
                const response = await fetch(`${apiUrl}/api/chat?userId=${userId}&chatId=${currentChatId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.messages) setMessages(data.messages);
                    if (data.title) setChatTitle(data.title);

                    // If chat has associated custom model, update the selected model
                    if (data.customModel) {
                        setSelectedModel({
                            id: data.customModel.baseModelId,
                            name: data.customModel.baseModelName,
                            provider: data.customModel.provider
                        });
                        setChatTitle(data.customModel.name);
                    }
                }
            } catch (error) {
                console.error('Error fetching chat history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChatHistory();
    }, [currentChatId, userId, customModel]);

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

            const activeChatId = chatIdRef.current;
            console.log('Sending message with chatId (from ref):', activeChatId); // Debug log

            const response = await fetch(`${apiUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, newMessage],
                    userId,
                    model: selectedModel,
                    chatId: activeChatId,
                    tool: selectedTool || undefined,
                    file: fileData,
                    customInstructions: customModel?.instructions || undefined,
                    customModelId: customModel?.id || undefined,
                    apiKeys: {
                        openai: localStorage.getItem('openai_api_key'),
                        gemini: localStorage.getItem('gemini_api_key')
                    }
                }),
            });

            const data = await response.json();
            console.log('Response data:', data); // Debug log

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.content, modelName: data.modelName }]);

            if (data.title) setChatTitle(data.title);

            console.log('Current Chat ID (ref):', activeChatId); // Debug log
            console.log('New Chat ID from backend:', data.chatId); // Debug log

            if (!activeChatId && data.chatId) {
                console.log('Calling onChatCreated with:', data.chatId); // Debug log
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
                <div className="flex flex-col pb-48 pt-4">
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
                                <div className={`max-w-2xl mx-auto flex gap-4 p-4 md:p-6 text-base mb-6 ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <div className="relative flex-1 overflow-hidden break-words">
                                        <div className={`font-bold mb-1 opacity-90 ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                                            {msg.role === 'assistant' ? (msg.modelName || selectedModel.name) : 'Usuario'}
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
                                        <div className={`prose prose-invert max-w-none leading-7 ${msg.role === 'user' ? 'text-left' : 'text-justify'}`}>
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    code({ node, inline, className, children, ...props }) {
                                                        const match = /language-(\w+)/.exec(className || '')
                                                        return !inline && match ? (
                                                            <SyntaxHighlighter
                                                                style={vscDarkPlus}
                                                                language={match[1]}
                                                                PreTag="div"
                                                                {...props}
                                                            >
                                                                {String(children).replace(/\n$/, '')}
                                                            </SyntaxHighlighter>
                                                        ) : (
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        )
                                                    },
                                                    a: ({ node, ...props }) => (
                                                        <a
                                                            {...props}
                                                            className="text-blue-400 hover:underline cursor-pointer"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        />
                                                    )
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
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
                    <InputArea
                        onSend={handleSend}
                        disabled={isLoading}
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                        lockedModel={customModel ? {
                            id: customModel.baseModelId || customModel.baseModel?.id,
                            name: customModel.baseModelName || customModel.baseModel?.name,
                            provider: customModel.provider || customModel.baseModel?.provider
                        } : null}
                    />
                    <div className="text-center text-xs text-gray-400 mt-2">
                        Vista Previa de Investigación Gratuita. ChatGPT puede producir información inexacta sobre personas, lugares o hechos.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatArea;
