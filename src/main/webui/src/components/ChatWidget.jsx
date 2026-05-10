import { useState, useRef, useEffect } from 'react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const botMsg = { id: Date.now() + 1, sender: 'bot', text: 'Cảm ơn bạn đã liên hệ. Hiện tại các nhân viên đang bận, vui lòng để lại lời nhắn hoặc gọi hotline 1800.xxxx.' };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <>
      <button
        className={`chat-bubble-btn ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Chat với chúng tôi"
      >
        <i className="fas fa-comment-dots"></i>
      </button>

      <div className={`chat-widget-window ${isOpen ? 'active' : ''}`}>
        <div className="cww-header">
          <div className="cww-h-info">
            <div className="cww-avatar"><i className="fas fa-robot"></i></div>
            <div>
              <strong>PhoneZone Support</strong>
              <span>Trực tuyến</span>
            </div>
          </div>
          <button className="cww-close" onClick={() => setIsOpen(false)}>
            <i className="fas fa-xmark"></i>
          </button>
        </div>

        <div className="cww-body">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              <div className="msg-bubble">{msg.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="cww-footer" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit"><i className="fas fa-paper-plane"></i></button>
        </form>
      </div>
    </>
  );
}
