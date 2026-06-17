'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, X, Send, Loader2, Bot } from 'lucide-react';
import { rajuChat } from '@/ai/flows/raju-chat-flow';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function RajuChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hi! I'm Raju, your Medibuddy assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await rajuChat({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', content: response.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl z-50 flex items-center justify-center p-0 overflow-hidden group border-4 border-white glass"
      >
        <div className="bg-primary w-full h-full flex items-center justify-center transition-transform group-hover:scale-110">
          <Bot className="w-9 h-9 text-white" />
        </div>
      </Button>

      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[550px] z-50 glass shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 duration-500 border-white/60 overflow-hidden rounded-[2rem]">
          <CardHeader className="bg-primary/95 backdrop-blur-md text-primary-foreground py-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-white/20 shadow-md">
                <AvatarFallback className="bg-white/10 text-white font-bold">R</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base font-bold">Chat with Raju</CardTitle>
                <p className="text-[10px] opacity-80 font-medium">AI Clinical Assistant</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden bg-white/40">
            <ScrollArea className="h-full p-4" viewportRef={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium shadow-sm transition-all duration-300 ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none shadow-primary/20' 
                        : 'bg-white/80 backdrop-blur-sm border border-white/60 text-primary rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/80 backdrop-blur-sm border border-white/60 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-3">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-xs text-primary font-bold italic animate-pulse">Raju is thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-4 bg-white/80 backdrop-blur-md border-t border-white/60">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex w-full items-center gap-3"
            >
              <Input 
                placeholder="Ask Raju anything..." 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 h-12 text-sm glass border-white/80 bg-white/50 focus:bg-white/90 transition-all rounded-full px-5"
              />
              <Button type="submit" size="icon" className="h-12 w-12 shrink-0 rounded-full shadow-lg shadow-primary/20" disabled={isLoading || !input.trim()}>
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
}