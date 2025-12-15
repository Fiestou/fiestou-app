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
import StoreHeader from "@/src/components/store/components/store-header/StoreHeader";
import CoverSection from "@/src/components/store/components/cover-section/CoverSection";
import ProfileSection from "@/src/components/store/components/profile-section/ProfileSection";
import StoreTitleForm from "@/src/components/store/components/store-title-form/StoreTitleForm";
import StoreDescriptionForm from "@/src/components/store/components/store-description-form/StoreDescriptionForm";
import StoreBusinessForm from "@/src/components/store/components/store-business-form/StoreBusinessForm";
import StoreOpenCloseForm from "@/src/components/store/components/store-open-close-form/StoreOpenCloseForm";
import StoreLocationForm from "@/src/components/store/components/store-location-form/StoreLocationForm";
import StoreSegmentForm from "@/src/components/store/components/store-segment-form/StoreSegmentForm";
import StoreDeliveryForm from "@/src/components/store/components/store-delivery-form/StoreDeliveryForm";
import { useFiltersData } from "@/src/components/common/filters/filter/hooks/useFiltersData";

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

export default function Loja() {
  const api = new Api();
  const router = useRouter();

  /* 1. ESTADOS (useState) */

  const [page, setPage] = useState<any>({});
  const [storeTypes, setStoreTypes] = useState<Array<RelationType>>([]);
  const [form, setForm] = useState(formInitial);
  const [week, setWeek] = useState([] as Array<DayType>);
  const [handleCover, setHandleCover] = useState(
    {} as { preview: string; remove: number }
  );
  const [handleProfile, setHandleProfile] = useState(
    {} as { preview: string; remove: number }
  );
  const [oldStore, setOldStore] = useState({} as StoreType);
  const [store, setStore] = useState({} as StoreType);
  const [groupOptions, setGroupOptions] = useState([]);
  const [deliveryRegionsOptions, setDeliveryRegionsOptions] = useState([]);
  const [open, setOpen] = useState(false);

  const { allGroups } = useFiltersData(open, store);

  /* 2. FUNÇÕES */

  /* --- Form Control --- */
  const handleForm = (value: Object) => {
    setForm({ ...form, ...value });
  };

  /* --- Store Handler --- */
  const handleStore = async (value: Object) => {
    setStore({ ...store, ...value });
  };

  /* --- Weekday / Horário --- */
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

  /* --- Buscar loja --- */
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

  /* --- CAPA: remover / preview / salvar --- */
  const handleCoverRemove = async () => {
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

    const handle = { ...store, profile: profileValue };

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

  /* --- CEP --- */
  const maskZipCode = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/^(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);

  const handleZipCode = async (zipCode: string) => {
    const masked = maskZipCode(zipCode);
    const numeric = justNumber(masked);

    setStore((prev: any) => ({
      ...prev,
      zipCode: masked,
    }));

    if (numeric.length !== 8) return;

    const location = await getZipCode(numeric);

    if (location) {
      setStore((prev: any) => ({
        ...prev,
        street: location.logradouro,
        neighborhood: location.bairro,
        city: location.localidade,
        state: location.uf,
        country: "Brasil",
      }));
    }
  };

  /* --- Submit geral --- */
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
      data: { ids: store?.deliveryRegions },
    });
  };

  /* --- Ações de edição (renderAction) --- */
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

  /* 3. USE EFFECTS */

  // Buscar página e storeTypes
  useEffect(() => {
    const fetchInitialData = async () => {
      const request: any = await api.call({
        method: "post",
        url: "request/graph",
        data: [
          {
            model: "page",
            filter: [{ key: "slug", value: "store-custom", compare: "=" }],
          },
        ],
      });

      setPage(request?.data?.query?.page?.[0] ?? {});
      setStoreTypes(request?.data?.query?.storeType ?? []);
    };

    fetchInitialData();
  }, []);

  // Buscar regiões
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
      } catch {
        setDeliveryRegionsOptions([]);
      }
    };
    fetchRegions();
  }, []);

  // Buscar loja
  useEffect(() => {
    if (!!window) {
      getStore();
    }
  }, []);

  // Atualizar grupos
  useEffect(() => {
    if (allGroups) {
      setGroupOptions(allGroups);
    }
  }, [allGroups]);

  /* 4. RENDER DO COMPONENTE */

  return (
    !router.isFallback && (
      <Template
        header={{ template: "painel", position: "solid" }}
        footer={{ template: "clean" }}
      >
        <StoreHeader
          title="Personalizar loja"
          breadcrumbs={[
            { url: "/painel", name: "Painel" },
            { url: "/painel/loja", name: "Personalizar loja" },
          ]}
        />
        <section className="pt-6">
          <div className="container-medium pb-12">
            <div className="grid lg:flex gap-10 lg:gap-20">
              <div className="w-full grid gap-8 border-t pt-6">
                {/* CAPA */}
                <CoverSection
                  form={form}
                  handleStore={handleStore}
                  handleSubmitCover={handleSubmitCover}
                  handleCover={handleCover}
                  handleCoverPreview={handleCoverPreview}
                  handleCoverRemove={handleCoverRemove}
                  renderAction={renderAction}
                />
                {/* PERFIL */}
                <ProfileSection
                  form={form}
                  handleStore={handleStore}
                  handleSubmitProfile={handleSubmitProfile}
                  handleProfile={handleProfile}
                  handleProfilePreview={handleProfilePreview}
                  handleProfileRemove={handleProfileRemove}
                  renderAction={renderAction}
                />
                {/* TITULO */}
                <StoreTitleForm
                  editing={form.edit === "title"}
                  title={store?.title ?? ""}
                  oldTitle={oldStore?.title ?? ""}
                  onChange={(v) => handleStore({ title: v })}
                  onSubmit={handleSubmit}
                  actions={renderAction("title")}
                />
                {/* DESCRICAO */}
                <StoreDescriptionForm
                  editing={form.edit === "description"}
                  description={store?.description ?? ""}
                  oldDescription={oldStore?.description ?? ""}
                  onChange={(v) => handleStore({ description: v })}
                  onSubmit={handleSubmit}
                  actions={renderAction("description")}
                />
                {/* EMPRESA */}
                <StoreBusinessForm
                  editing={form.edit === "business"}
                  document={store?.document ?? ""}
                  companyName={store?.companyName ?? ""}
                  oldDocument={oldStore?.document ?? ""}
                  oldCompanyName={oldStore?.companyName ?? ""}
                  onChangeDocument={(v) => handleStore({ document: v })}
                  onChangeCompanyName={(v) => handleStore({ companyName: v })}
                  onSubmit={handleSubmit}
                  actions={renderAction("business")}
                />
                {/* HORARIO */}
                <StoreOpenCloseForm
                  editing={form.edit === "openClose"}
                  days={days}
                  week={week}
                  onSubmit={handleSubmit}
                  onChangeWeek={(dayValue, updates) =>
                    handleWeek(updates, dayValue)
                  }
                  actions={renderAction("openClose")}
                />

                {/* ENDERECO */}
                <StoreLocationForm
                  editing={form.edit === "location"}
                  zipCode={store?.zipCode ?? ""}
                  street={store?.street ?? ""}
                  number={store?.number ?? ""}
                  neighborhood={store?.neighborhood ?? ""}
                  complement={store?.complement ?? ""}
                  city={store?.city ?? ""}
                  state={store?.state ?? ""}
                  country={store?.country ?? ""}
                  actions={renderAction("location")}
                  onSubmit={handleSubmit}
                  onChangeZipCode={(v) => handleZipCode(v)}
                  onChangeField={(field, value) =>
                    handleStore({ [field]: value })
                  }
                />

                {/* Segmento */}
                <StoreSegmentForm
                  store={store}
                  form={form}
                  name="segment"
                  groupOptions={allGroups}
                  storeTypes={storeTypes}
                  renderAction={renderAction}
                  handleSubmit={handleSubmit}
                  handleStore={handleStore}
                />
                {/* FRETE */}
                <StoreDeliveryForm
                  store={store}
                  form={form}
                  deliveryRegionsOptions={deliveryRegionsOptions}
                  renderAction={renderAction}
                  handleSubmit={handleSubmit}
                  handleStore={handleStore}
                />
              </div>
              <div className="w-full md:max-w-[18rem] lg:max-w-[24rem]">
                <HelpCard list={page?.help_list ?? []} />
              </div>
            </div>
          </div>
        </section>
      </Template>
    )
  );
}
