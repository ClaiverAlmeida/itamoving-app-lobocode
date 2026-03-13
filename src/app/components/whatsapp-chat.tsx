import React,{ useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! 👋 Sou a assistente virtual da ITAMOVING. Como posso ajudá-lo hoje?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const messageLower = userMessage.toLowerCase();

    // Respostas inteligentes baseadas em palavras-chave
    if (messageLower.includes('preço') || messageLower.includes('valor') || messageLower.includes('custo') || messageLower.includes('orçamento')) {
      return 'Para solicitar um orçamento personalizado, preciso de algumas informações: origem, destino, volume estimado e data desejada. Você pode acessar a seção "Agendamentos" no sistema ou me fornecer essas informações aqui! 📦💰';
    }
    
    if (messageLower.includes('prazo') || messageLower.includes('tempo') || messageLower.includes('quanto tempo') || messageLower.includes('demora')) {
      return 'Mudanças entre EUA e Brasil geralmente levam de 4 a 8 semanas, dependendo da cidade de origem e destino. O processo inclui coleta, transporte marítimo e desembaraço aduaneiro. Quer saber o prazo específico para sua região? 🚢⏱️';
    }
    
    if (messageLower.includes('documento') || messageLower.includes('documentação') || messageLower.includes('papéis')) {
      return 'Para mudanças internacionais você precisará de: passaporte, visto (se aplicável), inventário detalhado dos bens, e declaração de bagagem. Nosso sistema possui assinatura digital de documentos na seção "Relatórios"! 📄✍️';
    }
    
    if (messageLower.includes('rastreamento') || messageLower.includes('rastrear') || messageLower.includes('onde está') || messageLower.includes('localização')) {
      return 'Você pode rastrear seu container em tempo real através da seção "Containers" do sistema. Temos rastreamento GPS para caminhões e atualização do status do embarque. Qual o número do seu container? 📍🚛';
    }
    
    if (messageLower.includes('caixa') || messageLower.includes('embalagem') || messageLower.includes('material')) {
      return 'Fornecemos caixas reforçadas, fitas, plástico bolha e material de embalagem. Você pode verificar o estoque disponível na seção "Estoque" do sistema. Quantas caixas você precisa? 📦🎁';
    }
    
    if (messageLower.includes('seguro') || messageLower.includes('insurance')) {
      return 'Sim! Oferecemos seguro completo para sua mudança internacional. Cobre danos, perdas e avarias durante todo o transporte. O valor é calculado com base no inventário declarado. Quer mais detalhes? 🛡️✅';
    }
    
    if (messageLower.includes('pagamento') || messageLower.includes('pagar') || messageLower.includes('forma de pagamento')) {
      return 'Aceitamos diversas formas de pagamento: cartão de crédito, transferência bancária (USD e BRL), PIX e parcelamento. Consulte o "Fluxo de Caixa" na seção Financeiro do sistema! 💳💵';
    }
    
    if (messageLower.includes('agendar') || messageLower.includes('marcar') || messageLower.includes('data')) {
      return 'Para agendar sua mudança, acesse a seção "Agendamentos" no sistema onde você pode visualizar nosso calendário e escolher a melhor data disponível. Posso ajudá-lo com isso agora? 📅✨';
    }
    
    if (messageLower.includes('cliente') || messageLower.includes('cadastro') || messageLower.includes('registrar')) {
      return 'Para se cadastrar como cliente, acesse a seção "Clientes" no sistema. Lá você pode adicionar todos os seus dados dos EUA e Brasil. Precisa de ajuda com o cadastro? 👤📝';
    }
    
    if (messageLower.includes('container') || messageLower.includes('contêiner')) {
      return 'Trabalhamos com containers de 20 e 40 pés. Você pode ter um container exclusivo ou compartilhado (LCL). Veja todos os containers disponíveis na seção "Containers" do sistema! 🚢📦';
    }
    
    if (messageLower.includes('alfândega') || messageLower.includes('desembaraço') || messageLower.includes('aduana')) {
      return 'Cuidamos de todo o processo de desembaraço aduaneiro para você! Nosso time prepara a documentação necessária e acompanha o processo na Receita Federal. Temos experiência com bagagem desacompanhada e mudanças. 🛃✅';
    }
    
    if (messageLower.includes('empacotar') || messageLower.includes('embalar') || messageLower.includes('preparar')) {
      return 'Oferecemos serviço completo de embalagem profissional! Nossa equipe vai até sua residência com todo material necessário. Também temos a opção "faça você mesmo" com fornecimento de materiais. Qual prefere? 📦🔧';
    }
    
    if (messageLower.includes('ajuda') || messageLower.includes('help') || messageLower.includes('suporte')) {
      return 'Estou aqui para ajudar! Posso responder sobre:\n\n📦 Orçamentos e preços\n⏱️ Prazos de entrega\n📄 Documentação necessária\n🚢 Rastreamento de containers\n📅 Agendamentos\n💰 Formas de pagamento\n\nSobre o que você gostaria de saber?';
    }
    
    if (messageLower.includes('obrigado') || messageLower.includes('obrigada') || messageLower.includes('valeu')) {
      return 'Por nada! Estou sempre aqui para ajudar. Se precisar de algo mais, é só chamar! 😊🙌';
    }
    
    if (messageLower.includes('tchau') || messageLower.includes('até logo') || messageLower.includes('bye')) {
      return 'Até logo! Boa sorte com sua mudança internacional! 👋✨';
    }

    // Resposta padrão
    return 'Entendo! Para melhor atendê-lo, você pode:\n\n✅ Explorar as seções do sistema (Dashboard, Clientes, Estoque, etc.)\n✅ Fazer perguntas sobre preços, prazos, documentação\n✅ Solicitar orçamento ou agendar uma mudança\n\nComo posso ajudar especificamente? 🤔💬';
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simular tempo de resposta da IA
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Botão Flutuante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 animate-pulse"
          aria-label="Abrir chat WhatsApp"
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      )}

      {/* Janela de Chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-[#25D366] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-[#25D366]" />
              </div>
              <div>
                <h3 className="font-semibold">ITAMOVING AI</h3>
                <p className="text-xs opacity-90">Assistente Virtual</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#E5DDD5] space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-[#DCF8C6] text-slate-900'
                      : 'bg-white text-slate-900 shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {message.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-slate-200 p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-[#25D366] hover:bg-[#20BD5A] text-white px-4"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
