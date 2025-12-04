import { Button } from "@/src/components/ui/form";
import { AuthContext } from "@/src/contexts/AuthContext";
import Template from "@/src/template";
import { useContext } from "react";

export default function Admin() {
  const {} = useContext(AuthContext);

  return (
    <Template
      header={{
        template: "admin",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      <section className="">
        <div className="container-medium py-14">
          <h1 className="font-title font-bold text-5xl flex gap-4 items-center mb-4 text-zinc-900">
            Olá, Pedro!
          </h1>
          <span>
            Seja bem-vindo ao painel administrativo. Aqui você pode gerenciar
            seu perfil, eventos, e muito mais.
          </span>
        </div>

        <div className="text-center mt-20">
          <div className="pt-4 md:pt-6">
            <Button
              href={`${process.env.APP_URL}/logout`}
              className="md:text-lg px-4 py-2 md:py-4 md:px-8"
            >
              Sair da conta
            </Button>
          </div>
        </div>
      </section>
    </Template>
  );
}
