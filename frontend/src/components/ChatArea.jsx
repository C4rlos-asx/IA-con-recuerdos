<motion.div
    key={index}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="w-full group text-gray-800 dark:text-gray-100"
>
    <div className={`max-w-3xl mx-auto flex gap-4 p-4 md:p-6 text-base ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'
        }`}>
        <div className="relative flex-1 overflow-hidden break-words">
            <div className={`font-bold mb-1 opacity-90 ${msg.role === 'user' ? 'text-left' : 'text-right'
                }`}>
                {msg.role === 'assistant' ? selectedModel.name : 'User'}
            </div>
            <div className={`prose prose-invert max-w-none leading-7 ${msg.role === 'user' ? 'text-left' : 'text-right'
                }`}>
                {msg.content}
            </div>
        </div>
    </div>
</motion.div>
                        ))}

{
    isLoading && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
        >
            <div className="max-w-3xl mx-auto flex gap-4 p-4 md:p-6 flex-row-reverse">
                <div className="flex items-center justify-end w-full">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1 delay-75"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                </div>
            </div>
        </motion.div>
    )
}
                    </AnimatePresence >
    <div ref={messagesEndRef} />
                </div >
            </div >

    {/* Input Area */ }
    < div className = "absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#202123] via-[#202123] to-transparent pt-10 pb-6" >
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
            </div >
        </div >
    );
};

export default ChatArea;
