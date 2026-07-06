/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Mic,
  Image,
  Smile,
  Check,
  CheckCheck,
  Search,
  CheckCircle,
  MoreVertical,
  Phone,
  Video,
  Play,
  Pause,
  Clock,
  Sparkles
} from "lucide-react";
import { Provider } from "../types";

interface Message {
  id: string;
  sender: "client" | "provider";
  text: string;
  timestamp: string;
  isAudio?: boolean;
  audioDuration?: string;
  isImage?: boolean;
  imageUrl?: string;
}

interface LiveChatProps {
  providers: Provider[];
  activeProviderId?: string;
}

export default function LiveChat({ providers, activeProviderId }: LiveChatProps) {
  const [selectedProv, setSelectedProv] = useState<Provider>(providers[0]);
  const [messageText, setMessageText] = useState("");
  const [channels, setChannels] = useState<{ [key: string]: Message[] }>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [channelsSearch, setChannelsSearch] = useState("");

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize conversations if empty
  useEffect(() => {
    const initChannels: { [key: string]: Message[] } = {};
    providers.forEach((p) => {
      initChannels[p.id] = [
        {
          id: `${p.id}_m1`,
          sender: "provider",
          text: `Bonjour! Je suis disponible pour intervenir sur votre demande. Quels sont vos besoins spécifiques ?`,
          timestamp: "09:04"
        }
      ];
    });
    setChannels((prev) => (Object.keys(prev).length === 0 ? initChannels : prev));
  }, [providers]);

  // Handle active provider selection passed from parent components
  useEffect(() => {
    if (activeProviderId) {
      const match = providers.find((p) => p.id === activeProviderId);
      if (match) setSelectedProv(match);
    }
  }, [activeProviderId, providers]);

  // Scroll to bottom on updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [channels, selectedProv, isTyping]);

  const currentMessages = channels[selectedProv.id] || [];

  // Multi-option responses generator
  const getSmartReply = (clientText: string, name: string): string => {
    const text = clientText.toLowerCase();
    if (text.includes("tarif") || text.includes("prix") || text.includes("coûte") || text.includes("fcfa")) {
      return `Mon tarif d'inscription/base est de ${selectedProv.hourlyRate.toLocaleString()} FCFA, hors coût de pièces de rechange nécessaires. Je m'aligne volontiers sur votre besoin !`;
    }
    if (text.includes("dispo") || text.includes("quand") || text.includes("heure")) {
      return `Je suis à votre entière disposition aujourd\'hui. Il me faut juste environ 30 minutes de trajet pour arriver sur les lieux de l'intervention.`;
    }
    if (text.includes("adresse") || text.includes("où") || text.includes("ville")) {
      return `J'opère principalement dans les quartiers généraux de ${selectedProv.city}. Envoyez-moi votre géolocalisation WhatsApp et j'arrive !`;
    }
    return `Bien reçu ! Je prépare immédiatement ma boîte à outils et le matériel de rechange. C'est d'accord pour l'heure convenue.`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const formattedTime = new Date().toTimeString().split(" ")[0].slice(0, 5);
    const clientMsgId = `m_${Date.now()}`;
    const newMsg: Message = {
      id: clientMsgId,
      sender: "client",
      text: messageText,
      timestamp: formattedTime
    };

    // Update locally
    setChannels((prev) => ({
      ...prev,
      [selectedProv.id]: [...(prev[selectedProv.id] || []), newMsg]
    }));

    const clientTypedText = messageText;
    setMessageText("");

    // Simulate Provider artisan Typing State after 1s
    setTimeout(() => {
      setIsTyping(true);

      // Trigger automatic smart answer after 2.2s
      setTimeout(() => {
        setIsTyping(false);
        const replyText = getSmartReply(clientTypedText, selectedProv.name);
        const replyMsg: Message = {
          id: `m_reply_${Date.now()}`,
          sender: "provider",
          text: replyText,
          timestamp: new Date().toTimeString().split(" ")[0].slice(0, 5)
        };

        setChannels((prev) => ({
          ...prev,
          [selectedProv.id]: [...(prev[selectedProv.id] || []), replyMsg]
        }));
      }, 1500);

    }, 1000);
  };

  // Simulate Sending Voice/Audio sound clip
  const handleSendVoiceClip = () => {
    const formattedTime = new Date().toTimeString().split(" ")[0].slice(0, 5);
    const id = `m_audio_${Date.now()}`;
    const voiceMsg: Message = {
      id,
      sender: "client",
      text: "Message vocal d'explications techniques (simulé)",
      timestamp: formattedTime,
      isAudio: true,
      audioDuration: "0:24"
    };

    setChannels((prev) => ({
      ...prev,
      [selectedProv.id]: [...(prev[selectedProv.id] || []), voiceMsg]
    }));

    // Dynamic auto-answer
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyMsg: Message = {
          id: `m_reply_v_${Date.now()}`,
          sender: "provider",
          text: "Merci pour les explications audio. J'ai bien cerné le problème technique, j'apporte la pièce d'étanchéité appropriée.",
          timestamp: new Date().toTimeString().split(" ")[0].slice(0, 5)
        };
        setChannels((prev) => ({
          ...prev,
          [selectedProv.id]: [...(prev[selectedProv.id] || []), replyMsg]
        }));
      }, 2000);
    }, 1200);
  };

  // Simulate Sending Image/Attachment clip
  const handleSendImageClip = (url: string) => {
    const formattedTime = new Date().toTimeString().split(" ")[0].slice(0, 5);
    const id = `m_img_${Date.now()}`;
    const imageMsg: Message = {
      id,
      sender: "client",
      text: "Pièce endommagée d'urgence",
      timestamp: formattedTime,
      isImage: true,
      imageUrl: url
    };

    setChannels((prev) => ({
      ...prev,
      [selectedProv.id]: [...(prev[selectedProv.id] || []), imageMsg]
    }));

    // Auto-answer
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyMsg: Message = {
          id: `m_reply_i_${Date.now()}`,
          sender: "provider",
          text: "Ah oui, je vois bien la fissure sur l'image de la tuyauterie. Je vais coller un manchon de renfort en PVC.",
          timestamp: new Date().toTimeString().split(" ")[0].slice(0, 5)
        };
        setChannels((prev) => ({
          ...prev,
          [selectedProv.id]: [...(prev[selectedProv.id] || []), replyMsg]
        }));
      }, 2000);
    }, 1000);
  };

  const filteredChannelsProviders = providers.filter((p) =>
    p.name.toLowerCase().includes(channelsSearch.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[500px] md:h-[600px] font-sans">
      
      {/* Sidebar Columns - Channels List switcher */}
      <div className="md:col-span-4 bg-slate-50 border-r border-slate-200 flex flex-col justify-between">
        
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={channelsSearch}
              onChange={(e) => setChannelsSearch(e.target.value)}
              placeholder="Rechercher conversation..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-slate-900 focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>
        </div>

        {/* List items */}
        <div className="flex-grow overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
          {filteredChannelsProviders.map((p) => {
            const isSelected = selectedProv.id === p.id;
            const channelLastMsg = channels[p.id]?.[channels[p.id].length - 1];

            return (
              <button
                key={p.id}
                onClick={() => setSelectedProv(p)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition cursor-pointer relative ${
                  isSelected ? "bg-slate-900 text-white shadow-sm" : "hover:bg-slate-100/80 text-slate-800"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    p.isAvailable ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                  }`} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold truncate block">{p.name}</span>
                    <span className="text-[9px] text-slate-400 font-mono">09:04</span>
                  </div>
                  <p className={`text-[10px] truncate ${isSelected ? "text-slate-300" : "text-slate-500"} mt-0.5 font-mono`}>
                    {channelLastMsg ? channelLastMsg.text : "Ouvrir la conversation de liaison..."}
                  </p>
                </div>

                {isSelected && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Context Footer banner details inside channels column */}
        <div className="bg-slate-100 p-3 border-t border-slate-200 text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
            <span>Serveur de messagerie Sécurisé</span>
          </p>
        </div>

      </div>

      {/* Main Conversation Stream Feed Screen Area */}
      <div className="md:col-span-8 flex flex-col justify-between bg-white">
        
        {/* Header containing details of active artisan chat receptor */}
        <div className="px-5 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={selectedProv.avatar}
                alt={selectedProv.name}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover border border-slate-200"
              />
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-50 ${
                selectedProv.isAvailable ? "bg-emerald-500" : "bg-slate-300"
              }`} />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-sm">{selectedProv.name}</span>
                {selectedProv.verified && (
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full">✓ Agréé</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">
                {selectedProv.specialties[0]} • Inscription réglée: {selectedProv.hourlyRate.toLocaleString()} FCFA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => alert(`Lancement de l\'appel vocal crypté vers ${selectedProv.phone}... (Simulation OK)`)}
              className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-150 transition cursor-pointer"
              title="Passer un appel audio"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => alert("Simulation d\'appel vidéo : Caméra en attente de flux...")}
              className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-150 transition cursor-pointer"
              title="Lancer conférence vidéo"
            >
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Feed Canvas */}
        <div className="flex-grow p-4 md:p-5 overflow-y-auto space-y-4 bg-slate-50/40">
          <div className="max-w-md mx-auto text-center p-3 bg-amber-500/10 border border-amber-500/20 text-[10px] text-slate-600 font-mono uppercase tracking-wider rounded-xl">
            🔒 Discuter en toute sécurité. Les paiements ne sont finalisés qu\'avec votre code OTP Mobile Money.
          </div>

          {currentMessages.map((msg) => {
            const isMe = msg.sender === "client";
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2 animate-fade-in`}
              >
                {!isMe && (
                  <img
                    src={selectedProv.avatar}
                    alt="avatar"
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                )}

                <div className="flex flex-col max-w-[70%]">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? "bg-amber-500 text-slate-950 rounded-br-none font-medium"
                        : "bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    
                    {/* Render standard photo if the message is image category */}
                    {msg.isImage ? (
                      <div className="space-y-2">
                        <img
                          src={msg.imageUrl}
                          alt="technical attachment preview"
                          className="w-full h-32 rounded-xl object-cover hover:brightness-105 transition shadow-inner"
                        />
                        <span className="block italic text-[10px] text-slate-500">{msg.text}</span>
                      </div>
                    ) : msg.isAudio ? (
                      
                      /* Interactive voice waveform simulation block */
                      <div className="flex items-center gap-3 pb-1">
                        <button
                          onClick={() => {
                            if (isPlayingAudio === msg.id) {
                              setIsPlayingAudio(null);
                            } else {
                              setIsPlayingAudio(msg.id);
                              // Auto stop after 3s
                              setTimeout(() => setIsPlayingAudio(null), 3000);
                            }
                          }}
                          className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition ${
                            isPlayingAudio === msg.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {isPlayingAudio === msg.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-slate-800" />}
                        </button>
                        
                        <div className="flex items-end gap-0.5 h-6">
                          {[
                            4, 8, 12, 10, 16, 20, 12, 6, 8, 12, 18, 10, 4, 8, 14, 16, 8, 4
                          ].map((height, i) => (
                            <span
                              key={i}
                              className={`w-0.75 bg-slate-900 rounded-full transition-all duration-300 ${
                                isPlayingAudio === msg.id ? "animate-pulse" : ""
                              }`}
                              style={{ height: `${(height / 20) * 100}%` }}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono font-bold">{msg.audioDuration}</span>
                      </div>

                    ) : (
                      <span>{msg.text}</span>
                    )}

                  </div>

                  <div className={`flex items-center gap-1 mt-1 text-[9px] text-slate-400 ${isMe ? "self-end" : "self-start"}`}>
                    <Clock className="w-2.5 h-2.5" />
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing simulation indicator bar */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex items-center gap-2 justify-start"
              >
                <img
                  src={selectedProv.avatar}
                  alt="artisan avatar status"
                  ref={chatEndRef}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover shrink-0"
                />
                <div className="bg-slate-100 border border-slate-200 py-2.5 px-4 rounded-2xl rounded-bl-none flex items-center gap-1.5 text-[10px] text-slate-500 font-mono shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="ml-1 font-bold">{selectedProv.name.split(" ")[0]} tape un message...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={chatEndRef} />
        </div>

        {/* Input Text Box Actions panel */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-slate-50 flex items-stretch gap-2">
          
          <div className="flex-grow flex items-center bg-white border border-slate-200 rounded-2xl px-3 outline-none focus-within:ring-2 focus-within:ring-amber-500">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Écrivez un message technique à l\'artisan..."
              className="w-full bg-transparent border-none text-xs md:text-sm py-3 outline-none text-slate-900"
            />
            
            {/* Quick action buttons representing attachment and image selectors */}
            <div className="flex items-center gap-1 border-l border-slate-100 pl-2">
              <button
                type="button"
                onClick={() => handleSendImageClip("https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&h=200&fit=crop")}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Attacher la photo du problème technique"
              >
                <Image className="w-4.5 h-4.5" />
              </button>
              
              <button
                type="button"
                onClick={handleSendVoiceClip}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Enregistrer un message vocal"
              >
                <Mic className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white font-bold p-3 md:px-5.5 rounded-2xl transition shadow-sm flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Send className="w-4 w-4 text-white hover:text-slate-950" />
          </button>
        </form>

      </div>

    </div>
  );
}
