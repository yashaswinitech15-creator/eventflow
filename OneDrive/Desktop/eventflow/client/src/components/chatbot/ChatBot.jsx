import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import api from "../../utils/api";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: "bot", text: "👋 Hi! I'm EventBot. Ask me anything about events, bookings, or payments!", ts: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && faqs.length === 0) {
      api.get("/chatbot/faqs").then((r) => setFaqs(r.data.faqs)).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { id: Date.now(), role: "user", text, ts: new Date() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chatbot/message", { message: text });
      setMessages((m) => [...m, { id: Date.now() + 1, role: "bot", text: res.data.response, ts: new Date() }]);
    } catch {
      setMessages((m) => [...m, { id: Date.now() + 1, role: "bot", text: "Sorry, I'm having trouble connecting. Please try again!", ts: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          open ? "bg-gray-700 rotate-0" : "bg-primary-500 hover:bg-primary-600 hover:scale-110"
        }`}
      >
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={24} className="text-white" />}
        {!open && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">1</span>}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 card shadow-2xl flex flex-col overflow-hidden animate-slide-up" style={{ height: "520px" }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">EventBot</p>
              <p className="text-white/70 text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
                Online — usually replies instantly
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/70 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user" ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"
                }`}>
                  {msg.role === "user" ? <User size={14} className="text-white" /> : <Bot size={14} className="text-gray-600 dark:text-gray-300" />}
                </div>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-primary-500 text-white rounded-tr-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Bot size={14} className="text-gray-600" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* FAQ Suggestions */}
          {messages.length <= 2 && faqs.length > 0 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1">
              {faqs.slice(0, 3).map((faq, i) => (
                <button
                  key={i}
                  onClick={() => send(faq.q)}
                  className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 px-2 py-1 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  {faq.q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm border-0 outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-primary-500 hover:bg-primary-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
