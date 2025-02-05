// TODO: Check the code and fix the types
//@ts-nocheck
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { useEffect, useState } from "react";
import { Button, Input, Select, TextArea } from "@/src/components/ui/form";
import { NextApiRequest, NextApiResponse } from "next";
import Api from "@/src/services/api";
import { useRouter } from "next/router";
import { DayType, StoreType } from "@/src/models/store";
import Img from "@/src/components/utils/ImgBase";
import FileInput from "@/src/components/ui/form/FileInputUI";
import { getImage, getZipCode, justNumber } from "@/src/helper";
import HelpCard from "@/src/components/common/HelpCard";
import { RelationType } from "@/src/models/relation";
import Link from "next/link";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export async function getServerSideProps(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const api = new Api();
  let request: any = {};

  request = await api.call(
    {
      url: "request/graph",
      data: [
        {
          model: "page",
          filter: [
            {
              key: "slug",
              value: "store-custom",
              compare: "=",
            },
          ],
        },
      ],
    },
    req
  );

  const page = request?.data?.query?.page ?? [];
  const storeTypes = request?.data?.query.storeType ?? [];

  return {
    props: {
      page: page[0] ?? {},
      storeTypes: storeTypes,
    },
  };
}

const formInitial = {
  edit: "",
  loading: false,
};

const days = [
  { value: "Sunday", name: "Domingo" },
  { value: "Monday", name: "Segunda" },
  { value: "Tuesday", name: "Terça" },
  { value: "Wednesday", name: "Quarta" },
  { value: "Thursday", name: "Quinta" },
  { value: "Friday", name: "Sexta" },
  { value: "Saturday", name: "Sábado" },
  { value: "Holiday", name: "Feriados" },
];

