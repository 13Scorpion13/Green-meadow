import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; // Added import

const Assistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: 'Привет! 😊 Я могу помочь с информацией на этой странице. Что вас интересует?', sender: 'ai' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const chatboxRef = useRef<HTMLDivElement>(null);
    const assistantRootRef = useRef<HTMLDivElement>(null);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleSendMessage = async () => {
        if (inputValue.trim() === '' || isLoading) return;

        let pageContext = '';
        if (assistantRootRef.current) {
            const originalDisplay = assistantRootRef.current.style.display;
            assistantRootRef.current.style.display = 'none';

            pageContext = document.body.innerText;

            assistantRootRef.current.style.display = originalDisplay;
        }

        const newUserMessage = {
            id: messages.length + 1,
            text: inputValue,
            sender: 'user',
        };
        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const ASSISTANT_API_URL = (process.env.NEXT_PUBLIC_ASSISTANT_API_URL!);
            const response = await fetch(ASSISTANT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  
                    // context: pageContext, // Front-end context is now ignored by backend
                    messages: [...messages, newUserMessage].map(msg => ({
                        role: msg.sender === 'user' ? 'user' : 'assistant',
                        content: msg.text
                    }))
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullAiResponse = '';
            let firstChunk = true;

            while (true) {
                const { done, value } = await reader!.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullAiResponse += chunk;

                if (firstChunk) {
                    setMessages(prevMessages => [...prevMessages, { id: newUserMessage.id + 1, text: fullAiResponse, sender: 'ai' }]);
                    firstChunk = false;
                } else {
                    setMessages(prevMessages =>
                        prevMessages.map(msg =>
                            msg.id === newUserMessage.id + 1 ? { ...msg, text: fullAiResponse } : msg
                        )
                    );
                }
            }
        } catch (error) {
            console.error("Error fetching AI response:", error);
            const errorResponse = {
                id: messages.length + 2,
                text: 'Извините, произошла ошибка. Попробуйте еще раз.',
                sender: 'ai',
            };
            setMessages(prevMessages => [...prevMessages, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    useEffect(() => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div ref={assistantRootRef}>
            <button className="chat-toggle-button" onClick={toggleChat}>
                <img src="/images/icons/ui/Bot.svg" alt="AI Agent" />
            </button>

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h3>AI Ассистент</h3>
                        <button onClick={toggleChat} className="close-chat-button">
                             <img src="/images/icons/ui/closeChat.svg" alt="Close" />
                        </button>
                    </div>
                    <div className="chat-box" ref={chatboxRef}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`chat-message ${msg.sender}`}>
                                {msg.sender === 'ai' ? (
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                ) : (
                                    <p>{msg.text}</p>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-message ai">
                                <p></p>
                            </div>
                        )}
                    </div>
                    <div className="chat-input-area">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder="Спросите что-нибудь по странице..."
                            disabled={isLoading}
                        />
                        <button onClick={handleSendMessage} disabled={isLoading}>
                             <img src="/images/icons/ui/sendChat.svg" alt="Send" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assistant;