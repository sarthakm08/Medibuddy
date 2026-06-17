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
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl z-50 flex items-center justify-center p-0 overflow-hidden group border-2 border-white"
      >
        <div className="bg-primary w-full h-full flex items-center justify-center transition-transform group-hover:scale-110">
          <Bot className="w-8 h-8 text-white" />
        </div>
      </Button>

      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[500px] z-50 shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          <CardHeader className="bg-primary text-primary-foreground py-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8 border-2 border-white/20">
                <AvatarFallback className="bg-white/10 text-white">R</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm font-bold">Chat with Raju</CardTitle>
                <p className="text-[10px] opacity-70">AI Health Assistant</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden bg-muted/20">
            <ScrollArea className="h-full p-4" viewportRef={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-white border rounded-tl-none shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground italic">Raju is typing...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-4 bg-white border-t">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex w-full items-center gap-2"
            >
              <Input 
                placeholder="Ask Raju anything..." 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 h-9 text-xs"
              />
              <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
