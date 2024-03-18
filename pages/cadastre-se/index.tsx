import Api from "@/src/services/api";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { encode as base64_encode, decode as base64_decode } from "base-64";
import { Button, Input, Label } from "@/src/components/ui/form";
import { RegisterUserMail } from "@/src/mail";

export async function getServerSideProps(ctx: any) {
  const api = new Api();

  let request: any = await api.call({
    url: "request/graph",
    data: [
      {
        model: "page",
        filter: [
          {
            key: "slug",
            value: "email",
            compare: "=",
          },
        ],
      },
    ],
  });

  // console.log(request, "<<");

  return {
    props: {
      page: request?.data?.query?.page[0] ?? {},
    },
  };
}

interface PageQueryType {
  ref?: string;
}

const FormInitialType = {
  sended: false,
  loading: false,
  redirect: "login",
};

export default function CadastreSe({ page }: { page: any }) {
  const api = new Api();
  const router = useRouter();

  const query: PageQueryType = router.query;

  const [form, setForm] = useState(FormInitialType);
  const [email, setEmail] = useState(base64_decode(query.ref ?? ""));
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [password, setPassword] = useState("");
  const [re_password, setRePassword] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setForm({ ...form, loading: true });

    const data: any = await api.bridge({
      url: "auth/register",
      data: {
        name: name,
        date: date,
        email: email,
        person: "client",
        password: password,
        re_password: re_password,
      },
    });

    if (data.response) {
      await RegisterUserMail(data.user, {
        subject: page["register_subject"],
        html: page["register_body"],
      });

      router.push({
        pathname: "/acesso",
        query: { modal: "register" },
      });
    } else {
      setForm({ ...form, sended: data.response });
    }
  };

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
            <Link passHref href="/acesso">
              <div className="flex items-center h-fit md:text-lg gap-2 text-zinc-900">
                <Icon icon="fa-long-arrow-left" />
                <div className="font-bold font-title">Voltar</div>
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
                  <h3 className="font-title text-zinc-900 font-bold text-4xl text-center">
                    Bem vindo ao Fiestou
                  </h3>
                  <div className="pt-2">
                    Entre na sua conta ou faça seu cadastro
                  </div>
                </div>

                <div className="form-group">
                  <Label>Nome</Label>
                  <Input
                    onChange={(e: any) => setName(e.target.value)}
                    type="text"
                    name="nome"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                {/* <div className="form-group">
                  <Label>Data de nascimento</Label>
                  <Input
                    onChange={(e: any) => setDate(e.target.value)}
                    type="date"
                    name="nascimento"
                    required
                  />
                </div> */}

                <div className="form-group">
                  <Label>E-mail</Label>
                  <Input
                    onChange={(e: any) => setEmail(e.target.value)}
                    value={email}
                    type="email"
                    name="email"
                    required
                  />
                </div>

                <div className="form-group">
                  <Label>Senha</Label>
                  <Input
                    onChange={(e: any) => setPassword(e.target.value)}
                    type="password"
                    name="senha"
                    required
                  />
                </div>

                <div className="form-group">
                  <Label>Confirme seu senha</Label>
                  <Input
                    onChange={(e: any) => setRePassword(e.target.value)}
                    type="password"
                    name="confirm_senha"
                    required
                  />
                </div>

                <div className="mt-4 text-sm leading-tight">
                  Termos de uso - Lorem ipsum dolor sit amet tetu. Sagittis
                  lectus morbvolutpat scelerisque.
                </div>

                <div className="form-group">
                  <Button loading={form.loading}>Cadastrar agora</Button>
                </div>

                <div className="text-center pt-4 text-sm">
                  Já possue cadastro na plataforma?
                  <br />
                  <Link
                    passHref
                    className="underline text-zinc-900"
                    href="/acesso"
                  >
                    Fazer Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
}
