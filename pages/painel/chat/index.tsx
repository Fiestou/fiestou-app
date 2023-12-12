import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import UserEdit from "@/src/components/shared/UserEdit";
import { useRouter } from "next/router";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import HelpCard from "@/src/components/common/HelpCard";
import { Button } from "@/src/components/ui/form";
import { useEffect, useState } from "react";

export async function getServerSideProps(ctx: any) {
  const api = new Api();

  return {
    props: {},
  };
}

interface MessageType {
  user: string;
  from: string;
  date: string;
  text: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Array<MessageType>>([
    {
      user: "Rafael Nascimento",
      from: "me",
      date: "2023-04-29",
      text: "Lorem ipsum dolor sit amet consectetur. Cursus a amet stibulum",
    },
    {
      user: "Pedro",
      from: "their",
      date: "2023-04-29",
      text: "Lorem ipsum dolor sit amet consectet sus a amet stibulum",
    },
    {
      user: "Rafael Nascimento",
      from: "me",
      date: "2023-04-29",
      text: "Lorem ipsum dolor sit amet consectetur. A amet stibulum",
    },
    {
      user: "Rafael Nascimento",
      from: "me",
      date: "2023-04-29",
      text: "Lorem ipsum dolor sit amet consectetur. A amet stibulum",
    },
    {
      user: "Pedro",
      from: "their",
      date: "2023-04-29",
      text: "Lorem ipsum dolor sit amet consectetur. Cursus a amet stibulum ipsum dolor sit amet consectetur. Cursus a amet stibulum",
    },
    {
      user: "Rafael Nascimento",
      from: "me",
      date: "2023-04-29",
      text: "Lorem ipsum dolor sit amet consectetur. Cursus a amet",
    },
  ]);
  const [message, setMessage] = useState("");

  const sendMessage = (e: any) => {
    e.preventDefault();

    let chat = messages;

    chat.push({
      user: "Rafael Nascimento",
      from: "me",
      date: "2023-04-29",
      text: message ?? "",
    });

    setMessages(chat);
    setMessage("");
  };

  useEffect(() => {
    if (!!document) {
      const chatContainer = document.getElementById("chat-container");
      if (chatContainer) chatContainer.scrollTop = chatContainer?.scrollHeight;
    }
  });

  return (
    <Template
      header={{
        template: "painel",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      <section className="">
        <div className="container-medium py-12">
          <div className="flex">
            <div className="w-full">Produtos {">"} Title</div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="underline">Precisa de ajuda?</div>{" "}
              <Icon icon="fa-question-circle" />
            </div>
          </div>
          <div className="font-title font-bold text-4xl flex gap-4 items-center mt-10 text-zinc-900">
            Chat
          </div>
        </div>
      </section>
      <section className="">
        <div className="container-medium pb-12">
          <div className="flex gap-16">
            <div className="w-full max-w-[24rem] border border-zinc-400 rounded-lg p-5">
              <div className="w-full relative overflow-hidden border border-zinc-400 rounded-lg mb-5">
                <input
                  type="text"
                  name=""
                  className="w-full p-3 text-sm"
                  placeholder="O que você precisa?"
                />
                <button className="bg-yellow-300 absolute top-0 right-0 h-full px-3 text-zinc-900">
                  <Icon icon="fa-search" className="text-xl mx-1 mt-1" />
                </button>
              </div>
              {[1, 2, 3, 4].map((item, key) => (
                <div
                  key={key}
                  className="p-3 flex items-center border-t cursor-pointer hover:bg-zinc-50 gap-4 ease"
                >
                  <div className="bg-zinc-100 p-5 rounded-full relative"></div>
                  <div className="w-full">
                    <h6 className="text-zinc-900 font-semibold">Pedro</h6>
                    <div className="flex text-sm">
                      <div className="w-full text-zinc-400">
                        Última mensagem recebida
                      </div>
                      <div className="w-fit whitespace-nowrap">34 min</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full">
              <div
                id="chat-container"
                className="relative overflow-y-auto flex flex-wrap gap-4 items-baseline min-h-[50vh] max-h-[20rem] pb-4"
              >
                {messages.map((message, key) => (
                  <div
                    key={key}
                    className={`${
                      message.from == "me" ? "flex justify-end" : ""
                    } w-full`}
                  >
                    <div
                      className={`${
                        message.from == "me"
                          ? "bg-zinc-100"
                          : "border border-zinc-300"
                      } p-5 rounded-xl max-w-xl`}
                    >
                      <div
                        dangerouslySetInnerHTML={{ __html: message.text }}
                      ></div>
                      <div className="text-right pt-4 text-sm">20:40</div>
                    </div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => sendMessage(e)}
                className="flex border border-zinc-400 rounded-lg"
              >
                <div className="w-full grid">
                  <textarea
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-full p-5 bg-transparent"
                    placeholder="Mensagem"
                    value={message}
                    required
                  ></textarea>
                </div>
                <div>
                  <button className="p-4 text-zinc-800">Enviar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Template>
  );
}
