// src/pages/painel/loja.tsx
import React, { useEffect, useState } from "react";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { Button, Input, Select, TextArea } from "@/src/components/ui/form";
import Api from "@/src/services/api";
import { useRouter } from "next/router";
import Img from "@/src/components/utils/ImgBase";
import FileInput from "@/src/components/ui/form/FileInputUI";
import { getImage, getZipCode, justNumber } from "@/src/helper";
import HelpCard from "@/src/components/common/HelpCard";
import Link from "next/link";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import MultiSelect from "../../../src/components/ui/form/MultiSelectUi";

/* ---------------------------
   Types
   --------------------------- */

type Media = {
  id?: number;
  base_url?: string;
  permanent_url?: string;
  details?: {
    sizes?: Record<string, string>;
    [k: string]: any;
  };
  preview?: string;
  // adicionado: arquivo em memória durante upload
  files?: any;
};

export type DayType = {
  day: string;
  open?: string;
  close?: string;
  working?: "on" | "off" | string;
};

export type Cover = Media | Record<string, unknown> | null;

export type RelationType = {
  id: number;
  title: string;
  [k: string]: any;
};

export type StoreType = {
  id?: number;
  title?: string;
  description?: string;
  cover?: Cover;
  profile?: Cover;
  document?: string;
  companyName?: string;
  openClose?: DayType[];
  zipCode?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  segment?: number | string;
  is_delivery_fee_active?: number | boolean;
  default_delivery_fee?: string | number;
  deliveryRegions?: number[] | null;
  [k: string]: any;
};

type FormState = {
  edit: string;
  loading: boolean;
};

/* ---------------------------
   Constants
   --------------------------- */

const formInitial: FormState = {
  edit: "",
  loading: false,
};

const daysStatic: { value: string; name: string }[] = [
  { value: "Sunday", name: "Domingo" },
  { value: "Monday", name: "Segunda" },
  { value: "Tuesday", name: "Terça" },
  { value: "Wednesday", name: "Quarta" },
  { value: "Thursday", name: "Quinta" },
  { value: "Friday", name: "Sexta" },
  { value: "Saturday", name: "Sábado" },
  { value: "Holiday", name: "Feriados" },
];

/* ---------------------------
   Helper types for file preview
   --------------------------- */

type FilePreview = {
  base64: string;
  fileName: string;
};

/* ---------------------------
   Main component
   --------------------------- */

