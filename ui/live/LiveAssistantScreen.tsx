import React, { useState, useRef, useEffect, useCallback } from 'react';
// HACK: Removed FunctionResponsePart from import to let TypeScript infer types and avoid environment-specific type errors.
import { GoogleGenAI, FunctionDeclaration, Type, Chat, Part } from '@google/genai';
import { AppState, Order, PaymentStatus } from '../../types';

// Check for SpeechRecognition API compatibility
// FIX: Cast window to `any` to access vendor-prefixed SpeechRecognition APIs without TypeScript errors.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
}

type SessionStatus = 'IDLE' | 'LISTENING' | 'THINKING' | 'ERROR';
type TranscriptEntry = { author: 'user' | 'ai' | 'system'; text: string };

interface LiveAssistantProps {
  state: AppState;
  onAddOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'totalAmount'>) => void;
}

const LiveAssistantScreen: React.FC<LiveAssistantProps> = ({ state, onAddOrder }) => {
  const [status, setStatus] = useState<SessionStatus>('IDLE');
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const chatRef = useRef<Chat | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom of transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, interimTranscript]);

  // Initialize Gemini Chat
  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const addOrderDeclaration: FunctionDeclaration = {
      name: 'addOrder',
      parameters: {
        type: Type.OBJECT,
        description: 'Creates a new sales order for a customer and deducts the quantity from the product stock.',
        properties: {
          productId: { type: Type.STRING, description: 'The unique ID of the product being ordered (e.g., "p1").' },
          customerName: { type: Type.STRING, description: 'Name of the customer placing the order.' },
          quantity: { type: Type.NUMBER, description: 'Number of rolls being ordered.' },
          paymentStatus: { type: Type.STRING, description: 'The payment status, either "PAID" or "CREDIT".' }
        },
        required: ['productId', 'customerName', 'quantity', 'paymentStatus']
      },
    };

    const productsForPrompt = state.products.map(p => ({
      id: p.id,
      name: p.productName,
      size: p.size,
      stock: p.stockQuantity
    }));

    const systemInstruction = `You are an expert inventory management assistant for LabelTracker Pro. Your goal is to help the user manage their inventory through voice commands. You can answer questions about stock levels and create sales orders.

    **Current Inventory:**
    ${JSON.stringify(productsForPrompt, null, 2)}

    **Rules:**
    1.  When asked about stock, provide clear, concise answers based on the inventory list.
    2.  When asked to create an order, you MUST use the \`addOrder\` function.
    3.  Before calling \`addOrder\`, you must confirm the details with the user (product, quantity, customer, payment status).
    4.  Always map the user's spoken product name to the correct \`productId\` from the list. If unsure, ask for clarification.
    5.  For payment status, if the user doesn't specify, assume 'PAID'. If they mention credit, accounts receivable, or invoice, use 'CREDIT'.
    6.  After a function is called successfully, confirm this to the user, for example: "Alright, I've created the order for Acme Corp."`;
    
    chatRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [addOrderDeclaration] }],
      },
    });

  }, [state.products]);
  
  const addTranscript = useCallback((entry: TranscriptEntry) => {
    setTranscripts(prev => [...prev, entry]);
    setInterimTranscript('');
  }, []);

  const processMessage = useCallback(async (message: string) => {
    if (!chatRef.current) return;

    setStatus('THINKING');
    addTranscript({ author: 'user', text: message });

    try {
      // FIX: The `chat.sendMessage` method expects a `SendMessageParameters` object with a `message` property.
      let response = await chatRef.current.sendMessage({ message });

      while (response.functionCalls && response.functionCalls.length > 0) {
        const functionCalls = response.functionCalls;
        // Correctly type the array for function responses.
        // FIX: Removed explicit FunctionResponsePart[] type to let TypeScript infer the array type from its contents, avoiding a potential environmental type issue.
        const functionResponses: Part[] = [];
        
        for (const call of functionCalls) {
          if (call.name === 'addOrder') {
            // FIX: Cast arguments from the function call to their expected types to resolve type errors.
            const { productId, customerName, quantity, paymentStatus } = call.args as { productId: string, customerName: string, quantity: number, paymentStatus: string };
            const product = state.products.find(p => p.id === productId);

            if (!product) {
              // FIX: Corrected the structure for the function response part. It is an object with a `functionResponse` key.
               functionResponses.push({
                functionResponse: { name: call.name, response: { result: `Error: Product with ID ${productId} not found.`}}
              });
              continue;
            }

            if (product.stockQuantity < quantity) {
              // FIX: Corrected the structure for the function response part. It is an object with a `functionResponse` key.
              functionResponses.push({
                functionResponse: { name: call.name, response: { result: `Error: Not enough stock for ${product.productName}. Only ${product.stockQuantity} rolls available.`}}
              });
              continue;
            }
            
            onAddOrder({
              productId,
              customerName,
              quantity,
              paymentStatus: paymentStatus as PaymentStatus,
              productName: `${product.productName} [${product.size || '-'}]`,
              sellingPrice: product.unitPrice,
              orderDate: Date.now(),
            });
            
            // FIX: Corrected the structure for the function response part. It is an object with a `functionResponse` key.
            functionResponses.push({
              functionResponse: { name: call.name, response: { result: `Successfully created order for ${quantity} rolls of ${product.productName} for ${customerName}.`}}
            });
            addTranscript({ author: 'system', text: `Order created for ${customerName}.` });
          }
        }
        
        // FIX: The `chat.sendMessage` method expects a `SendMessageParameters` object with a `message` property containing the parts array.
        response = await chatRef.current.sendMessage({
            message: functionResponses
        });
      }
      
      if (response.text) {
        addTranscript({ author: 'ai', text: response.text });
      }
      setStatus('LISTENING');
    } catch (error) {
      console.error("Gemini Error:", error);
      setStatus('ERROR');
      addTranscript({ author: 'system', text: 'Sorry, I encountered an error. Please try again.' });
    }
  }, [state.products, onAddOrder, addTranscript]);

  const handleToggleListen = () => {
    if (!recognition) {
        setStatus('ERROR');
        addTranscript({ author: 'system', text: 'Speech recognition is not supported by your browser.' });
        return;
    }

    if (status === 'LISTENING') {
      recognition.stop();
      setStatus('IDLE');
    } else {
      recognition.start();
      setStatus('LISTENING');
      setTranscripts([]); // Clear for new session
      addTranscript({ author: 'system', text: 'Session started. How can I help?' });
    }
  };
  
  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(interim);
      if (finalTranscript) {
        processMessage(finalTranscript.trim());
      }
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setStatus('ERROR');
        addTranscript({ author: 'system', text: `Speech recognition error: ${event.error}`});
    };
    
    recognition.onend = () => {
        if (status === 'LISTENING') {
          // Restart recognition if it stops unexpectedly while in listening state
          recognition.start();
        } else {
          setStatus('IDLE');
        }
    };

    return () => {
      if(recognition) recognition.stop();
    };
  }, [status, processMessage, addTranscript]);

  const TranscriptBubble: React.FC<{ entry: TranscriptEntry }> = ({ entry }) => {
    const isUser = entry.author === 'user';
    const isSystem = entry.author === 'system';

    if (isSystem) {
      return (
        <div className="text-center my-4">
          <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-3 py-1.5 rounded-full">{entry.text}</span>
        </div>
      );
    }
    
    return (
      <div className={`flex items-start gap-4 my-4 animate-in fade-in-5 slide-in-from-bottom-2 duration-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && <div className="w-10 h-10 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-lg font-black text-white shadow-lg shadow-blue-200">LT</div>}
        <div className={`max-w-xl p-5 rounded-3xl shadow-sm ${isUser ? 'bg-slate-800 text-white rounded-br-lg' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-lg'}`}>
          <p className="font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: entry.text.replace(/\n/g, '<br />') }}></p>
        </div>
      </div>
    );
  };

  const StatusIndicator: React.FC = () => {
    let text = "Click the button below to start a voice session.";
    let icon = "🎙️";
    let color = "text-slate-400";

    switch(status) {
        case 'LISTENING':
            text = "Listening...";
            icon = "🎤";
            color = "text-blue-500";
            break;
        case 'THINKING':
            text = "Processing request...";
            icon = "🧠";
            color = "text-indigo-500";
            break;
        case 'ERROR':
            text = "An error occurred.";
            icon = "⚠️";
            color = "text-red-500";
            break;
        case 'IDLE':
             text = "Session ended. Click to start again.";
             break;
    }
    return (
        <div className={`text-center transition-all duration-300 ${color}`}>
            <div className="text-4xl mb-2 animate-in fade-in-0 zoom-in-50 duration-500">{icon}</div>
            <p className="font-bold uppercase tracking-widest text-xs">{text}</p>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto">
        <div className="flex-grow overflow-y-auto p-4 space-y-2">
            {transcripts.map((t, i) => <TranscriptBubble key={i} entry={t} />)}
            {interimTranscript && (
                <div className="flex items-start gap-4 my-4 justify-end">
                    <div className="max-w-xl p-5 rounded-3xl bg-slate-100 text-slate-400 rounded-br-lg italic">
                        <p className="font-medium leading-relaxed">{interimTranscript}</p>
                    </div>
                </div>
            )}
            <div ref={transcriptEndRef} />
        </div>
        
        <div className="flex-shrink-0 pt-8 pb-4 text-center space-y-8 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent">
            <StatusIndicator />
            <button
                onClick={handleToggleListen}
                className={`w-24 h-24 rounded-full text-white text-4xl shadow-2xl transition-all duration-300 active:scale-90 flex items-center justify-center mx-auto
                    ${status === 'LISTENING' ? 'bg-red-500 shadow-red-300 animate-pulse' : 'bg-blue-600 shadow-blue-300'}`}
                aria-label={status === 'LISTENING' ? 'Stop listening' : 'Start listening'}
            >
                {status === 'LISTENING' ? '◼' : '🎙️'}
            </button>
        </div>
    </div>
  );
};

export default LiveAssistantScreen;
