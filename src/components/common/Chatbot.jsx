'use client';

import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.scss';
import {quickSpeak} from "@/lib/textToSpeach";

export default function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {

        if (!input.trim() || isLoading) return;

        const userMsg = { user: true, text: input };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`/api/v1/chatbot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: currentInput }),
            });

            const result = await response.json();
            if (result.status === "success") {
                quickSpeak(result.data.reply);
                setMessages(prev => [...prev, { user: false, text: result.data.reply }]);
            } else {
                setMessages(prev => [...prev, { user: false, text: result.message || "Error processing request." }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { user: false, text: "I'm having trouble connecting right now." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`chatbot-wrapper ${open ? 'is-open' : ''}`}>
            <button
                className="btn btn-purple rounded-circle shadow-lg chat-trigger"
                onClick={() => {
                    setOpen(!open)
                    if(!open) {
                        quickSpeak("Hello, How can I help you find a book today?")
                    }else{
                        quickSpeak("Thank you for chatting with me. Have a wonderful day!");
                    }
                }}
            >
                {open ? <span className="fs-3">&times;</span> : <i className="bi bi-chat-dots-fill fs-4"></i>}
            </button>

            {open && (
                <div className="card shadow-lg chatbot-window border-0">
                    <div className="card-header bg-purple text-white d-flex align-items-center rounded-top-4 py-3">
                        <div className="rounded-circle me-2" style={{ width: '10px', height: '10px', backgroundColor:'lightgreen' }}></div>
                        <h6 className="mb-0">Library Assistant</h6>
                    </div>

                    <div className="card-body bg-light messages-area" ref={scrollRef}>
                        {messages.length === 0 && (
                            <div className="text-center text-muted mt-2" style={{fontSize:"12px"}}>👋 Hello! How can I help you find a book today?</div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`d-flex mb-3 ${msg.user ? 'justify-content-end' : 'justify-content-start'}`}>
                                <div className={`p-2 px-3 rounded-4 shadow-sm ${msg.user ? 'bg-purple text-white' : 'bg-white text-dark'}`}
                                     style={{ maxWidth: '85%', fontSize: '0.9rem' }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="d-flex justify-content-start mb-3">
                                <div className="bg-white p-2 px-3 rounded-4 shadow-sm text-muted small">
                                    <div className="spinner-grow spinner-grow-sm text-primary" role="status"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card-footer bg-white border-top-0 p-3">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control rounded-pill border-light-subtle"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                            />
                            <button
                                className="btn btn-purple rounded-circle ms-2 d-flex align-items-center justify-content-center"
                                onClick={handleSend}
                                disabled={!input.trim()}
                                style={{ width: '40px', height: '40px' }}
                            >
                                <i className="bi bi-send-fill"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}