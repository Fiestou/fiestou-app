import { Button, Input, Label } from "@/src/components/ui/form";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Router from "next/router";
import { getSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import Api from "@/src/services/api";
import Cookies from "js-cookie";
import { UserType } from "@/src/models/user";
import { AuthContext } from "@/src/contexts/AuthContext";
import HCaptchaComponent from "@/src/components/utils/HCaptchaComponent";

export async function getServerSideProps(ctx: any) {
  const session: any = await getSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: "/acesso",
        permanent: false,
      },
    };
  }

  return {
    props: {
      auth: session.user,
    },
  };
}

export default function Completar({ auth }: any) {
  const { UserLogout } = useContext(AuthContext);

  const expires = { expires: 14 };

  const api = new Api();

  const [loading, setLoading] = useState(false as boolean);

  const [token, setToken] = useState("" as string);

  const [data, setData] = useState({} as any);
  const handleData = (value: any) => {
    setData({ ...data, ...value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setLoading(true);

    delete data["image"];

    const request: any = await api.bridge({
      method: 'post',
      url: "users/update",
      data: { ...data, origin: "complete" },
    });

    if (!!request.response) {
      const user: UserType = request.data;

      Cookies.set("fiestou.user", JSON.stringify(user), expires);

      window.location.href = "/painel";
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    setData(auth);
  }, [auth]);

  return (
    <Template
      header={{
        template: "clean",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      <div className="container-medium">
        <div className="relative py-6 md:py-20">
          <div className="mb-10 lg:-mb-5">
            <div
              onClick={() => UserLogout()}
              className="cursor-pointer flex items-center h-fit md:text-lg gap-2 text-zinc-900"
            >
              <Icon icon="fa-long-arrow-left" />
              <div className="font-bold font-title">voltar</div>
            </div>
          </div>
          <div className="">
            <div className="max-w-md mx-auto">
              <form
                onSubmit={(e) => {
                  handleSubmit(e);
                }}
                method="POST"
              >
                <div className="text-center mb-8 md:mb-10">
                  <h3 className="font-title text-zinc-900 font-bold text-4xl text-center">
                    Complete seu cadastro
                  </h3>
                  <div className="pt-2">
                    Insira as informações que faltam para o seu cadastro
                  </div>
                </div>

                <div className="form-group">
                  <Label>Nome</Label>
                  <Input
                    defaultValue={data.name}
                    onChange={(e: any) => handleData({ name: e.target.value })}
                    type="text"
                    name="nome"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="form-group">
                  <Label>E-mail</Label>
                  <Input
                    defaultValue={data.email}
                    type="email"
                    name="email"
                    readonly
                  />
                </div>

                <div className="form-group">
                  <Label>Celular</Label>
                  <Input
                    defaultValue={data.phone}
                    onChange={(e: any) => handleData({ phone: e.target.value })}
                    type="text"
                    name="celular"
                    required
                  />
                  <div className="text-sm">
                    * Usaremos seu contato apenas para notificações de pedidos.
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <HCaptchaComponent
                    onVerify={(token: string) => setToken(token)}
                  />
                </div>

                <div className="form-group">
                  <Button disable={!token} loading={loading}>
                    Cadastrar agora
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
}