export default function Loja({
  page,
  storeTypes,
}: {
  page: any;
  storeTypes: Array<RelationType>;
}) {
  const api = new Api();
  const router = useRouter();

  const [form, setForm] = useState(formInitial);
  const handleForm = (value: Object) => {
    setForm({ ...form, ...value });
  };

  const [week, setWeek] = useState([] as Array<DayType>);
  const handleWeek = (value: Object, day: string) => {
    let handle = store?.openClose ?? ([] as Array<DayType>);

    days.map(
      (item: any, key: any) =>
        item.value == day &&
        (handle[key] = { ...handle[key], ...value, day: day })
    );

    setWeek(handle);
    setStore({ ...store, openClose: handle });
  };

  const [handleCover, setHandleCover] = useState(
    {} as { preview: string; remove: number }
  );
  const [handleProfile, setHandleProfile] = useState(
    {} as {} as { preview: string; remove: number }
  );

  const [oldStore, setOldStore] = useState({} as StoreType);
  const [store, setStore] = useState({} as StoreType);
  const handleStore = async (value: Object) => {
    setStore({ ...store, ...value });
  };

  const getStore = async () => {
    let request: any = await api.bridge({
      url: "stores/form",
    });

    const handle = request.data ?? {};

    console.log(handle, "<<--");

    setOldStore(handle);

    setStore(handle);

    setWeek((handle?.openClose ?? []) as Array<DayType>);

    setHandleCover({
      remove: 0,
      preview: !!handle?.cover ? getImage(handle?.cover, "xl") : "",
    });

    setHandleProfile({
      remove: 0,
      preview: !!handle?.profile ? getImage(handle?.profile, "thumb") : "",
    });
  };

  // Handle COVER
  const handleCoverRemove = async (e: any) => {
    setHandleCover({
      preview: "",
      remove: store?.cover?.id ?? handleCover.remove,
    });

    handleStore({ cover: {} });
  };

  const handleCoverPreview = async (e: any) => {
    const file = e.target.files[0];

    const base64: any = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

    const fileData = { base64, fileName: file.name };

    setHandleCover({ ...handleCover, preview: fileData.base64 });

    return fileData;
  };

  const handleSubmitCover = async (e: any) => {
    e.preventDefault();

    handleForm({ loading: true });

    let coverValue = store?.cover;

    if (!!handleCover.remove) {
      const request = await api
        .media({
          dir: "store",
          app: store.id,
          index: store.id,
          method: "remove",
          medias: [handleCover.remove],
        })
        .then((res: any) => res);

      if (request.response && !!request.removed) {
        coverValue = {};
      }
    }

    if (!!store?.cover?.files) {
      const upload = await api
        .media({
          dir: "store",
          app: store.id,
          index: store.id,
          method: "upload",
          medias: [store?.cover?.files],
        })
        .then((data: any) => data);

      if (upload.response && !!upload.medias[0].status) {
        const media = upload.medias[0].media;
        media["details"] = JSON.parse(media.details);

        coverValue = {
          id: media.id,
          base_url: media.base_url,
          permanent_url: media.permanent_url,
          details: media.details,
          preview: media.base_url + media.details?.sizes["lg"],
        };
      }
    }

    handleStore({ cover: coverValue });

    const handle = {
      ...store,
      cover: coverValue,
    };

    const request: any = await api.bridge({
      url: "stores/register",
      data: handle,
    });

    if (request.response) {
      setStore(handle);
      setOldStore(Object.assign({}, handle));

      setHandleCover({
        preview: coverValue?.preview,
        remove: 0,
      });
    }

    handleForm({ edit: "", loading: false });
  };
  // ---

  // Handle PROFILE
  const handleProfileRemove = async (e: any) => {
    setHandleProfile({
      preview: "",
      remove: store?.profile?.id ?? handleProfile.remove,
    });

    handleStore({ profile: {} });
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

  const handleSubmitProfile = async (e: any) => {
    e.preventDefault();

    handleForm({ loading: true });

    let profileValue: any = store?.profile;

    console.log(profileValue);

    if (!!handleProfile.remove) {
      const request = await api
        .media({
          dir: "store",
          app: store.id,
          index: store.id,
          method: "remove",
          medias: [handleProfile.remove],
        })
        .then((res: any) => res);

      if (request.response && !!request.removed) {
        profileValue = {};
      }
    }

    if (!!store?.profile?.files) {
      const upload = await api
        .media({
          dir: "store",
          app: store.id,
          index: store.id,
          method: "upload",
          medias: [store?.profile?.files],
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

    handleStore({ profile: profileValue });

    const handle = {
      ...store,
      profile: profileValue,
    };

    const request: any = await api.bridge({
      url: "stores/register",
      data: handle,
    });

    if (request.response) {
      setStore(handle);
      setOldStore(Object.assign({}, handle));

      setHandleProfile({
        preview: profileValue?.preview,
        remove: 0,
      });
    }

    handleForm({ edit: "", loading: false });
  };
  // ---

  const handleZipCode = async (zipCode: string) => {
    const location = await getZipCode(zipCode);

    if (!!location) {
      let address = store;

      address["zipCode"] = justNumber(zipCode);
      address["street"] = location.logradouro;
      address["neighborhood"] = location.bairro;
      address["city"] = location.localidade;
      address["state"] = location.uf;
      address["country"] = "Brasil";

      setStore(address);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    handleForm({ loading: true });

    console.log(store);

    const request: any = await api.bridge({
      url: "stores/register",
      data: store,
    });

    if (request.response) {
      setOldStore(store);
      handleStore(store);
    }

    handleForm({ edit: "", loading: false });
  };

  const renderAction = (
    name: string,
    label?: { edit?: string; save?: string; cancel?: string }
  ) => {
    return form.edit == name ? (
      <div className="flex gap-4">
        <Button
          onClick={(e: any) => {
            handleForm({ edit: "" });
            setStore(oldStore);
            setHandleCover({
              preview: oldStore?.cover?.preview ?? "",
              remove: 0,
            });
          }}
          type="button"
          style="btn-transparent"
        >
          {label?.cancel ? label.cancel : <Icon icon="fa-undo" />}
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
          setStore(oldStore);
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

  useEffect(() => {
    if (!!window) {
      getStore();
    }
  }, []);

  return (
    !router.isFallback && (
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
          <div className="container-medium pt-12">
            <div className="pb-4">
              <Breadcrumbs
                links={[
                  { url: "/painel", name: "Painel" },
                  { url: "/painel/loja", name: "Personalizar loja" },
                ]}
              />
            </div>
            <div className="grid md:flex gap-4 items-center w-full">
              <div className="w-full flex items-center">
                <Link passHref href="/painel">
                  <Icon
                    icon="fa-long-arrow-left"
                    className="mr-6 text-2xl text-zinc-900"
                  />
                </Link>
                <div className="text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                  <span className="font-title font-bold">
                    Personalizar loja
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="pt-6">
          <div className="container-medium pb-12">
            <div className="grid lg:flex gap-10 lg:gap-20">
              <div className="w-full grid gap-8 border-t pt-6">
                {/* CAPA */}
                <form
                  onSubmit={(e: any) => handleSubmitCover(e)}
                  method="POST"
                  acceptCharset="UTF-8"
                  encType="multipart/form-data"
                  className="grid gap-2 border-b pb-8 mb-0"
                >
                  <div className="flex items-center pb-2">
                    <div className="w-full">
                      <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
                        Imagem de capa
                      </h4>
                    </div>
                    <div className="w-fit">{renderAction("cover")}</div>
                  </div>
                  {form.edit == "cover" ? (
                    <FileInput
                      name="cover"
                      id="cover"
                      onChange={async (e: any) => {
                        handleStore({
                          cover: {
                            files: await handleCoverPreview(e),
                          },
                        });
                      }}
                      aspect="aspect-[6/2.5]"
                      loading={form.loading}
                      remove={(e: any) => handleCoverRemove(e)}
                      preview={handleCover.preview}
                    />
                  ) : (
                    <div className="aspect-[6/2.5] relative rounded-xl overflow-hidden bg-zinc-100">
                      {!!handleCover.preview ? (
                        <Img
                          src={handleCover.preview}
                          className={`${
                            form.loading ? "blur-lg" : ""
                          } absolute object-cover h-full inset-0 w-full`}
                        />
                      ) : (
                        <Icon
                          icon="fa-image"
                          className="text-7xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25"
                        />
                      )}
                    </div>
                  )}
                  <div className="text-sm">
                    Tamanho mínimo recomendado: 1024 x 480px - Formatos
                    recomendados: PNG, JPEG
                  </div>
                </form>
                {/* PERFIL */}
                <form
                  onSubmit={(e: any) => handleSubmitProfile(e)}
                  method="POST"
                  acceptCharset="UTF-8"
                  encType="multipart/form-data"
                  className="grid gap-4 border-b pb-8 mb-0"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-[5rem]">
                      {form.edit == "profile" ? (
                        <FileInput
                          name="profile"
                          id="profile"
                          onChange={async (e: any) => {
                            handleStore({
                              profile: {
                                files: await handleProfilePreview(e),
                              },
                            });
                          }}
                          rounded
                          placeholder="Abrir"
                          aspect="aspect-square"
                          loading={form.loading}
                          remove={(e: any) => handleProfileRemove(e)}
                          preview={handleProfile.preview}
                        />
                      ) : (
                        <>
                          {!!handleProfile.preview ? (
                            <div className="aspect-square border-zinc-900 border-2 relative rounded-full overflow-hidden">
                              <Img
                                src={handleProfile.preview}
                                className={`${
                                  form.loading ? "blur-lg" : ""
                                } absolute object-cover h-full inset-0 w-full`}
                              />
                            </div>
                          ) : (
                            <div className="aspect-square border-zinc-900 text-zinc-900 border-2 relative rounded-full overflow-hidden">
                              <Icon
                                icon="fa-user"
                                className="text-4xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="w-fit">
                      {renderAction("profile", {
                        save: "Enviar",
                        edit: "Alterar foto de perfil",
                      })}
                    </div>
                  </div>
                </form>
                {/* TITULO */}
                <form
                  onSubmit={(e: any) => handleSubmit(e)}
                  method="POST"
                  className="grid gap-4 border-b pb-8 mb-0"
                >
                  <div className="flex items-center">
                    <div className="w-full">
                      <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
                        Nome do estabelecimento
                      </h4>
                    </div>
                    <div className="w-fit">{renderAction("title")}</div>
                  </div>
                  <div className="w-full">
                    {form.edit == "title" ? (
                      <Input
                        onChange={(e: any) =>
                          handleStore({ title: e.target.value })
                        }
                        value={store?.title}
                        placeholder="Digite o nome aqui"
                      />
                    ) : (
                      oldStore?.title ?? "Informe o nome da sua loja"
                    )}
                  </div>
                </form>
                {/* DESCRICAO */}
                <form
                  onSubmit={(e: any) => handleSubmit(e)}
                  method="POST"
                  className="grid gap-4 border-b pb-8 mb-0"
                >
                  <div className="flex items-center">
                    <div className="w-full">
                      <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
                        Descrição
                      </h4>
                    </div>
                    <div className="w-fit">{renderAction("description")}</div>
                  </div>
                  <div className="w-full">
                    {form.edit == "description" ? (
                      <TextArea
                        onChange={(e: any) =>
                          handleStore({ description: e.target.value })
                        }
                        value={store?.description}
                        placeholder="Digite sua descrição aqui"
                      />
                    ) : (
                      oldStore?.description ??
                      "Insira uma descrição para sua loja"
                    )}
                  </div>
                </form>
                {/* EMPRESA */}
                <form
                  onSubmit={(e: any) => handleSubmit(e)}
                  method="POST"
                  className="grid gap-4 border-b pb-8 mb-0"
                >
                  <div className="flex items-center">
                    <div className="w-full">
                      <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
                        Empresa
                      </h4>
                    </div>
                    <div className="w-fit">{renderAction("business")}</div>
                  </div>
                  <div className="w-full">
                    {form.edit == "business" ? (
                      <div className="grid gap-2">
                        <Input
                          name="cnpj"
                          onChange={(e: any) =>
                            handleStore({
                              document: justNumber(e.target.value),
                            })
                          }
                          required
                          value={store?.document}
                          placeholder="CNPJ"
                        />
                        <Input
                          name="nome"
                          onChange={(e: any) =>
                            handleStore({ companyName: e.target.value })
                          }
                          required
                          value={store?.companyName}
                          placeholder="Nome jurídico"
                        />
                      </div>
                    ) : store?.document || store?.companyName ? (
                      <>
                        <div>CNPJ: {store?.document}</div>
                        <div>Nome jurídico: {store?.companyName}</div>
                      </>
                    ) : (
                      "Insira os dados da empresa"
                    )}
                  </div>
                </form>
                {/* HORARIO */}
                <form
                  onSubmit={(e: any) => handleSubmit(e)}
                  method="POST"
                  className="grid gap-4 border-b pb-8 mb-0"
                >
                  <div className="flex items-center">
                    <div className="w-full">
                      <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
                        Horário de atendimento
                      </h4>
                    </div>
                    <div className="w-fit">{renderAction("openClose")}</div>
                  </div>
                  <div className="w-full">
                    {form.edit == "openClose" ? (
                      <div className="grid gap-2">
                        {!!days.length &&
                          days.map((day: any, key: any) => (
                            <div
                              key={key}
                              className="flex items-center gap-4 text-sm"
                            >
                              <div className="w-1/6">{day.name}:</div>
                              <div className="w-1/6 border-b border-zinc-900">
                                <Input
                                  type="time"
                                  value={week[key]?.open}
                                  onChange={(e: any) =>
                                    handleWeek(
                                      { open: e.target.value },
                                      day.value
                                    )
                                  }
                                  className="p-0 border-0"
                                />
                              </div>
                              <div className="md:px-2 text-xs">até</div>
                              <div className="w-1/6 border-b border-zinc-900">
                                <Input
                                  type="time"
                                  value={week[key]?.close}
                                  onChange={(e: any) =>
                                    handleWeek(
                                      { close: e.target.value },
                                      day.value
                                    )
                                  }
                                  className="p-0 border-0"
                                />
                              </div>
                              <label className="text-xs flex gap-2 pl-2">
                                <input
                                  type="checkbox"
                                  onChange={(e: any) =>
                                    handleWeek(
                                      { working: e.target.value },
                                      day.value
                                    )
                                  }
                                  {...(week[key]?.working == "on"
                                    ? { checked: true }
                                    : {})}
                                />
                                aberto
                              </label>
                            </div>
                          ))}
                      </div>
                    ) : !!week.length ? (
                      <div className="text-sm">
                        {week.map((day: any, key: any) => (
                          <div key={key} className="grid grid-cols-6">
                            <div>{week[key]?.day}</div>
                            {week[key]?.working != "on" ? (
                              <>
                                <div className="text-center">fechado</div>
                                <div className="text-center">--</div>
                                <div className="text-center">--</div>
                              </>
                            ) : (
                              <>
                                <div className="text-center">
                                  {week[key]?.open}
                                </div>
                                <div className="text-center">até</div>
                                <div className="text-center">
                                  {week[key]?.close}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      "Informe um horário de funcionamento para sua loja"
                    )}
                  </div>
                </form>
                {/* ENDERECO */}
                <form
                  onSubmit={(e: any) => handleSubmit(e)}
                  method="POST"
                  className="grid gap-4 border-b pb-8 mb-0"
                >
                  <div className="flex items-center">
                    <div className="w-full">
                      <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
                        Localização
                      </h4>
                    </div>
                    <div className="w-fit">{renderAction("location")}</div>
                  </div>
                  <div className="w-full">
                    {form.edit == "location" ? (
                      <div className="grid gap-2">
                        <Input
                          name="cep"
                          onChange={(e: any) => handleZipCode(e.target.value)}
                          required
                          value={store?.zipCode}
                          placeholder="CEP"
                        />
                        <div className="flex gap-2">
                          <div className="w-full">
                            <Input
                              name="rua"
                              readonly
                              required
                              value={store?.street}
                              placeholder="Rua"
                            />
                          </div>
                          <div className="w-[10rem]">
                            <Input
                              name="numero"
                              onChange={(e: any) =>
                                handleStore({ number: e.target.value })
                              }
                              required
                              value={store?.number}
                              placeholder="Número"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-full">
                            <Input
                              name="bairro"
                              readonly
                              required
                              value={store?.neighborhood}
                              placeholder="Bairro"
                            />
                          </div>
                          <div className="w-full">
                            <Input
                              name="complemento"
                              onChange={(e: any) =>
                                handleStore({ complement: e.target.value })
                              }
                              value={store?.complement}
                              placeholder="Complemento"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-full">
                            <Input
                              name="cidade"
                              readonly
                              required
                              value={store?.city}
                              placeholder="Cidade"
                            />
                          </div>
                          <div className="w-[10rem]">
                            <Input
                              name="estado"
                              readonly
                              required
                              value={store?.state}
                              placeholder="UF"
                            />
                          </div>
                        </div>
                      </div>
                    ) : store?.zipCode ? (
                      <>
                        <div>
                          {store.street}, {store.number}
                        </div>
                        <div>
                          {store.neighborhood} - {store.city} | {store.state}
                        </div>
                        <div>
                          CEP: {store.zipCode} | {store.country}
                        </div>
                      </>
                    ) : (
                      "Informe a localização da sua loja"
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
                        Segmento
                      </h4>
                    </div>
                    <div className="w-fit">{renderAction("segment")}</div>
                  </div>
                  <div className="w-full">
                    {form.edit == "segment" ? (
                      <Select
                        onChange={(e: any) =>
                          handleStore({ segment: e.target.value })
                        }
                        value={store?.segment}
                        placeholder="Selecione seu segmento"
                        name="lojaTipo"
                        options={storeTypes.map((item: any) => {
                          return {
                            name: item.title,
                            value: item.id,
                          };
                        })}
                      />
                    ) : (
                      storeTypes.filter((item) => item.id == store?.segment)[0]
                        ?.title ?? "Informe o segmento da sua loja"
                    )}
                  </div>
                </form>
                {/*  */}
              </div>
              <div className="w-full md:max-w-[18rem] lg:max-w-[24rem]">
                <HelpCard list={page.help_list} />
              </div>
            </div>
          </div>
        </section>
      </Template>
    )
  );
}
