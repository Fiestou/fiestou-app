// TODO: Check the code and fix the types
//@ts-nocheck
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { useEffect, useState } from "react";
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
import CoverUploader from "@/src/components/lojista/cover-uploader/CoverUploader";
import ProfileUploader from "@/src/components/lojista/profile-uploader/ProfileUploader";
import StoreTitleForm from "@/src/components/lojista/store-title-form/StoreTitleForm";
import StoreFormDescription from "@/src/components/lojista/store-form-description/StoreFormDescription";
import FormBusiness from "@/src/components/lojista/form-business/FormBusiness";
import FormOpenClose from "@/src/components/lojista/form-open-close/FormOpenClose";
import FormLocation from "@/src/components/lojista/form-location/FormLocation";
import SegmentForm from "@/src/components/lojista/segment-form/SegmentForm";
import FreteForm from "@/src/components/lojista/frete-form/FreteForm";

export async function getServerSideProps(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const api = new Api();
  let request: any = {};

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
  { value: "Domingo", name: "Domingo" },
  { value: "Segunda", name: "Segunda" },
  { value: "Terça", name: "Terça" },
  { value: "Quarta", name: "Quarta" },
  { value: "Quinta", name: "Quinta" },
  { value: "Sexta", name: "Sexta" },
  { value: "Sábado", name: "Sábado" },
  { value: "Feriados", name: "Feriados" },
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
  const [groupOptions, setGroupOptions] = useState([]);
  const handleStore = async (value: Object) => {
    setStore({ ...store, ...value });
  };

  const getStore = async () => {
    let request: any = await api.bridge({
      method: "post",
      url: "stores/form",
    });

    const handle = request.data ?? {};
    handle.deliveryRegions = handle.zipcode_cities_ranges?.map(
      (item: { zipcode_cities_range_id: number }) =>
        item.zipcode_cities_range_id
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

  // ---- MÁSCARA DE CEP ----
  const maskZip = (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length > 8) v = v.slice(0, 8);
    if (v.length > 5) return v.slice(0, 5) + "-" + v.slice(5);
    return v;
  };

  // ---- CONTROLA CEP ----
  const handleZipCode = async (value: string) => {
    const masked = maskZip(value);

    // Atualiza imediatamente o campo CEP (com máscara)
    handleStore({ zipCode: masked });

    const numeric = masked.replace(/\D/g, "");

    // Só pesquisa após 8 dígitos
    if (numeric.length < 8) return;

    const location = await getZipCode(numeric);
    if (!location) return;

    // Atualiza o endereço sem limpar o CEP
    handleStore({
      zipCode: masked, // mantém o CEP no estado
      street: location.logradouro,
      neighborhood: location.bairro,
      city: location.localidade,
      state: location.uf,
      country: "Brasil",
    });
  };

  const handleSubmitFinal = async (location: StoreLocation) => {
    try {
      setForm({ ...form, loading: true });

      const { data } = await Api.post("store/update-location", {
        ...location,
      });

      // atualiza estado da loja
      setStore(data.store);

      setForm({ ...form, edit: "", loading: false });
    } catch (error) {
      console.log(error);
      setForm({ ...form, loading: false });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    handleForm({ loading: true });

    /* TO DO - TIPAR E ARRANCAR any */
    const request: any = await api.bridge({
      method: "post",
      url: "stores/register",
      data: store,
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

  const [deliveryRegionsOptions, setDeliveryRegionsOptions] = useState([]);

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
          }))
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
                <CoverUploader
                  form={form}
                  handleSubmitCover={handleSubmitCover}
                  handleStore={handleStore}
                  handleCoverPreview={handleCoverPreview}
                  handleCoverRemove={handleCoverRemove}
                  handleCover={handleCover}
                  renderAction={renderAction}
                />
                {/* PERFIL */}
                <ProfileUploader
                  form={form}
                  handleSubmitProfile={handleSubmitProfile}
                  handleStore={handleStore}
                  handleProfilePreview={handleProfilePreview}
                  handleProfileRemove={handleProfileRemove}
                  handleProfile={handleProfile}
                  renderAction={renderAction}
                />
                {/* TITULO */}
                <StoreTitleForm
                  form={form}
                  store={store}
                  oldStore={oldStore}
                  handleSubmit={handleSubmit}
                  handleStore={handleStore}
                  renderAction={renderAction}
                />
                {/* DESCRICAO */}
                <StoreFormDescription
                  form={form}
                  store={store}
                  oldStore={oldStore}
                  handleSubmit={handleSubmit}
                  handleStore={handleStore}
                  renderAction={renderAction}
                />
                {/* EMPRESA */}
                <FormBusiness
                  form={form}
                  store={store}
                  oldStore={oldStore}
                  handleStore={handleStore}
                  handleSubmit={handleSubmit}
                  renderAction={renderAction}
                  justNumber={justNumber}
                />
                {/* HORARIO */}
                <FormOpenClose
                  form={form}
                  days={days}
                  week={week}
                  handleWeek={handleWeek}
                  handleSubmit={handleSubmit}
                  renderAction={renderAction}
                />
                {/* ENDERECO */}
                <FormLocation
                  form={form}
                  store={store}
                  handleStore={handleStore}
                  handleZipCode={handleZipCode}
                  handleSubmit={handleSubmit}
                  renderAction={renderAction}
                />
                {/* SEGMENTO */}
                <SegmentForm
                  store={store}
                  form={form}
                  groupOptions={groupOptions}
                  storeTypes={storeTypes}
                  handleStore={handleStore}
                  handleSubmit={handleSubmit}
                  renderAction={renderAction}
                />
                
                {/* VALORES DE ENTREGA */}
                <FreteForm
                  store={store}
                  form={form}
                  handleStore={handleStore}
                  handleSubmit={handleSubmit}
                  renderAction={renderAction}
                  deliveryRegionsOptions={deliveryRegionsOptions}
                />
                
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
