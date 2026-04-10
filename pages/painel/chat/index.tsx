import { useEffect, useState } from "react";
import { MessageSquare, Send, Search, ArrowLeft } from "lucide-react";
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
      { user: "Você", from: "me", date: new Date().toISOString(), text: message },
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

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden min-h-[calc(100svh-180px)] md:min-h-0 md:h-[calc(100dvh-200px)]">
        <div className="flex h-full min-h-0">
          <div className={`${selectedChat != null ? "hidden md:flex" : "flex"} w-full md:w-80 border-r border-zinc-200 flex-col`}>
            <div className="border-b border-zinc-100 p-3">
              <div className="mb-3 rounded-2xl border border-yellow-200 bg-yellow-50/80 p-4 md:hidden">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-yellow-500 shadow-sm">
                    <MessageSquare size={18} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-zinc-900">
                      Fale com a Fiestou pelo painel
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-zinc-600">
                      Use esta área para centralizar dúvidas e manter o histórico da loja no celular.
                    </p>
                  </div>
                </div>
                <div className="mt-3 rounded-xl border border-white/70 bg-white px-3 py-2 text-xs leading-5 text-zinc-600">
                  {filteredContacts.length} conversa(s) disponível(is) neste momento.
                </div>
              </div>

              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-3 text-sm focus:outline-none focus:border-zinc-400"
                  placeholder="Buscar conversa..."
                  value={searchChat}
                  onChange={(e) => setSearchChat(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {filteredContacts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/70 p-6 text-center text-sm text-zinc-500">
                  Nenhuma conversa encontrada
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedChat(contact.id)}
                    className={`mb-3 flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors ${
                      selectedChat === contact.id
                        ? "border-yellow-300 bg-yellow-50 shadow-[0_0_0_1px_rgba(250,204,21,0.15)]"
                        : "border-zinc-200 bg-white hover:bg-zinc-50"
                    }`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                      <MessageSquare size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm text-zinc-900 truncate">
                          {contact.name}
                        </span>
                        <span className="ml-2 whitespace-nowrap text-xs text-zinc-400">
                          {contact.time}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500 truncate">
                        {contact.lastMessage}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={`${selectedChat == null ? "hidden md:flex" : "flex"} min-h-0 flex-1 flex-col`}>
            {selectedChat == null ? (
              <div className="flex flex-1 items-center justify-center p-4">
                <EmptyState
                  icon={<MessageSquare size={32} />}
                  title="Selecione uma conversa"
                  description="Escolha um contato para iniciar"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-4">
                  <button
                    type="button"
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-yellow-500 shadow-sm">
                    <MessageSquare size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-900">
                      {contacts.find((c) => c.id === selectedChat)?.name}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Atendimento pelo painel
                    </p>
                  </div>
                </div>

                <div
                  id="chat-container"
                  className="flex-1 space-y-3 overflow-y-auto bg-zinc-50/60 p-4"
                >
                  {messages.length === 0 && (
                    <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-500">
                        <MessageSquare size={18} />
                      </div>
                      <h4 className="mt-4 text-sm font-semibold text-zinc-900">
                        Nenhuma mensagem ainda
                      </h4>
                      <p className="mt-2 text-xs leading-5 text-zinc-500">
                        Envie a primeira mensagem para iniciar o atendimento desta conversa.
                      </p>
                    </div>
                  )}
                  {messages.map((msg, key) => (
                    <div
                      key={key}
                      className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                          msg.from === "me"
                            ? "bg-yellow-100 text-zinc-900"
                            : "bg-zinc-100 text-zinc-700"
                        } break-all`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={sendMessage}
                  className="border-t border-zinc-200 bg-white p-3 flex flex-col gap-2 sm:flex-row"
                >
                  <input
                    type="text"
                    className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:outline-none focus:border-zinc-400"
                    placeholder="Digite sua mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-yellow-500 sm:min-w-[120px]"
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
