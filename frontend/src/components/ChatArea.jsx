import React from 'react';
import InputArea from './InputArea';
import ModelSelector from './ModelSelector';

const ChatArea = ({ isSidebarOpen, toggleSidebar }) => {
    const [messages, setMessages] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedModel, setSelectedModel] = React.useState({
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai'
    });

    const handleSend = async (text) => {
        const userMessage = { role: 'user', content: text };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
            const response = await fetch(`${apiUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    userId: 'test-user',
                    model: selectedModel
                }),
            });
            const data = await response.json();

            if (data.error) {
                console.error('Error:', data.error);
            } else {
                setMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full h-full relative bg-[#202123]">
            <div className="absolute top-0 left-0 p-2 z-10 flex items-center gap-2">
                {!isSidebarOpen && (
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-md hover:bg-[#2A2B32] text-gray-400 hover:text-white transition-colors"
                    >
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                    </button>
                )}
                <ModelSelector onModelChange={setSelectedModel} />
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col items-center text-sm">
                    {messages.length === 0 ? (
                        <div className="text-gray-800 w-full md:max-w-2xl lg:max-w-3xl md:h-full md:flex md:flex-col px-6 dark:text-gray-100 mt-20">
                            <h1 className="text-4xl font-semibold text-center mt-6 sm:mt-[20vh] ml-auto mr-auto mb-10 sm:mb-16 flex gap-2 items-center justify-center">
                                ChatGPT
                            </h1>
                            <div className="md:flex items-start text-center gap-3.5">
                                <div className="flex flex-col mb-8 md:mb-auto gap-3.5 flex-1">
                                    <h2 className="flex gap-3 items-center m-auto text-lg font-normal md:flex-col md:gap-2">
                                        <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                                        Examples
                                    </h2>
                                    <ul className="flex flex-col gap-3.5 w-full sm:max-w-md m-auto">
                                        <button onClick={() => handleSend("Explain quantum computing in simple terms")} className="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-900 cursor-pointer">"Explain quantum computing in simple terms"</button>
                                        <button onClick={() => handleSend("Got any creative ideas for a 10 year old's birthday?")} className="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-900 cursor-pointer">"Got any creative ideas for a 10 year old's birthday?"</button>
                                        <button onClick={() => handleSend("How do I make an HTTP request in Javascript?")} className="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-900 cursor-pointer">"How do I make an HTTP request in Javascript?"</button>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col w-full items-center pb-32">
                            {messages.map((msg, index) => (
                                <div key={index} className={`w-full border-b border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 group ${msg.role === 'assistant' ? 'bg-gray-50 dark:bg-[#444654]' : 'dark:bg-[#343541]'}`}>
                                    <div className="text-base gap-4 md:gap-6 md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl p-4 md:py-6 flex lg:px-0 m-auto">
                                        <div className="w-[30px] flex flex-col relative items-end">
                                            <div className={`relative h-[30px] w-[30px] p-1 rounded-sm text-white flex items-center justify-center ${msg.role === 'assistant' ? 'bg-[#19c37d]' : 'bg-[#5436DA]'}`}>
                                                {msg.role === 'assistant' ? (
                                                    <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg"><path d="M4.1 9.9c.7 1.3 2.3 1.7 3.6 1L10 9.3l.9 1.6c.5.9 1.6 1.2 2.5.7l1.6-.9-1.6 3.2c-.3.6-.1 1.3.5 1.6l3.2 1.6-1.6-.9c-.9-.5-1.2-1.6-.7-2.5l.9-1.6-2.3 1.6c-1.3.7-1.7 2.3-1 3.6l1.6 2.7c.7 1.3 2.3 1.7 3.6 1l2.7-1.6c1.3-.7 1.7-2.3 1-3.6l-1.6-2.7c-.7-1.3-2.3-1.7-3.6-1L14 14.7l-.9-1.6c-.5-.9-1.6-1.2-2.5-.7l-1.6.9 1.6-3.2c.3-.6.1-1.3-.5-1.6l-3.2-1.6 1.6.9c.9.5 1.2 1.6.7 2.5l-.9 1.6 2.3-1.6c1.3-.7 1.7-2.3 1-3.6L9.7 4.1c-.7-1.3-2.3-1.7-3.6-1L3.4 4.7c-1.3.7-1.7 2.3-1 3.6l1.7 1.6z"></path></svg>
                                                ) : (
                                                    <span>U</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="relative flex-1 overflow-hidden">
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="w-full border-b border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-[#444654]">
                                    <div className="text-base gap-4 md:gap-6 md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl p-4 md:py-6 flex lg:px-0 m-auto">
                                        <div className="w-[30px] flex flex-col relative items-end">
                                            <div className="relative h-[30px] w-[30px] p-1 rounded-sm text-white flex items-center justify-center bg-[#19c37d]">
                                                <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                                            </div>
                                        </div>
                                        <div className="relative flex-1 overflow-hidden">
                                            Thinking...
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full md:max-w-2xl lg:max-w-3xl md:mx-auto absolute bottom-0 left-0 right-0">
                <InputArea onSend={handleSend} />
            </div>
        </div>
    );
};

export default ChatArea;