export default function Loja(): JSX.Element | null {
  const api = new Api();
  const router = useRouter();

  // page content & store types loaded from server via client fetch
  const [page, setPage] = useState<Record<string, any> | null>(null);
  const [storeTypes, setStoreTypes] = useState<RelationType[]>([]);

  const [form, setForm] = useState<FormState>(formInitial);
  const handleForm = (v: Partial<FormState>) =>
    setForm((s) => ({ ...s, ...v }));

  const [week, setWeek] = useState<DayType[]>([]);
  const [handleCover, setHandleCover] = useState<{
    preview: string;
    remove: number;
  }>({
    preview: "",
    remove: 0,
  });
  const [handleProfile, setHandleProfile] = useState<{
    preview: string;
    remove: number;
  }>({
    preview: "",
    remove: 0,
  });

  const [oldStore, setOldStore] = useState<StoreType>({});
  const [store, setStore] = useState<StoreType>({});
  const [groupOptions, setGroupOptions] = useState<any[]>([]);
  const [deliveryRegionsOptions, setDeliveryRegionsOptions] = useState<
    { value: number; name: string }[]
  >([]);

  /* ---------------------------
     Fetch initial page & storeTypes (previously getServerSideProps)
     --------------------------- */
  useEffect(() => {
    let mounted = true;
    const fetchRegions = async () => {
      try {
        const response = await api.request({
          method: "get",
          url: "app/zipcode-cities-range",
        });
        if (!mounted) return;
        const rows = ((response as any)?.data?.data ?? []) as any[];
        setDeliveryRegionsOptions(
          rows.map((region) => ({
            value: region.id,
            name: `${region.name} (${region.start} - ${region.finish})`,
          }))
        );
      } catch (e) {
        if (mounted) setDeliveryRegionsOptions([]);
      }
    };
    fetchRegions();
    return () => {
      mounted = false;
    };
  }, []);

  /* ---------------------------
     Fetch delivery regions options
     --------------------------- */
  useEffect(() => {
    let mounted = true;

    const fetchRegions = async () => {
      try {
        const response = await api.request({
          method: "get",
          url: "app/zipcode-cities-range",
        });

        if (!mounted) return;

        // cast seguro para any porque api.request tem tipagem genérica não inferida pelo TS aqui
        const respAny = response as any;

        // agora acessamos com segurança e fazemos fallback para array vazio
        const rows = (respAny?.data?.data ?? []) as any[];

        setDeliveryRegionsOptions(
          rows.map((region: any) => ({
            value: region.id,
            name: `${region.name} (${region.start} - ${region.finish})`,
          }))
        );
      } catch (e) {
        if (mounted) setDeliveryRegionsOptions([]);
      }
    };

    fetchRegions();

    return () => {
      mounted = false;
    };
  }, []);

  /* ---------------------------
     Load the store (client-side)
     --------------------------- */
  useEffect(() => {
    let mounted = true;
    const getStore = async () => {
      try {
        const request: any = await api.bridge({
          method: "post",
          url: "stores/form",
        });
        if (!mounted) return;

        const handle = request.data ?? ({} as any);

        // map deliveryRegions if present
        const deliveryRegions = Array.isArray(handle.zipcode_cities_ranges)
          ? handle.zipcode_cities_ranges.map(
              (it: any) => it.zipcode_cities_range_id
            )
          : handle.deliveryRegions ?? null;

        const normalizedStore: StoreType = {
          ...handle,
          deliveryRegions,
        };

        setOldStore(normalizedStore);
        setStore(normalizedStore);

        const openCloseArr = (handle?.openClose ?? []) as DayType[];
        setWeek(openCloseArr);

        setHandleCover({
          preview: !!handle?.cover ? getImage(handle?.cover, "xl") : "",
          remove: 0,
        });

        setHandleProfile({
          preview: !!handle?.profile ? getImage(handle?.profile, "thumb") : "",
          remove: 0,
        });
      } catch (err) {
        console.error("Erro ao carregar store:", err);
      }
    };

    getStore();
    return () => {
      mounted = false;
    };
  }, []);

  /* ---------------------------
     Safe store setter (immutability)
     --------------------------- */
  const handleStore = (value: Partial<StoreType>) => {
    setStore((prev) => ({ ...prev, ...value }));
  };

  /* ---------------------------
     File preview helpers
     --------------------------- */
  const fileToBase64 = (file: File): Promise<FilePreview> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () =>
        resolve({
          base64: String(reader.result ?? ""),
          fileName: file.name,
        });
      reader.onerror = (err) => reject(err);
    });

  /* ---------------------------
     Cover handlers
     --------------------------- */
  const handleCoverRemove = () => {
    const removeId =
      typeof store?.cover?.id === "number"
        ? store!.cover!.id!
        : handleCover.remove;
    setHandleCover({ preview: "", remove: removeId });
    handleStore({ cover: undefined });
  };

  const handleCoverPreview = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return null;
    const fileData = await fileToBase64(file);
    setHandleCover((prev) => ({ ...prev, preview: fileData.base64 }));
    return fileData;
  };

  const handleSubmitCover = async (e: React.FormEvent) => {
    e.preventDefault();
    handleForm({ loading: true });

    try {
      let coverValue: any = store?.cover ?? {};

      // remove existing
      if (handleCover.remove) {
        const request: any = await api.media({
          dir: "store",
          app: store.id,
          index: store.id,
          method: "remove",
          medias: [handleCover.remove],
        });
        if (request.response && request.removed) {
          coverValue = {};
        }
      }

      // upload new file if present
      if (store?.cover?.files) {
        const upload: any = await api.media({
          dir: "store",
          app: store.id,
          index: store.id,
          method: "upload",
          medias: [store.cover.files],
        });

        if (upload.response && !!upload.medias?.[0]?.status) {
          const media = upload.medias[0].media;
          // media.details sometimes is JSON string
          const detailsParsed =
            typeof media.details === "string"
              ? JSON.parse(media.details)
              : media.details;
          coverValue = {
            id: media.id,
            base_url: media.base_url,
            permanent_url: media.permanent_url,
            details: detailsParsed,
            preview: media.base_url + (detailsParsed?.sizes?.["lg"] ?? ""),
          };
        }
      }

      // persist cover on store
      handleStore({ cover: coverValue });
      const handlePayload = { ...store, cover: coverValue };

      const request: any = await api.bridge({
        method: "post",
        url: "stores/register",
        data: handlePayload,
      });

      if (request.response) {
        setStore(handlePayload);
        setOldStore({ ...handlePayload });
        setHandleCover({ preview: coverValue?.preview ?? "", remove: 0 });
      }
    } catch (err) {
      console.error("Erro submit cover:", err);
    } finally {
      handleForm({ edit: "", loading: false });
    }
  };

  /* ---------------------------
     Profile handlers
     --------------------------- */

  const handleProfileRemove = () => {
    const removeId =
      typeof store?.profile?.id === "number"
        ? store!.profile!.id!
        : handleProfile.remove;
    setHandleProfile({ preview: "", remove: removeId });
    handleStore({ profile: undefined });
  };

  const handleProfilePreview = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return null;
    const fileData = await fileToBase64(file);
    setHandleProfile((prev) => ({ ...prev, preview: fileData.base64 }));
    return fileData;
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    handleForm({ loading: true });

    try {
      let profileValue: any = store?.profile ?? {};

      if (handleProfile.remove) {
        const request: any = await api.media({
          dir: "store",
          app: store.id,
          index: store.id,
          method: "remove",
          medias: [handleProfile.remove],
        });
        if (request.response && request.removed) {
          profileValue = {};
        }
      }

      if (store?.profile?.files) {
        const upload: any = await api.media({
          dir: "store",
          app: store.id,
          index: store.id,
          method: "upload",
          medias: [store.profile.files],
        });

        if (upload.response && !!upload.medias?.[0]?.status) {
          const media = upload.medias[0].media;
          const detailsParsed =
            typeof media.details === "string"
              ? JSON.parse(media.details)
              : media.details;
          profileValue = {
            id: media.id,
            base_url: media.base_url,
            permanent_url: media.permanent_url,
            details: detailsParsed,
            preview: media.base_url + (detailsParsed?.sizes?.["lg"] ?? ""),
          };
        }
      }

      handleStore({ profile: profileValue });
      const handlePayload = { ...store, profile: profileValue };

      const request: any = await api.bridge({
        method: "post",
        url: "stores/register",
        data: handlePayload,
      });

      if (request.response) {
        setStore(handlePayload);
        setOldStore({ ...handlePayload });
        setHandleProfile({ preview: profileValue?.preview ?? "", remove: 0 });
      }
    } catch (err) {
      console.error("Erro submit profile:", err);
    } finally {
      handleForm({ edit: "", loading: false });
    }
  };

  /* ---------------------------
     Zipcode helper
     --------------------------- */

  const handleZipCode = async (zipCode: string) => {
    const location = await getZipCode(zipCode);
    if (!location) return;

    const normalized = {
      ...store,
      zipCode: justNumber(zipCode),
      street: location.logradouro,
      neighborhood: location.bairro,
      city: location.localidade,
      state: location.uf,
      country: "Brasil",
    };

    setStore(normalized);
  };

  /* ---------------------------
     General submit for sections
     --------------------------- */

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    handleForm({ loading: true });
    try {
      const payload: StoreType = { ...store };
      const request: any = await api.bridge({
        method: "post",
        url: "stores/register",
        data: payload,
      });

      if (request.response) {
        setOldStore(payload);
        setStore(payload);
      }

      // update zipcode-cities-range-stores mapping (if needed)
      try {
        await api.request({
          method: "PUT",
          url: `app/zipcode-cities-range-stores/${store?.id}`,
          data: { ids: store?.deliveryRegions ?? [] },
        });
      } catch (e) {
        // non blocking
        console.warn("Não foi possível atualizar deliveryRegions:", e);
      }
    } catch (err) {
      console.error("Erro handleSubmit:", err);
    } finally {
      handleForm({ edit: "", loading: false });
    }
  };

  /* ---------------------------
     Render helpers
     --------------------------- */

  const renderAction = (
    name: string,
    label?: { edit?: string; save?: string; cancel?: string }
  ) => {
    if (form.edit === name) {
      return (
        <div className="flex gap-4">
          <Button
            onClick={() => {
              handleForm({ edit: "" });
              setStore(oldStore);
              setHandleCover({
                preview:
                  typeof oldStore?.cover?.preview === "string"
                    ? oldStore.cover.preview
                    : "",
                remove: 0,
              });
            }}
            type="button"
            style="btn-transparent"
          >
            {label?.cancel ?? <Icon icon="fa-undo" />}
          </Button>
          <Button
            loading={form.edit === name && form.loading}
            className="py-2 px-4"
          >
            {label?.save ?? "Salvar"}
          </Button>
        </div>
      );
    }

    if (!form.loading) {
      return (
        <Button
          onClick={() => {
            handleForm({ edit: name });
            setStore(oldStore);
          }}
          type="button"
          style="btn-link"
        >
          {label?.edit ?? "Editar"}
        </Button>
      );
    }

    return (
      <button type="button" className="p-0 font-bold opacity-50">
        {label?.edit ?? "Editar"}
      </button>
    );
  };

  /* ---------------------------
     Week handler (immutable)
     --------------------------- */

  const handleWeek = (value: Partial<DayType>, day: string) => {
    // create a copy of week with length of daysStatic
    const base: DayType[] = Array.from(
      { length: daysStatic.length },
      (_, i) => ({
        ...(week[i] ?? {}), // vem primeiro
        day: daysStatic[i].value, // sobrescreve
      })
    );

    const idx = daysStatic.findIndex((d) => d.value === day);
    if (idx === -1) return;

    const updatedDay: DayType = { ...base[idx], ...value, day };
    const newWeek = [...base];
    newWeek[idx] = updatedDay;

    setWeek(newWeek);
    handleStore({ openClose: newWeek });
  };

  /* ---------------------------
     JSX
     --------------------------- */

  if (router.isFallback) return null;

  return (
    <Template
      header={{ template: "painel", position: "solid" }}
      footer={{ template: "clean" }}
    >
      <section>
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
                <span className="font-title font-bold">Personalizar loja</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-6">
        <div className="container-medium pb-12">
          <div className="grid lg:flex gap-10 lg:gap-20">
            <div className="w-full grid gap-8 border-t pt-6">
              {/* COVER */}
              <form
                onSubmit={handleSubmitCover}
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

                {form.edit === "cover" ? (
                  <FileInput
                    name="cover"
                    id="cover"
                    onChange={async (e: any) => {
                      const files = await handleCoverPreview(e);
                      if (files) {
                        handleStore({ cover: { files } as any });
                      }
                    }}
                    aspect="aspect-[6/2.5]"
                    loading={form.loading}
                    remove={handleCoverRemove}
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

              {/* PROFILE */}
              <form
                onSubmit={handleSubmitProfile}
                className="grid gap-4 border-b pb-8 mb-0"
              >
                <div className="flex items-center gap-6">
                  <div className="w-[5rem]">
                    {form.edit === "profile" ? (
                      <FileInput
                        name="profile"
                        id="profile"
                        onChange={async (e: any) => {
                          const files = await handleProfilePreview(e);
                          if (files) {
                            handleStore({ profile: { files } as any });
                          }
                        }}
                        rounded
                        placeholder="Abrir"
                        aspect="aspect-square"
                        loading={form.loading}
                        remove={handleProfileRemove}
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

              {/* TITLE */}
              <form
                onSubmit={handleSubmit}
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
                  {form.edit === "title" ? (
                    <Input
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleStore({ title: e.target.value })
                      }
                      value={store?.title ?? ""}
                      placeholder="Digite o nome aqui"
                    />
                  ) : (
                    oldStore?.title ?? "Informe o nome da sua loja"
                  )}
                </div>
              </form>

              {/* DESCRIPTION */}
              <form
                onSubmit={handleSubmit}
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
                  {form.edit === "description" ? (
                    <TextArea
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleStore({ description: e.target.value })
                      }
                      value={store?.description ?? ""}
                      placeholder="Digite sua descrição aqui"
                    />
                  ) : (
                    oldStore?.description ??
                    "Insira uma descrição para sua loja"
                  )}
                </div>
              </form>

              {/* BUSINESS */}
              <form
                onSubmit={handleSubmit}
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
                  {form.edit === "business" ? (
                    <div className="grid gap-2">
                      <Input
                        name="cnpj"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleStore({ document: justNumber(e.target.value) })
                        }
                        required
                        value={store?.document ?? ""}
                        placeholder="CNPJ"
                      />
                      <Input
                        name="nome"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleStore({ companyName: e.target.value })
                        }
                        required
                        value={store?.companyName ?? ""}
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

              {/* OPEN/CLOSE */}
              <form
                onSubmit={handleSubmit}
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
                  {form.edit === "openClose" ? (
                    <div className="grid gap-2">
                      {!!daysStatic.length &&
                        daysStatic.map((day, key) => (
                          <div
                            key={day.value}
                            className="flex items-center gap-4 text-sm"
                          >
                            <div className="w-1/6">{day.name}:</div>
                            <div className="w-1/6 border-b border-zinc-900">
                              <Input
                                type="time"
                                value={week[key]?.open ?? ""}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
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
                                value={week[key]?.close ?? ""}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
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
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                  handleWeek(
                                    {
                                      working: e.target.checked ? "on" : "off",
                                    },
                                    day.value
                                  )
                                }
                                checked={week[key]?.working === "on"}
                              />
                              aberto
                            </label>
                          </div>
                        ))}
                    </div>
                  ) : !!week.length ? (
                    <div className="text-sm">
                      {week.map((day, key) => (
                        <div key={key} className="grid grid-cols-6">
                          <div>{week[key]?.day}</div>
                          {week[key]?.working !== "on" ? (
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

              {/* LOCATION */}
              <form
                onSubmit={handleSubmit}
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
                  {form.edit === "location" ? (
                    <div className="grid gap-2">
                      <Input
                        name="cep"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleZipCode(e.target.value)
                        }
                        required
                        value={store?.zipCode ?? ""}
                        placeholder="CEP"
                      />
                      <div className="flex gap-2">
                        <div className="w-full">
                          <Input
                            name="rua"
                            readOnly
                            required
                            value={store?.street ?? ""}
                            placeholder="Rua"
                          />
                        </div>
                        <div className="w-[10rem]">
                          <Input
                            name="numero"
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => handleStore({ number: e.target.value })}
                            required
                            value={store?.number ?? ""}
                            placeholder="Número"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <div className="w-full">
                          <Input
                            name="bairro"
                            readOnly
                            required
                            value={store?.neighborhood ?? ""}
                            placeholder="Bairro"
                          />
                        </div>
                        <div className="w-full">
                          <Input
                            name="complemento"
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => handleStore({ complement: e.target.value })}
                            value={store?.complement ?? ""}
                            placeholder="Complemento"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <div className="w-full">
                          <Input
                            name="cidade"
                            readOnly
                            required
                            value={store?.city ?? ""}
                            placeholder="Cidade"
                          />
                        </div>
                        <div className="w-[10rem]">
                          <Input
                            name="estado"
                            readOnly
                            required
                            value={store?.state ?? ""}
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

              {/* SEGMENT */}
              <form
                onSubmit={handleSubmit}
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
                  {form.edit === "segment" ? (
                    <Select
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        handleStore({ segment: e.target.value })
                      }
                      value={String(store?.segment ?? "")}
                      placeholder="Selecione seu segmento"
                      name="lojaTipo"
                      options={groupOptions.map((item: any) => ({
                        name: item.title,
                        value: item.id,
                      }))}
                    />
                  ) : (
                    storeTypes.filter((item) => item.id === store?.segment)[0]
                      ?.title ?? "Informe o segmento da sua loja"
                  )}
                </div>
              </form>

              {/* FRETE */}
              <form
                onSubmit={handleSubmit}
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
                  {form.edit === "frete" ? (
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
                                    e.target.value
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
                                    e.target.value
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
                            value={String(store?.default_delivery_fee ?? "")}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              handleStore({
                                default_delivery_fee: e.target.value,
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
                          value={store?.deliveryRegions ?? []}
                          onChange={(values: number[]) =>
                            handleStore({ deliveryRegions: values })
                          }
                          options={deliveryRegionsOptions}
                          className="min-h-[46px] relative"
                          isMulti={true}
                        />
                      </div>
                    </div>
                  ) : (
                    <>Informe as regras do frete</>
                  )}
                </div>
              </form>
            </div>

            <div className="w-full md:max-w-[18rem] lg:max-w-[24rem]">
              <HelpCard list={page?.help_list ?? []} />
            </div>
          </div>
        </div>
      </section>
    </Template>
  );
}
