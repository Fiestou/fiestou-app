import Api from "@/src/services/api";
import Template from "@/src/template";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import ButtonLoader from "@/src/components/utils/ButtonLoader";
import { Button, Label } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Img from "@/src/components/utils/ImgBase";

const FormInitialType = {
  sended: false,
  action: "auth/pre-register",
  loading: false,
  redirect: "/entregador/cadastro",
};

export default function SejaEntregador() {
  const api = new Api();
  const router = useRouter();

  const [collapseFaq, setCollapseFaq] = useState(0);

  const [form, setForm] = useState(FormInitialType);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setForm({ ...form, loading: true });

    const data: any = await api.bridge({
      method: "post",
      url: form.action,
      data: {
        ...form,
        name: name,
        email: email,
        details: { phone: phone },
        person: "delivery",
      },
    });

    if (data.response) {
      router.push({
        pathname: form.redirect,
        query: { ref: data.hash },
      });
    } else {
      setForm({ ...form, sended: data.response });
    }
  };

  return (
    <Template
      header={{
        template: "default",
        position: "",
        background: "bg-purple-600",
      }}
    >
      <section className="bg-purple-600 relative">
        <Img
          size="7xl"
          src="/images/fiestou-desenho-principal.png"
          className="absolute inset-0 object-cover w-full h-full top-0 left-0"
        />
        <div className="absolute inset-0 w-full h-full top-0 left-0 bg-zinc-900 opacity-40"></div>
        <div className="container-medium relative pt-16 pb-14 text-white">
          <div className="flex">
            <div className="w-full">
              <h1 className="font-title font-bold text-5xl mb-4">
                Não perca tempo!
                <br /> Entre na plataforma
              </h1>
              <div className="text-3xl font-semibold">
                Clicou, Marcou, Fiestou!
              </div>
            </div>
            <div className="w-full max-w-[26rem] mb-10">
              <form
                onSubmit={(e) => {
                  handleSubmit(e);
                }}
                name="seja-entregador"
                id="seja-entregador"
                method="POST"
              >
                <div className="bg-white text-zinc-900 rounded-2xl p-8 grid gap-6">
                  <div>
                    <h2 className="font-bold font-title text-3xl text-center pb-4">
                      Cadastre-se como entregador
                    </h2>
                    <div className="form-group">
                      <Label className="font-normal">Nome</Label>
                      <input
                        onChange={(e) => {
                          setName(e.target.value);
                        }}
                        type="text"
                        name="nome"
                        className="form-control"
                        placeholder="Digite o nome completo"
                      />
                    </div>
                    <div className="form-group">
                      <Label className="font-normal">E-mail</Label>
                      <input
                        onChange={(e) => {
                          setEmail(e.target.value);
                        }}
                        type="text"
                        name="nome"
                        className="form-control"
                        placeholder="exemplo@email.com"
                      />
                    </div>
                    <div className="form-group">
                      <Label className="font-normal">Celular (com DDD)</Label>
                      <input
                        onChange={(e) => {
                          setPhone(e.target.value);
                        }}
                        type="text"
                        name="nome"
                        className="form-control"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="form-group text-zinc-500 py-1 text-sm leading-tight">
                      Termos de uso - Lorem ipsum dolor sit amet tetu. Sagittis
                      lectus morbvolutpat scelerisque.
                    </div>

                    <div className="form-group">
                      <button
                        type={`${form.loading ? "button" : "submit"}`}
                        className="btn bg-yellow-300 relative text-zinc-900"
                      >
                        <span className={`${form.loading ? "opacity-0" : ""}`}>
                          Cadastrar agora
                        </span>
                        {form.loading && <ButtonLoader />}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-medium">
          <div className="max-w-xl mx-auto text-center pb-14">
            <span>Como funciona</span>
            <h2 className="font-title text-zinc-900 font-bold text-5xl mt-2">
              Porque entregar com Fiestou
            </h2>
            <div className="pt-4">Lorem ipsum dolor sit amet consectetur.</div>
          </div>
          <div className="grid grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((item: any, key: any) => (
              <div key={key} className="border rounded-lg">
                <div className="aspect-video text-yellow-400 relative">
                  <Icon
                    icon="fa-cart-plus"
                    className="text-6xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  />
                  <Icon
                    icon="fa-cart-plus"
                    type="fa"
                    className="text-5xl mt-1 opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
                <div className="p-4 md:p-5 -mt-6">
                  <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">
                    Venda Online
                  </h3>
                  <div>
                    Lorem ipsum dolor sit amet consectetur. Sagittis lectus
                    morbi tristique risus volutpat scelerisque.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-14 pt-10">
        <div className="container-medium">
          <div className="grid lg:flex justify-center">
            <div className="w-full">
              <div className="max-w-xl pb-14">
                <span>Perguntas frequentes </span>
                <h2 className="font-title text-zinc-900 font-bold text-5xl mt-4">
                  Entenda como funciona
                </h2>
                <div className="pt-4">
                  Lorem ipsum dolor sit amet consectetur.
                </div>
                <Img src="/images/default-arrow.png" className="w-auto mt-8" />
              </div>
            </div>
            <div className="w-full lg:max-w-[40rem]">
              {[1, 2, 3, 4, 5].map((item: any, key: any) => (
                <div key={key} className="border-b py-4">
                  <div
                    onClick={() => setCollapseFaq(key)}
                    className="flex font-bold text-zinc-900 text-lg cursor-pointer"
                  >
                    <span className="w-full">
                      Perguntas - an tellus sed molestie aenean?
                    </span>
                    <div>
                      <Icon
                        icon="fa-chevron-down"
                        type="far"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  {collapseFaq == key && (
                    <div className="pt-4 text-sm leading-normal">
                      Lorem ipsum dolor sit amet consectetur. Eget metus elit
                      nunc metus. Duis morbi sollicitudin at dolor adipiscing
                      volutpat est mattis. Ac nulla pharetra velit quis cursus.
                      Sem nisi quis tincidunt suspendisse.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container-medium py-20">
          <div className="bg-zinc-100 rounded-xl grid lg:flex items-center">
            <div className="w-full grid gap-6 p-6 md:p-16 text-zinc-900">
              <h4 className="font-title font-bold max-w-[30rem] text-4xl">
                Tá na hora de fazer aquela grana extra!
              </h4>
              <div className="max-w-[24rem]">
                Lorem ipsum dolor sit amet consectetur. Sagittis lectus morbi
                tristique risus volutpat scelerisque.
              </div>
              <div className="pt-2">
                <Button href="#">Cadastrar agora</Button>
              </div>
            </div>
            <div className="w-full">
              <div className="aspect-video bg-zinc-200"></div>
            </div>
          </div>
        </div>
      </section>
    </Template>
  );
}
