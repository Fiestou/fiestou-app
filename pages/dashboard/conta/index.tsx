import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { useState } from "react";
import { Button, Input, Select, TextArea } from "@/src/components/ui/form";
import { NextApiRequest, NextApiResponse } from "next";
import Api from "@/src/services/api";
import { useRouter } from "next/router";
import { UserType } from "@/src/models/user";
import Img from "@/src/components/utils/ImgBase";
import FileInput from "@/src/components/ui/form/FileInputUI";
import { getExtenseData } from "@/src/helper";

export async function getServerSideProps(req: any, res: any) {
  const api = new Api();

  let user = JSON.parse(req.req.cookies["fiestou.user"]);

  const request: any = await api.bridge(
    {
      url: "users/get",
      data: {
        ref: user.email,
      },
    },
    req
  );

  return {
    props: {
      user: request?.data ?? {},
    },
  };
}

const formInitial = {
  edit: "",
  loading: false,
};

export default function Conta({ user }: any) {
  const api = new Api();
  const router = useRouter();

  const [form, setForm] = useState(formInitial);
  const handleForm = (value: Object) => {
    setForm({ ...form, ...value });
  };

  const [content, setContent] = useState(user as UserType);
  const handleContent = async (value: Object) => {
    setContent({ ...content, ...value });
  };

  const handleSubmit = async (e: any, value?: any, detail?: boolean) => {
    e.preventDefault();

    handleForm({ loading: true });

    const handle = {
      ...content,
      id: user.id,
    };

    const request: any = await api.bridge({
      url: "users/update",
      data: handle,
    });

    if (request.response) {
      user[form.edit] = handle;
    }

    handleForm({ edit: "", loading: false });
  };

  const renderAction = (
    name: string,
    label?: { edit?: string; save?: string; cancel?: string }
  ) => {
    return form.edit == name ? (
      <div className="flex gap-10">
        <Button
          onClick={(e: any) => {
            handleForm({ edit: "" });
            setContent(user);
          }}
          type="button"
          style="btn-link"
        >
          {label?.cancel ? label.cancel : "Cancelar"}
        </Button>
        <Button
          loading={form.edit == name && form.loading}
          className="py-2 px-4"
        >
          {label?.save ? label.save : "Salvar"}
        </Button>
      </div>
    ) : !form.loading ? (
      <Button
        onClick={(e: any) => {
          handleForm({ edit: name });
          setContent(user);
        }}
        type="button"
        style="btn-link"
      >
        {label?.edit ? label.edit : "Editar"}
      </Button>
    ) : (
      <button type="button" className="p-0 font-bold opacity-50">
        {label?.edit ? label.edit : "Editar"}
      </button>
    );
  };

  return (
    !router.isFallback && (
      <Template
        header={{
          template: "dashboard",
          position: "solid",
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
              Conta para resgate
            </div>
          </div>
        </section>
        <section className="">
          <div className="container-medium pb-12">
            <div className="flex gap-20">
              <div className="w-full grid gap-8">
                <form
                  onSubmit={(e: any) => handleSubmit(e, content?.name)}
                  method="POST"
                  className="grid gap-4 border-b pb-8 mb-0"
                >
                  <div className="flex items-center">
                    <div className="w-full">
                      <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
                        Nome completo
                      </h4>
                    </div>
                    <div className="w-fit">{renderAction("name")}</div>
                  </div>
                  <div className="w-full">
                    {form.edit == "name" ? (
                      <Input
                        onChange={(e: any) =>
                          handleContent({ name: e.target.value })
                        }
                        value={content?.name}
                        placeholder="Digite o nome aqui"
                      />
                    ) : (
                      content?.name ?? "Informe seu nome"
                    )}
                  </div>
                </form>
              </div>
              <div className="w-full max-w-[24rem]">
                <div className="rounded-2xl border p-8">
                  Acompanhe sua entrega
                </div>
              </div>
            </div>
          </div>
        </section>
      </Template>
    )
  );
}
