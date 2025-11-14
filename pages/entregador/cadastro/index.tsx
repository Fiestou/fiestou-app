import Api from "@/src/services/api";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import ButtonLoader from "@/src/components/utils/ButtonLoader";
import Link from "next/link";
import { Input, Label } from "@/src/components/ui/form";

const FormInitialType = {
  sended: false,
  action: "auth/pre-register",
  loading: false,
  redirect: "acesso",
};

export async function getServerSideProps(ctx: any) {
  const api = new Api();

  let { ref } = ctx.query;

  if (!!ref) {
    let user = {};

    const data: any = await api.bridge({
      method: "post",
      url: "auth/checkin",
      data: { ref: ref },
    });

    if (data.response && !!data.user) {
      user = data.user;

      return {
        props: {
          user: user,
        }, // will be passed to the page component as props
      };
    }
  }

  return {
    redirect: {
      permanent: false,
      destination: "/parceiros/seja-parceiro",
    },
  };
}

export default function Cadastro({ user }: any) {
  const api = new Api();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(FormInitialType);

  const [hash, setHash] = useState(user.hash ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState("");

  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");

  const [deliveryType, setDeliveryType] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setForm({ ...form, loading: true });

    const data: any = await api.bridge({
      method: "post",
      url: form.action,
      data: {
        ...form,
        hash: hash,
        name: name,
        email: email,
        person: "delivery",
        details: {
          phone: phone,
          cpf: cpf,
          rg: rg,
        },
      },
    });

    if (data.response && !!data.hash) {
      setStep(step + 1);
    }

    setForm({ ...form, sended: data.response, loading: false });
  };

  const backStep = (e: any) => {
    e.preventDefault();

    if (step == 1) {
      router.push({ pathname: "/entregador/seja-entregador" });
    } else {
      setStep(step - 1);
    }
  };

  return (
    <Template
      header={{
        template: "clean",
        position: "solid",
        background: "bg-zinc-900",
      }}
    >
      <div className="container-medium">
        <div className="grid grid-cols-4 py-6 md:py-20">
          <div>
            {step < 4 && (
              <button type="button" onClick={backStep}>
                <div className="flex items-center h-fit text-lg gap-2 text-zinc-900">
                  <Icon icon="fa-long-arrow-left" />
                  <div className="font-bold font-title">voltar</div>
                </div>
              </button>
            )}
          </div>
          <div className="col-span-2">
            <div className="max-w-md mx-auto">
              <form
                onSubmit={(e: any) => {
                  handleSubmit(e);
                }}
                method="POST"
              >
                {/* STEP1 */}
                <div
                  className={
                    step == 1 ? "block" : "absolute overflow-hidden h-0"
                  }
                >
                  <div className="text-center mb-4 md:mb-10">
                    <h3 className="font-title text-zinc-900 font-bold text-4xl text-center">
                      Que bom te ver aqui!
                    </h3>
                    <div className="pt-2">
                      Preencha as informações de cadastro da sua loja.
                    </div>
                  </div>

                  <div className="form-group">
                    <Label>Nome</Label>
                    <Input
                      onChange={(e: any) => setName(e.target.value)}
                      name="nome"
                      type="text"
                      value={name}
                      placeholder="Digite seu nome"
                    />
                  </div>

                  <div className="form-group">
                    <Label>CPF</Label>
                    <Input
                      onChange={(e: any) => setCpf(e.target.value)}
                      name="cpf"
                      type="text"
                      value={cpf}
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <div className="form-group">
                    <Label>RG</Label>
                    <Input
                      onChange={(e: any) => setRg(e.target.value)}
                      name="rg"
                      value={rg}
                      type="text"
                      placeholder="00.000.000-0"
                    />
                  </div>

                  <div className="form-group">
                    <Label>Celular (com DDD)</Label>
                    <Input
                      onChange={(e: any) => setPhone(e.target.value)}
                      name="celular"
                      value={phone}
                      type="text"
                      placeholder="Digite seu celular"
                    />
                  </div>

                  <div className="form-group">
                    <Label>E-mail</Label>
                    <Input
                      readOnly
                      name="email"
                      value={email}
                      type="text"
                      placeholder="Digite seu e-mail"
                    />
                  </div>

                  <div className="form-group">
                    <button
                      type={`${form.loading ? "button" : "submit"}`}
                      className="btn bg-yellow-300 relative text-zinc-900"
                    >
                      <span className={`${form.loading ? "opacity-0" : ""}`}>
                        Avançar
                      </span>
                      {form.loading && <ButtonLoader />}
                    </button>
                  </div>
                  <div className="text-center pt-4 text-sm">Etapa 1 de 4</div>
                </div>

                {/* STEP2 */}
                <div
                  className={
                    step == 2 ? "block" : "absolute overflow-hidden h-0"
                  }
                >
                  <div className="text-center mb-4 md:mb-10">
                    <h3 className="font-title text-zinc-900 font-bold text-4xl text-center">
                      Escolha as formas de entrega
                    </h3>
                    <div className="pt-2">Você pode escolher mais de uma.</div>
                  </div>

                  <div className="form-group">
                    <button
                      type={`${form.loading ? "button" : "submit"}`}
                      className="btn bg-yellow-300 relative text-zinc-900"
                    >
                      <span className={`${form.loading ? "opacity-0" : ""}`}>
                        Avançar
                      </span>
                      {form.loading && <ButtonLoader />}
                    </button>
                  </div>

                  <div className="text-center pt-4 text-sm">Etapa 2 de 4</div>
                </div>

                {/* STEP3 */}
                <div
                  className={
                    step == 3 ? "block" : "absolute overflow-hidden h-0"
                  }
                >
                  <div className="text-center mb-4 md:mb-10">
                    <h3 className="font-title text-zinc-900 font-bold text-4xl text-center">
                      Hora da selfie!
                    </h3>
                    <div className="pt-2">
                      Tire uma foto em um ambiente bem iluminado
                    </div>
                  </div>

                  <div className="form-group">
                    <button
                      type={`${form.loading ? "button" : "submit"}`}
                      className="btn bg-yellow-300 relative text-zinc-900"
                    >
                      <span className={`${form.loading ? "opacity-0" : ""}`}>
                        Avançar
                      </span>
                      {form.loading && <ButtonLoader />}
                    </button>
                  </div>
                  <div className="text-center pt-4 text-sm">Etapa 3 de 4</div>
                </div>

                {/* STEP4 */}
                <div
                  className={
                    step == 4 ? "block" : "absolute overflow-hidden h-0"
                  }
                >
                  <div className="text-center mb-4 md:mb-10">
                    <div className="relative text-6xl mb-6 text-yellow-300">
                      <Icon icon="fa-thumbs-up" />
                      <Icon
                        icon="fa-thumbs-up"
                        type="fa"
                        className="text-yellow-300 text-5xl absolute bottom-0 left-1/2 -translate-x-1/2 mb-1 opacity-50"
                      />
                    </div>
                    <h3 className="font-title text-zinc-900 font-bold text-4xl text-center">
                      Cadastro realizado :)
                    </h3>
                    <div className="pt-2 text-xl font-bold text-zinc-900">
                      Confira os próximos passos.
                    </div>

                    <div className="grid gap-6 my-8">
                      <div className="flex text-left gap-4">
                        <div>
                          <Icon
                            icon="fa-check"
                            type="fa"
                            className="text-yellow-400"
                          />
                        </div>
                        <div className="w-full">
                          Analisaremos o seu cadastro. Normalmente respondemos
                          em até 1 dia.
                        </div>
                      </div>

                      <div className="flex text-left gap-4">
                        <div>
                          <Icon
                            icon="fa-check"
                            type="fa"
                            className="text-yellow-400"
                          />
                        </div>
                        <div className="w-full">
                          Você receberá confirmação por e-mail junto com o
                          contrato.
                        </div>
                      </div>
                      <div className="flex text-left gap-4">
                        <div>
                          <Icon
                            icon="fa-check"
                            type="fa"
                            className="text-yellow-400"
                          />
                        </div>
                        <div className="w-full">
                          Depois de assinar o contrato, iremos te ajudar a
                          configurar a sua loja
                        </div>
                      </div>
                      <div className="flex text-left gap-4">
                        <div>
                          <Icon
                            icon="fa-check"
                            type="fa"
                            className="text-yellow-400"
                          />
                        </div>
                        <div className="w-full">
                          Para usar a loja você precisará escolher um dos
                          planos.
                        </div>
                      </div>
                      <div className="flex text-left gap-4">
                        <div>
                          <Icon
                            icon="fa-check"
                            type="fa"
                            className="text-yellow-400"
                          />
                        </div>
                        <div className="w-full">
                          Fique tranquilo, não possuímos fidelidade. Cancele o
                          plano quando desejar.
                        </div>
                      </div>
                    </div>

                    <div className="grid">
                      <Link
                        href="/"
                        className="btn bg-yellow-300 relative text-zinc-900"
                      >
                        Confirmar
                      </Link>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
}
