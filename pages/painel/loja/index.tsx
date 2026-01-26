//@ts-nocheck
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import React, { useEffect, useState } from "react";
import { Button, Input, Select, TextArea } from "@/src/components/ui/form";
import { NextApiRequest, NextApiResponse } from "next";
import Api from "@/src/services/api";
import { useRouter } from "next/router";
import { Cover, DayType, StoreType } from "@/src/models/store";
import Img from "@/src/components/utils/ImgBase";
import FileInput from "@/src/components/ui/form/FileInputUI";
import { getImage, getZipCode, justNumber } from "@/src/helper";
import HelpCard from "@/src/components/common/HelpCard";
import { RelationType } from "@/src/models/relation";
import Link from "next/link";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import SelectDropdown from "../../../src/components/ui/form/SelectDropdown";
import MultiSelect from "../../../src/components/ui/form/MultiSelectUi";
import { useSegmentGroups } from "@/src/hooks/useSegmentGroups";

export async function getServerSideProps(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const api = new Api();

  let request: NextApiResponse = {};

  request = await api.call(
    {
      method: "post",
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
    req,
  );

  const page = request?.data?.query?.page ?? [];
  const storeTypes = request?.data?.query?.storeType ?? [];
  const handle = request.data ?? {};

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

const days: Record<string, string[]> = [
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
  page: interface;
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
      (item: string, key: string) =>
        item.value == day &&
        (handle[key] = { ...handle[key], ...value, day: day }),
    );
    setWeek(handle);
    setStore({ ...store, openClose: handle });
  };

  const [handleCover, setHandleCover] = useState(
    {} as { preview: string; remove: number },
  );
  const [handleProfile, setHandleProfile] = useState(
    {} as {} as { preview: string; remove: number },
  );

  const {
    segments,
    loading: segmentsLoading,
    error: segmentsError,
  } = useSegmentGroups();
  const handleStore = async (value: Object) => {
    setStore({ ...store, ...value });
  };

  const [oldStore, setOldStore] = useState({} as StoreType);
  const [store, setStore] = useState({} as StoreType);

  const handleMinimumOrderEnabled = (enabled: boolean) => {
    setStore({
      ...store,
      minimum_order: {
        enabled: enabled ? 1 : 0,
        value: enabled ? (store.minimum_order?.value ?? 0) : 0,
      },
    });
  };

  const handleMinimumOrderValue = (value: number) => {
    setStore({
      ...store,
      minimum_order: {
        ...store.minimum_order,
        value,
      },
    });
  };

  const getStore = async () => {
    let request: NextApiRequest = await api.bridge({
      method: "post",
      url: "stores/form",
    });

    const handle = request.data ?? {};

    // ✅ Normaliza minimum_order (pode vir string, objeto ou null)
    if (typeof handle.minimum_order === "string") {
      try {
        handle.minimum_order = JSON.parse(handle.minimum_order);
      } catch {
        handle.minimum_order = null;
      }
    }

    handle.minimum_order = handle.minimum_order ?? {
      enabled: 0,
      value: 0,
    };

    // ✅ Normaliza enabled (garante 0 ou 1)
    handle.minimum_order.enabled = handle.minimum_order.enabled ? 1 : 0;

    // ✅ Normaliza value para máscara BRL
    handle.minimum_order.value = handle.minimum_order.value
      ? Number(handle.minimum_order.value).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : "";

    // ✅ Delivery regions
    handle.deliveryRegions = handle.zipcode_cities_ranges?.map(
      (item: { zipcode_cities_range_id: number }) =>
        item.zipcode_cities_range_id,
    );

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

  const handleCoverRemove = async (e: React.FormEvent) => {
    setHandleCover({
      preview: "",
      remove: store?.cover?.id ?? handleCover.remove,
    });

    handleStore({ cover: {} });
  };

  const handleCoverPreview = async (e: React.FormEvent) => {
    const file = e.target.files[0];

    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

    const fileData = { base64, fileName: file.name };

    setHandleCover({ ...handleCover, preview: fileData.base64 });

    return fileData;
  };

  const handleSubmitCover = async (e: React.FormEvent) => {
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
        .then((res: NextApiResponse) => res);

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
        .then((data: NextApiResponse) => data);

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

    const request: NextApiResponse = await api.bridge({
      method: "post",
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

  const handleProfileRemove = async (e: React.FormEvent) => {
    setHandleProfile({
      preview: "",
      remove: store?.profile?.id ?? handleProfile.remove,
    });

    handleStore({ profile: {} });
  };

  const handleProfilePreview = async (e: React.FormEvent) => {
    const file = e.target.files[0];

    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

    const fileData = { base64, fileName: file.name };

    setHandleProfile({ ...handleProfile, preview: fileData.base64 });

    return fileData;
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    handleForm({ loading: true });

    let profileValue: Array<string> = store?.profile;

    if (!!handleProfile.remove) {
      const request = await api
        .media({
          dir: "store",
          app: store.id,
          index: store.id,
          method: "remove",
          medias: [handleProfile.remove],
        })
        .then((res: NextApiResponse) => res);

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
        .then((data: NextApiResponse) => data);

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

    const request: NextApiResponse = await api.bridge({
      method: "post",
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

  const handleSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    handleForm({ loading: true });

    const request: NextApiResponse = await api.bridge({
      method: "post",
      url: "stores/register",
      data: payload,
    });

    if (request.response) {
      setOldStore(store);
      handleStore(store);
    }

    handleForm({ edit: "", loading: false });

    await api.request({
      method: "PUT",
      url: `app/zipcode-cities-range-stores/${store?.id}`,
      data: {
        ids: store?.deliveryRegions,
      },
    });
  };

  const renderAction = (
    name: string,
    label?: { edit?: string; save?: string; cancel?: string },
  ) => {
    return form.edit == name ? (
      <div className="flex gap-4">
        <Button
          onClick={(e: React.FormEvent) => {
            handleForm({ edit: "" });
            setStore(oldStore);
            setHandleCover({
              preview: oldStore?.cover?.preview ?? "",
              remove: 0,
            });
          }}
          type="button"
          variant="danger"
          className="py-2 px-4"
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
        onClick={(e: React.FormEvent) => {
          handleForm({ edit: name });
          setStore(oldStore);
        }}
        type="button"
        className="!py-2 !px-4"
      >
        Editar
        <Icon icon="fa-pen" type="far" />
      </Button>
    ) : (
      <button type="button" className="p-0 font-bold opacity-50">
        Editar
        <Icon icon="fa-pen" type="far" />
      </button>
    );
  };

  const [deliveryRegionsOptions, setDeliveryRegionsOptions] = useState([]);

  function moneyBRToNumber(value?: string | number) {
    if (value === null || value === undefined) return 0;

    if (typeof value === "number") return value;

    if (typeof value !== "string") return 0;

    const onlyNumbers = value.replace(/\D/g, "");

    if (!onlyNumbers) return 0;

    return Number(onlyNumbers) / 100;
  }

  const payload = {
    ...store,

    // Frete
    default_delivery_fee: moneyBRToNumber(store?.default_delivery_fee),

    // Pedido mínimo
    minimum_order: {
      enabled: store?.minimum_order?.enabled ? 1 : 0,
      value: moneyBRToNumber(store?.minimum_order?.value),
    },
  };

  const maskMoneyBR = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, "");

    if (!onlyNumbers) return "";

    const number = parseInt(onlyNumbers, 10);

    const formatted = (number / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return formatted;
  };

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await api.request({
          method: "get",
          url: "app/zipcode-cities-range",
        });
        setDeliveryRegionsOptions(
          (response?.data?.data || []).map((region) => ({
            value: region.id,
            name: `${region.name} (${region.start} - ${region.finish})`,
          })),
        );
      } catch (e) {
        setDeliveryRegionsOptions([]);
      }
    };
    fetchRegions();
  }, []);

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
                  onSubmit={(e: React.FormEvent) => handleSubmitCover(e)}
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
                      onChange={async (
                        e: React.ChangeEvent<HTMLInputElement>,
                      ) => {
                        handleStore({
                          cover: {
                            files: await handleCoverPreview(e),
                          },
                        });
                      }}
                      aspect="aspect-[6/2.5]"
                      loading={form.loading}
                      remove={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleCoverRemove(e)
                      }
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
                  onSubmit={(e: React.FormEvent) => handleSubmitProfile(e)}
                  method="POST"
                  acceptCharset="UTF-8"
                  encType="multipart/form-data"
                  className="grid gap-4 border-b pb-8 mb-0"
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="w-[5rem]">
                      {form.edit == "profile" ? (
                        <FileInput
                          name="profile"
                          id="profile"
                          onChange={async (
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
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
                          remove={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleProfileRemove(e)
                          }
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
                {/* Titulo da empresa */}
                <form
                  onSubmit={(e: React.FormEvent) => handleSubmit(e)}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleStore({ title: e.target.value })
                        }
                        value={store?.title}
                        placeholder="Digite o nome aqui"
                      />
                    ) : (
                      (oldStore?.title ?? "Informe o nome da sua loja")
                    )}
                  </div>
                </form>
                {/* Descrição da empresa */}
                <form
                  onSubmit={(e: React.FormEvent) => handleSubmit(e)}
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
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          handleStore({ description: e.target.value })
                        }
                        value={store?.description}
                        placeholder="Digite sua descrição aqui"
                      />
                    ) : (
                      (oldStore?.description ??
                      "Insira uma descrição para sua loja")
                    )}
                  </div>
                </form>
                {/* Dados da empresa*/}
                <form
                  onSubmit={(e: React.FormEvent) => handleSubmit(e)}
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
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                {/* HORARIO de atendimento */}
                <form
                  onSubmit={(e: React.FormEvent) => handleSubmit(e)}
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
                          days.map((day: string, key: string) => (
                            <div
                              key={key}
                              className="flex items-center gap-4 text-sm"
                            >
                              <div className="w-1/6">{day.name}:</div>
                              <div className="w-1/6 border-b border-zinc-900">
                                <Input
                                  type="time"
                                  value={week[key]?.open}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                  ) =>
                                    handleWeek(
                                      { open: e.target.value },
                                      day.value,
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
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                  ) =>
                                    handleWeek(
                                      { close: e.target.value },
                                      day.value,
                                    )
                                  }
                                  className="p-0 border-0"
                                />
                              </div>
                              <label className="text-xs flex gap-2 pl-2">
                                <input
                                  type="checkbox"
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                  ) =>
                                    handleWeek(
                                      { working: e.target.value },
                                      day.value,
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
                        {week.map((day: string, key: string) => (
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
                  onSubmit={(e: React.FormEvent) => handleSubmit(e)}
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
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleZipCode(e.target.value)
                          }
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
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                              ) => handleStore({ number: e.target.value })}
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
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                              ) => handleStore({ complement: e.target.value })}
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
                {/* SEGMENTO */}
                {/* SEGMENTO */}
                <form
                  onSubmit={(e) => handleSubmit(e)}
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
                      segmentsLoading ? (
                        <div className="text-sm text-zinc-500">
                          Carregando segmentos...
                        </div>
                      ) : segmentsError ? (
                        <div className="text-sm text-red-500">
                          {segmentsError}
                        </div>
                      ) : (
                        <Select
                          onChange={(e) =>
                            handleStore({ segment: e.target.value })
                          }
                          value={store?.segment}
                          placeholder="Selecione seu segmento"
                          name="lojaTipo"
                          options={segments.map((item) => ({
                            name: item.name,
                            value: item.id,
                          }))}
                        />
                      )
                    ) : (
                      (segments.find((item) => item.id == store?.segment)
                        ?.name ?? "Informe o segmento da sua loja")
                    )}
                  </div>
                </form>

                {/* Valores de entrega */}
                <form
                  onSubmit={(e: React.FormEvent) => handleSubmit(e)}
                  method="POST"
                  className="grid gap-4 border-b pb-8 mb-0"
                >
                  <div className="flex items-center">
                    <div className="w-full">
                      <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
                        Valores de entrega
                      </h4>
                    </div>
                    <div className="w-fit">{renderAction("frete")}</div>
                  </div>
                  <div className="w-full">
                    {form.edit == "frete" ? (
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <label className="font-medium">
                            Você possui serviço de entrega?
                          </label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="is_delivery_fee_active"
                                value="1"
                                checked={!!store?.is_delivery_fee_active}
                                onChange={(e) =>
                                  handleStore({
                                    is_delivery_fee_active: Number(
                                      e.target.value,
                                    ),
                                  })
                                }
                              />
                              <span>Sim</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="is_delivery_fee_active"
                                value="0"
                                checked={!store?.is_delivery_fee_active}
                                onChange={(e) =>
                                  handleStore({
                                    is_delivery_fee_active: Number(
                                      e.target.value,
                                    ),
                                  })
                                }
                              />
                              <span>Não</span>
                            </label>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <label className="font-medium">
                            Valor do KM rodado
                          </label>
                          <div className="relative">
                            <Input
                              type="text"
                              className="w-full"
                              value={store?.default_delivery_fee}
                              onChange={(e) =>
                                handleStore({
                                  default_delivery_fee: maskMoneyBR(
                                    e.target.value,
                                  ),
                                })
                              }
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 cursor-help group">
                              <Icon
                                icon="fa-info-circle"
                                className="text-zinc-400"
                              />
                              <div className="absolute hidden group-hover:block right-0 bg-zinc-800 text-white p-2 rounded text-sm w-48">
                                Valor cobrado por quilômetro rodado na entrega
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <label className="font-medium">
                            Região de atendimento
                          </label>
                          <MultiSelect
                            name="deliveryRegions"
                            placeholder="Selecione as regiões"
                            value={store?.deliveryRegions}
                            onChange={(values) =>
                              handleStore({ deliveryRegions: values })
                            }
                            options={deliveryRegionsOptions}
                            className="min-h-[46px] relative"
                            isMulti={true}
                          />
                        </div>
                      </div>
                    ) : oldStore?.is_delivery_fee_active ? (
                      <div className="text-sm grid gap-1">
                        <div>
                          Entrega ativa:{" "}
                          <strong>
                            {oldStore.is_delivery_fee_active ? "Sim" : "Não"}
                          </strong>
                        </div>

                        {oldStore.default_delivery_fee && (
                          <div>
                            Valor por KM:{" "}
                            <strong>
                              {moneyBRToNumber(
                                oldStore.default_delivery_fee,
                              ).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </strong>
                          </div>
                        )}

                        {!!oldStore.deliveryRegions?.length && (
                          <div>
                            Regiões:{" "}
                            <strong>
                              {oldStore.deliveryRegions.length} selecionadas
                            </strong>
                          </div>
                        )}
                      </div>
                    ) : (
                      "Informe as regras do frete"
                    )}
                  </div>
                </form>
                {/* PEDIDO MINIMO */}
                <form
                  onSubmit={(e: React.FormEvent) => handleSubmit(e)}
                  method="POST"
                  className="grid gap-4 border-b pb-8 mb-0"
                >
                  {/* Header */}
                  <div className="flex items-center">
                    <div className="w-full">
                      <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
                        Pedido mínimo
                      </h4>
                    </div>
                    <div className="w-fit">{renderAction("minimum_order")}</div>
                  </div>

                  {/* Conteúdo */}
                  <div className="w-full">
                    {form.edit === "minimum_order" ? (
                      <div className="grid gap-4">
                        {/* Ativar pedido mínimo */}
                        <div className="grid gap-2">
                          <label className="font-medium">
                            Deseja ativar pedido mínimo?
                          </label>

                          <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="minimum_order_enabled"
                                value="1"
                                checked={!!store?.minimum_order?.enabled}
                                onChange={() =>
                                  handleStore({
                                    minimum_order: {
                                      ...store.minimum_order,
                                      enabled: 1,
                                    },
                                  })
                                }
                              />
                              <span>Sim</span>
                            </label>

                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="minimum_order_enabled"
                                value="0"
                                checked={!store?.minimum_order?.enabled}
                                onChange={() =>
                                  handleStore({
                                    minimum_order: {
                                      ...store.minimum_order,
                                      enabled: 0,
                                      value: 0,
                                    },
                                  })
                                }
                              />
                              <span>Não</span>
                            </label>
                          </div>
                        </div>

                        {/* Valor mínimo */}
                        {!!store?.minimum_order?.enabled && (
                          <div className="grid gap-2">
                            <label className="font-medium">
                              Valor mínimo do pedido
                            </label>

                            <div className="relative">
                              <Input
                                type="text"
                                className="input w-full"
                                value={store?.minimum_order?.value ?? ""}
                                onChange={(e) =>
                                  handleStore({
                                    minimum_order: {
                                      ...store.minimum_order,
                                      value: maskMoneyBR(e.target.value),
                                    },
                                  })
                                }
                                placeholder="Ex: R$ 50,00"
                              />

                              <div className="absolute right-2 top-1/2 -translate-y-1/2 cursor-help group">
                                <Icon
                                  icon="fa-info-circle"
                                  className="text-zinc-400"
                                />
                                <div className="absolute hidden group-hover:block right-0 bg-zinc-800 text-white p-2 rounded text-sm w-48">
                                  Valor mínimo para liberar o pedido
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {oldStore?.minimum_order?.enabled ? (
                          <span>
                            Pedido mínimo cadastrado:{" "}
                            <strong>
                              {moneyBRToNumber(
                                oldStore?.minimum_order?.value,
                              ).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </strong>
                          </span>
                        ) : (
                          <span>Pedido mínimo desativado</span>
                        )}
                      </>
                    )}
                  </div>
                </form>
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
