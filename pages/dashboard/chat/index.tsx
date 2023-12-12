import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export default function Chat() {
  return (
    <Template
      header={{
        template: "dashboard",
        position: "solid",
      }}
    >
      <section className="">
        <div className="container-medium py-12">
          <div className="pb-4">
            <Breadcrumbs
              links={[
                { url: "/dashboard", name: "Dashboard" },
                { url: "/dashboard/chat", name: "Chat" },
              ]}
            />
          </div>
          <div className="flex items-center">
            <Link passHref href="/dashboard">
              <Icon
                icon="fa-long-arrow-left"
                className="mr-6 text-2xl text-zinc-900"
              />
            </Link>
            <div className="font-title font-bold text-3xl md:text-4xl flex gap-4 items-center text-zinc-900 w-full">
              Chat
            </div>
          </div>
        </div>
      </section>
      <section className="">
        <div className="container-medium pb-12">
          <div className="flex gap-20">
            <div className="w-full grid gap-8">
              <div className="">
                <h4 className="text-xl md:text-2xl text-zinc-800 mb-6">
                  Em andamento
                </h4>
                <div className="grid gap-4">
                  <div className="flex items-center gap-6">
                    <div className="w-fit">
                      <div className="aspect-square bg-zinc-200 w-[5rem] rounded-full"></div>
                    </div>
                    <div className="w-full">Circus - Festas e locações</div>
                    <div className="w-fit">
                      <Link
                        href="/dashboard/pedidos/pedido"
                        className="text-zinc-900 underline whitespace-nowrap font-bold"
                      >
                        Ver conversa
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <hr />
              </div>
              <div>
                <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
                  Finalizados
                </h4>
              </div>
              {[1, 2, 3].map((item, key) => (
                <div
                  key={key}
                  className="flex items-center gap-6 border-b pb-8"
                >
                  <div className="w-fit">
                    <div className="aspect-square bg-zinc-200 w-[5rem] rounded-full"></div>
                  </div>
                  <div className="w-full">Circus - Festas e locações</div>
                  <div className="w-fit">
                    <Link
                      href="/dashboard/pedidos/pedido"
                      className="text-zinc-900 underline whitespace-nowrap font-bold"
                    >
                      Ver conversa
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full max-w-[24rem]">
              <div className="rounded-2xl border p-8">
                Faça todos os pagamentos através do Fiestou
              </div>
            </div>
          </div>
        </div>
      </section>
    </Template>
  );
}
