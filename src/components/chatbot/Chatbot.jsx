import React, { useState, useRef, useEffect } from 'react';
import { useChatbot } from '../../hooks/useChatbot';
import './Chatbot.css';

// SVG Icons
const ChatIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const SendIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const BotIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8" y2="16" />
        <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
);

const UserIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

const PetIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M3 7c3-2 6-2 9 0s6 2 9 0" />
        <path d="M3 17c3 2 6 2 9 0s6-2 9 0" />
    </svg>
);

/**
 * Chatbot Component
 * Floating chatbot widget với session support
 */
const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const { messages, isLoading, error, sendMessage, clearChat } = useChatbot();

    // Auto scroll to bottom khi có tin nhắn mới
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    // Focus input khi mở chat
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Toggle chat window
    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    // Submit message
    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
            sendMessage(inputValue);
            setInputValue('');
        }
    };

    // Format time
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="chatbot-container">
            {/* Chat Window */}
            <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <header className="chatbot-header">
                    <div className="chatbot-header-info">
                        <div className="chatbot-avatar">
                            <PetIcon />
                        </div>
                        <div className="chatbot-title">
                            <h3>Pet Shop Assistant</h3>
                            <span>Đang hoạt động</span>
                        </div>
                    </div>
                    <div className="chatbot-header-actions">
                        <button
                            className="chatbot-header-btn"
                            onClick={clearChat}
                            title="Xóa lịch sử"
                        >
                            <TrashIcon />
                        </button>
                        <button
                            className="chatbot-header-btn"
                            onClick={handleToggle}
                            title="Đóng"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </header>

                {/* Messages */}
                <div className="chatbot-messages">
                    {messages.length === 0 && !isLoading && (
                        <div className="chatbot-welcome">
                            <div className="chatbot-welcome-icon">
                                <PetIcon />
                            </div>
                            <h4>Xin chào! 👋</h4>
                            <p>
                                Mình là trợ lý ảo của Pet Shop.
                                Hãy hỏi mình về sản phẩm, thú cưng,
                                hoặc các dịch vụ nhé!
                            </p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className={`chatbot-message ${msg.role}`}>
                            <div className="message-avatar">
                                {msg.role === 'assistant' ? <BotIcon /> : <UserIcon />}
                            </div>
                            <div className="message-content">
                                <div className="message-bubble">{msg.content}</div>
                                <div className="message-time">{formatTime(msg.timestamp)}</div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="chatbot-message assistant chatbot-loading">
                            <div className="message-avatar">
                                <BotIcon />
                            </div>
                            <div className="message-content">
                                <div className="message-bubble">
                                    <span className="loading-dot"></span>
                                    <span className="loading-dot"></span>
                                    <span className="loading-dot"></span>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && <div className="chatbot-error">{error}</div>}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="chatbot-input-area">
                    <form className="chatbot-input-form" onSubmit={handleSubmit}>
                        <input
                            ref={inputRef}
                            type="text"
                            className="chatbot-input"
                            placeholder="Nhập tin nhắn..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="chatbot-send-btn"
                            disabled={!inputValue.trim() || isLoading}
                        >
                            <SendIcon />
                        </button>
                    </form>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                className={`chatbot-toggle ${isOpen ? 'active' : ''}`}
                onClick={handleToggle}
                aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
            </button>
        </div>
    );
};

export default Chatbot;
