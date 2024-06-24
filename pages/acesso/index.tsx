import Api from "@/src/services/api";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import { encode as base64_encode } from "base-64";
import { Button, Input, Label } from "@/src/components/ui/form";
import Modal from "@/src/components/utils/Modal";
import { UserType } from "@/src/models/user";
import NextAuth from "@/src/components/pages/acesso/NextAuth";
import { getSession } from "next-auth/react";

export async function getServerSideProps(ctx: any) {
  const api = new Api();

  const session: any = await getSession(ctx);

  if (!!session?.user?.email) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }

  let request: any = await api.content({ url: `default` });

  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  return {
    props: {
      modal: ctx.query?.modal ?? "",
      DataSeo: DataSeo,
      Scripts: Scripts,
    },
  };
}

const formInitial = {
  sended: false,
  loading: false,
  email: "",
};

export default function Acesso({
  modal,
  DataSeo,
  Scripts,
}: {
  modal?: string;
  DataSeo: any;
  Scripts: any;
}) {
  const api = new Api();

  const router = useRouter();

  const [modalStatus, setModalStatus] = useState(!!modal as boolean);
  const [modalType, setModalType] = useState(modal as string);
  const [user, setUser] = useState({} as UserType);

  const [form, setForm] = useState(formInitial);

  const setFormValue = (value: any) => {
    setForm({ ...form, ...value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setFormValue({ loading: true });

    const data: any = await api.bridge({
      method: "post",
      url: "auth/checkin",
      data: { ref: form.email },
    });

    if (data.response) {
      if (!!data?.user) {
        const handleUser = data?.user;

        setUser(handleUser);

        if (handleUser.person == "master") {
          router.push({
            pathname: "login/restrito",
            query: { ref: base64_encode(form.email) },
          });
        } else if (handleUser.status == 0) {
          setModalStatus(true);
          setModalType("confirm");

          setFormValue({
            sended: false,
            loading: false,
          });
        } else {
          router.push({
            pathname: "login",
            query: { ref: base64_encode(form.email) },
          });
        }
      } else {
        router.push({
          pathname: "cadastre-se",
          query: { ref: base64_encode(form.email) },
        });
      }
    } else {
      setFormValue({ sended: data.response });
    }
  };

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `Acesso | ${DataSeo?.site_text}`,
        url: `acesso`,
      }}
      header={{
        template: "clean",
        position: "solid",
        backHistory: "/",
      }}
      footer={{
        template: "clean",
      }}
    >
      <div className="container-medium">
        <div className="relative py-20">
          <div className="hidden md:block mb-10 lg:-mb-5">
            <Link passHref href="/">
              <div className="flex items-center h-fit md:text-lg gap-2 text-zinc-900">
                <Icon icon="fa-long-arrow-left" />
                <div className="font-bold font-title">voltar</div>
              </div>
            </Link>
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
                  <h3 className="font-title text-zinc-900 font-bold text-3xl md:text-4xl text-center">
                    Bem vindo ao Fiestou
                  </h3>
                  <div className="pt-2 text-sm md:text-base">
                    Entre na sua conta ou faça seu cadastro
                  </div>
                </div>

                <div className="form-group">
                  <Label>E-mail</Label>
                  <Input
                    onChange={(e: any) => {
                      setFormValue({ email: e.target.value });
                    }}
                    type="text"
                    name="email"
                    placeholder="Informe seu e-mail"
                    required
                  />
                </div>

                <div className="form-group">
                  <Button loading={form.loading}>Avançar</Button>
                </div>

                <div className="flex items-center gap-4 my-6">
                  <div className="border-t w-full"></div>
                  <div>OU</div>
                  <div className="border-t w-full"></div>
                </div>

                <div className="form-group">
                  <NextAuth />
                </div>

                <div className="hidden form-group text-center text-sm pt-4">
                  Quero se cadastrar como parceiro?{" "}
                  <Link
                    href="/parceiros/cadastro"
                    className="text-blue-400 underline"
                  >
                    Clique aqui
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Modal status={modalStatus} close={() => setModalStatus(false)} size="sm">
        <div className="text-center max-w-[20rem] mx-auto py-4 grid">
          <div className="relative mb-2">
            <Icon
              icon="fa-envelope-open-text"
              type="fa"
              className="text-[3.5rem] mt-1 text-yellow-300 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
            />
            <Icon
              icon="fa-envelope-open-text"
              className="text-6xl text-yellow-400 relative"
            />
          </div>
          <h4 className="font-title text-zinc-900 text-2xl md:text-3xl font-bold py-3">
            {modalType == "register"
              ? "Sua conta foi criada!"
              : "Confirme seu endereço de e-mail!"}
          </h4>
          <div className="py-2">
            {modalType == "register" ? (
              "Para fazer seu primeiro acesso, confirme seu cadastro através da mensagem que enviamos no e-mail cadastrado."
            ) : (
              <>
                Não recebeu o link? Verifique sua caixa de span, lixeira ou
                <Link
                  href="/recuperar"
                  className="text-cyan-500 underline px-2"
                >
                  recupere sua senha
                </Link>
                para receber o link novamente
              </>
            )}
          </div>
          <Button onClick={() => setModalStatus(false)} className="mt-6">
            Fazer login
          </Button>
        </div>
      </Modal>
    </Template>
  );
}
