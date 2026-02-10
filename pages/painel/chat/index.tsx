import { useEffect, useState } from "react";
import { MessageSquare, Send, Search } from "lucide-react";
import { PainelLayout, PageHeader, EmptyState } from "@/src/components/painel";

interface MessageType {
  user: string;
  from: string;
  date: string;
  text: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [message, setMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [searchChat, setSearchChat] = useState("");

  const contacts = [
    { id: 1, name: "Suporte Fiestou", lastMessage: "Como podemos ajudar?", time: "Agora" },
  ];

  const filteredContacts = contacts.filter(
    (c) => !searchChat || c.name.toLowerCase().includes(searchChat.toLowerCase())
  );

  const sendMessage = (e: any) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      { user: "Voce", from: "me", date: new Date().toISOString(), text: message },
    ]);
    setMessage("");
  };

  useEffect(() => {
    const el = document.getElementById("chat-container");
    if (el) el.scrollTop = el.scrollHeight;
  });

  return (
    <PainelLayout>
      <PageHeader title="Chat" description="Converse com seus clientes" />

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
        <div className="flex h-full">
          <div className="w-80 border-r border-zinc-200 flex flex-col">
            <div className="p-3 border-b border-zinc-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-400"
                  placeholder="Buscar conversa..."
                  value={searchChat}
                  onChange={(e) => setSearchChat(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredContacts.length === 0 ? (
                <div className="p-4 text-center text-sm text-zinc-400">
                  Nenhuma conversa
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedChat(contact.id)}
                    className={`p-3 flex items-center gap-3 cursor-pointer transition-colors border-b border-zinc-50 ${
                      selectedChat === contact.id
                        ? "bg-yellow-50 border-l-2 border-l-yellow-400"
                        : "hover:bg-zinc-50"
                    }`}
                  >
                    <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center text-zinc-500">
                      <MessageSquare size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm text-zinc-900 truncate">
                          {contact.name}
                        </span>
                        <span className="text-xs text-zinc-400 whitespace-nowrap ml-2">
                          {contact.time}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate">{contact.lastMessage}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {selectedChat == null ? (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  icon={<MessageSquare size={32} />}
                  title="Selecione uma conversa"
                  description="Escolha um contato para iniciar"
                />
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-zinc-200 bg-zinc-50">
                  <h3 className="font-semibold text-zinc-900 text-sm">
                    {contacts.find((c) => c.id === selectedChat)?.name}
                  </h3>
                </div>

                <div
                  id="chat-container"
                  className="flex-1 overflow-y-auto p-4 space-y-3"
                >
                  {messages.length === 0 && (
                    <div className="text-center text-sm text-zinc-400 py-8">
                      Nenhuma mensagem ainda
                    </div>
                  )}
                  {messages.map((msg, key) => (
                    <div
                      key={key}
                      className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-xl px-4 py-2.5 text-sm ${
                          msg.from === "me"
                            ? "bg-yellow-100 text-zinc-900"
                            : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={sendMessage}
                  className="p-3 border-t border-zinc-200 flex gap-2"
                >
                  <input
                    type="text"
                    className="flex-1 px-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-400"
                    placeholder="Digite sua mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
                  >
                    <Send size={14} />
                    Enviar
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </PainelLayout>
  );
}
