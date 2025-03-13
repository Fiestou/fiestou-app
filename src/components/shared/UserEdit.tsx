import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { useState } from "react";
import { Button, Input, Select, TextArea } from "@/src/components/ui/form";
import Api from "@/src/services/api";
import { useRouter } from "next/router";
import { UserType } from "@/src/models/user";
import Img from "@/src/components/utils/ImgBase";
import FileInput from "@/src/components/ui/form/FileInputUI";
import { getExtenseData } from "@/src/helper";
import { formatName, formatPhone } from "src/components/utils/FormMasks";

const formInitial = {
  edit: "",
  loading: false,
};

export default function UserEdit({ user }: { user: UserType }) {
  const api = new Api();

  const [form, setForm] = useState(formInitial);
  const handleForm = (value: Object) => {
    setForm({ ...form, ...value });
  };

  const [oldUser, setOldUser] = useState(user as UserType);
  const [content, setContent] = useState(user as UserType);
  const handleContent = async (value: Object) => {
    setContent({ ...content, ...value });
  };

  const [handleProfile, setHandleProfile] = useState({
    remove: 0,
    preview: user?.profile?.preview ?? "",
  });

  const handleProfileRemove = async (e: any) => {
    setHandleProfile({
      preview: "",
      remove: content?.profile?.id ?? handleProfile.remove,
    });

    handleContent({ profile: {} });
  };

  const handleProfilePreview = async (e: any) => {
    const file = e.target.files[0];

    const base64: any = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

    const fileData = { base64, fileName: file.name };

    setHandleProfile({ ...handleProfile, preview: fileData.base64 });

    return fileData;
  };

  const handleSubmitFile = async (e: any) => {
    e.preventDefault();

    handleForm({ loading: true });

    let profileValue = content?.profile;

    if (!!handleProfile.remove) {
      const request = await api
        .media({
          dir: "user",
          app: user.id,
          index: user.id,
          method: "remove",
          medias: [handleProfile.remove],
        })
        .then((res: any) => res);

      if (request.response && !!request.removed) {
        profileValue = {};
      }
    }

    if (!!content?.profile?.files) {
      const upload = await api
        .media({
          dir: "user",
          app: user.id,
          index: user.id,
          method: "upload",
          medias: [content?.profile?.files],
        })
        .then((data: any) => data);

      if (upload.response && !!upload.medias[0].status) {
        const media = upload.medias[0].media;
        media["details"] = JSON.parse(media.details);

        profileValue = {
          id: media.id,
          base_url: media.base_url,
          permanent_url: media.permanent_url,
          details: media.details,
          preview: media.base_url + media.details?.sizes["lg"],
        };
      }
    }

    handleContent({ profile: profileValue });

    const handle = {
      ...content,
      profile: profileValue,
      id: user.id,
    };

    const request: any = await api.bridge({
      method: "post",
      url: "users/update",
      data: handle,
    });

    if (request.response) {
      setContent(handle);
      setOldUser(Object.assign({}, handle));

      setHandleProfile({
        preview: profileValue?.preview,
        remove: 0,
      });
    }

    handleForm({ edit: "", loading: false });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    handleForm({ loading: true });

    const handle: UserType = {
      ...content,
      id: user.id,
    };

    const request: any = await api.bridge({
      method: "post",
      url: "users/update",
      data: handle,
    });

    if (request.response) {
      setOldUser(handle);
      handleContent(handle);
    }

    handleForm({ edit: "", loading: false });
  };

  const renderAction = (
    name: string,
    label?: { edit?: string; save?: string; cancel?: string }
  ) => {
    return form.edit == name ? (
      <div className="flex gap-4 md:gap-10">
        <Button
          onClick={(e: any) => {
            handleForm({ edit: "" });
            setContent(oldUser);
            setHandleProfile({
              preview: oldUser?.profile?.preview ?? "",
              remove: 0,
            });
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
          setContent(oldUser);
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
    <>
      <form
        onSubmit={(e: any) => handleSubmit(e)}
        method="POST"
        className="grid gap-4 border-y py-8 my-0"
      >
        <div className="flex items-center">
          <div className="w-full">
            <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
              Nome completo
            </h4>
          </div>
          <div className="w-fit text-sm md:text-base">{renderAction("name")}</div>
        </div>
        <div className="w-full text-sm md:text-base">
          {form.edit == "name" ? (
            <input
              className="form-control"
              value={content?.name ?? ""}
              onChange={(e: any) => handleContent({ name: formatName(e.target.value) })}
              placeholder="Digite o nome aqui"
            />
          ) : (
            oldUser?.name ? formatName(oldUser.name) : "Informe seu nome"
          )}
        </div>
      </form>
      <form
        onSubmit={(e: any) => handleSubmit(e)}
        method="POST"
        className="grid gap-4 border-b pb-8 mb-0"
      >
        <div className="flex items-center">
          <div className="w-full">
            <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
              Endereço de email
            </h4>
          </div>
          <div className="w-fit text-sm md:text-base">
            {renderAction("email")}
          </div>
        </div>
        <div className="w-full text-sm md:text-base">
          {form.edit == "email" ? (
            <input
              className="form-control"
              onChange={(e: any) => handleContent({ email: e.target.value })}
              defaultValue={content?.email}
              placeholder="Digite o e-mail aqui"
            />
          ) : (
            oldUser?.email ?? "Informe seu e-mail"
          )}
        </div>
      </form>
      {/*  */}
      <form
        onSubmit={(e: any) => handleSubmit(e)}
        method="POST"
        className="grid gap-4 border-b pb-8 mb-0"
      >
        <div className="flex items-center">
          <div className="w-full">
            <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
              Data de Nascimento
            </h4>
          </div>
          <div className="w-fit text-sm md:text-base">
            {renderAction("date")}
          </div>
        </div>
        <div className="w-full text-sm md:text-base">
          {form.edit == "date" ? (
            <input
              className="form-control"
              type="date"
              onChange={(e: any) => handleContent({ date: e.target.value })}
              defaultValue={content?.date}
              placeholder="Digite a sua data de nascimento aqui"
            />
          ) : content?.date ? (
            getExtenseData(content?.date)
          ) : (
            "Informe sua data de nascimento"
          )}
        </div>
      </form>
      {/*  */}
      <form
        onSubmit={(e: any) => handleSubmit(e)}
        method="POST"
        className="grid gap-4 border-b pb-8 mb-0"
      >
        <div className="flex items-center">
          <div className="w-full">
            <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
              Sexo
            </h4>
          </div>
          <div className="w-fit text-sm md:text-base">
            {renderAction("gender")}
          </div>
        </div>
        <div className="w-full text-sm md:text-base">
          {form.edit == "gender" ? (
            <Select
              name="sexo"
              value={content?.gender}
              onChange={(e: any) => handleContent({ gender: e.target.value })}
              options={[
                {
                  name: "Masculino",
                  value: "male",
                },
                {
                  name: "Feminino",
                  value: "female",
                },
                {
                  name: "Outro",
                  value: "other",
                },
              ]}
            />
          ) : content?.gender == "male" ? (
            "Masculino"
          ) : content?.gender == "female" ? (
            "Feminino"
          ) : content?.gender == "other" ? (
            "Outro"
          ) : (
            "Insira seu sexo"
          )}
        </div>
      </form>
      {/*  */}
      <form
        onSubmit={(e: any) => handleSubmit(e)}
        method="POST"
        className="grid gap-4 border-b pb-8 mb-0"
      >
        <div className="flex items-center">
          <div className="w-full">
            <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
              Número de telefone
            </h4>
          </div>
          <div className="w-fit text-sm md:text-base">{renderAction("phone")}</div>
        </div>
        <div className="w-full text-sm md:text-base">
          {form.edit == "phone" ? (
            <input
              className="form-control"
              name="celular"
              value={content?.phone ?? ""}
              onChange={(e: any) => handleContent({ phone: formatPhone(e.target.value) })}
              placeholder="Digite o número de celular aqui"
            />
          ) : (
            oldUser?.phone ? formatPhone(oldUser.phone) : "Informe seu número de celular"
          )}
        </div>
      </form>
      {/* 
      <form
        onSubmit={(e: any) => handleSubmit(e)}
        method="POST"
        className="grid gap-4 border-b pb-8 mb-0"
      >
        <div className="flex items-center">
          <div className="w-full">
            <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
              Documento de identidade (RG)
            </h4>
          </div>
          <div className="w-fit text-sm md:text-base">{renderAction("rg")}</div>
        </div>
        <div className="w-full text-sm md:text-base">
          {form.edit == "rg" ? (
            <Input
              name="rg"
              onChange={(e: any) => handleContent({ rg: e.target.value })}
              value={content?.rg}
              placeholder="Digite o seu RG"
            />
          ) : (
            oldUser?.rg ?? "Informe seu RG"
          )}
        </div>
      </form>

      <form
        onSubmit={(e: any) => handleSubmit(e)}
        method="POST"
        className="grid gap-4 border-b pb-8 mb-0"
      >
        <div className="flex items-center">
          <div className="w-full">
            <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
              Cadastro de Pessoas Físicas (CPF)
            </h4>
          </div>
          <div className="w-fit text-sm md:text-base">
            {renderAction("cpf")}
          </div>
        </div>
        <div className="w-full text-sm md:text-base">
          {form.edit == "cpf" ? (
            <Input
              name="cpf"
              onChange={(e: any) => handleContent({ cpf: e.target.value })}
              value={content?.cpf}
              placeholder="Digite o seu CPF"
            />
          ) : (
            oldUser?.cpf ?? "Informe seu CPF"
          )}
        </div>
      </form>
      <form
        onSubmit={(e: any) => handleSubmit(e)}
        method="POST"
        className="grid gap-4 border-b pb-8 mb-0"
      >
        <div className="flex items-center">
          <div className="w-full">
            <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
              Contato de emergência
            </h4>
          </div>
          <div className="w-fit text-sm md:text-base">
            {renderAction("phoneSecondary")}
          </div>
        </div>
        <div className="w-full text-sm md:text-base">
          {form.edit == "phoneSecondary" ? (
            <Input
              name="contato"
              onChange={(e: any) =>
                handleContent({ phoneSecondary: e.target.value })
              }
              value={content?.phoneSecondary}
              placeholder="Digite um contato de emergência"
            />
          ) : (
            oldUser?.phoneSecondary ?? "Informe seu contato de emergência"
          )}
        </div>
      </form>
      */}
    </>
  );
}
