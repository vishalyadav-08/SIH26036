"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Info } from 'lucide-react';
import { useMapanSetuContext } from '@/hooks/useMapanSetuContext';
import { aiService, ChatSource } from '@/services/ai/ai.service';
import clsx from 'clsx';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  isError?: boolean;
}

export function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I’m the MapanSetu Assistant. I can help you understand MapanSetu, inspections, certificate verification, field workflows, and Legal Metrology information.'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  
  const pageContext = useMapanSetuContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const response = await aiService.sendMessage({
        message: text,
        conversationId,
        context: pageContext
      });
      
      setConversationId(response.conversationId);
      
      const aiMsg: Message = {
        id: Date.now().toString() + 'ai',
        role: 'assistant',
        content: response.answer,
        sources: response.sources
      };
      setMessages(prev => [...prev, aiMsg]);
      
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + 'err',
        role: 'assistant',
        content: 'The assistant is temporarily unavailable. Please try again.',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "What is MapanSetu?",
    "How does certificate verification work?",
    "How does inspection work?",
    "What is Legal Metrology?",
    "How does offline sync work?"
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={clsx(
          "fixed bottom-6 right-6 p-4 rounded-full shadow-xl bg-blue-700 text-white hover:bg-blue-800 transition-all z-50 flex items-center justify-center",
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        )}
        aria-label="Open MapanSetu Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Assistant Panel */}
      <div
        className={clsx(
          "fixed z-50 flex flex-col bg-white shadow-2xl overflow-hidden transition-all duration-300 ease-in-out border border-slate-200",
          "bottom-0 right-0 sm:bottom-6 sm:right-6 sm:rounded-2xl w-full h-full sm:w-[400px] sm:h-[600px] max-h-[100dvh]",
          isOpen ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-[120%] opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-blue-700 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6" />
            <div>
              <h2 className="font-semibold text-lg leading-tight">MapanSetu Assistant</h2>
              <p className="text-blue-100 text-xs">Advisory & Information Bot</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded-md transition-colors"
            aria-label="Close assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Context Indicator (Subtle) */}
        <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 text-xs text-slate-500 flex items-center gap-1.5 shrink-0">
          <Info className="w-3.5 h-3.5" />
          <span>Context: {pageContext.page.replace('-', ' ')}</span>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div key={msg.id} className={clsx("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
              <div
                className={clsx(
                  "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
                  msg.role === 'user' 
                    ? "bg-blue-600 text-white rounded-br-none" 
                    : msg.isError 
                      ? "bg-red-50 text-red-900 border border-red-100 rounded-bl-none"
                      : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                )}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
              </div>
              
              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 w-[85%] space-y-2">
                  <p className="text-xs font-semibold text-slate-500 px-1">Sources</p>
                  {msg.sources.map((src, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-md p-2 text-xs shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className={clsx("font-medium", src.category === 'legal' ? 'text-amber-700' : 'text-blue-700')}>
                          {src.category === 'legal' ? 'Legal / Reference Source' : 'MapanSetu Source'}
                        </span>
                        {src.jurisdiction && <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded">{src.jurisdiction}</span>}
                      </div>
                      <p className="text-slate-700 font-medium">{src.title}</p>
                      {(src.section || src.page) && (
                        <p className="text-slate-500 mt-0.5">
                          {src.section && `Sec: ${src.section}`} {src.page && `| Page: ${src.page}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start">
              <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm text-slate-500">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          {messages.length === 1 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="text-left text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-3 py-1.5 rounded-full transition-colors border border-slate-200"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="flex items-end gap-2 bg-slate-50 rounded-xl border border-slate-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden px-2 py-1 transition-all"
          >
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(inputValue);
                }
              }}
              placeholder="Ask a question..."
              className="flex-1 max-h-32 min-h-[40px] resize-none bg-transparent py-2 px-1 text-sm outline-none text-slate-800 placeholder:text-slate-400"
              rows={1}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="mb-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-400 transition-colors shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
