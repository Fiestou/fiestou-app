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
import { getExtenseData, getZipCode } from "@/src/helper";
import { AddressType } from "@/src/models/address";
import HelpCard from "@/src/components/common/HelpCard";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export async function getServerSideProps(ctx: any) {
  const api = new Api();
  let request: any = {};

  let user = JSON.parse(ctx.req.cookies["fiestou.user"]);

  request = await api.bridge(
    {
      url: "users/get",
      data: {
        ref: user.email,
      },
    },
    ctx
  );

  user = request?.data ?? {};

  request = await api.call(
    {
      url: "request/graph",
      data: [
        {
          model: "page",
          filter: [
            {
              key: "slug",
              value: "address",
              compare: "=",
            },
          ],
        },
        {
          model: "page as HeaderFooter",
          filter: [
            {
              key: "slug",
              value: "menu",
              compare: "=",
            },
          ],
        },
        {
          model: "page as DataSeo",
          filter: [
            {
              key: "slug",
              value: "seo",
              compare: "=",
            },
          ],
        },
      ],
    },
    ctx
  );

  const page: any = request?.data?.query?.page[0] ?? {};
  const HeaderFooter = request?.data?.query?.HeaderFooter ?? [];
  const DataSeo = request?.data?.query?.DataSeo ?? [];

  return {
    props: {
      user: user,
      page: page,
      HeaderFooter: HeaderFooter[0] ?? {},
      DataSeo: DataSeo[0] ?? {},
    },
  };
}

const formInitial = {
  edit: -1,
  loading: false,
};

export default function Conta({
  user,
  page,
  HeaderFooter,
  DataSeo,
}: {
  user: UserType;
  page: any;
  HeaderFooter: any;
  DataSeo: any;
}) {
  const api = new Api();
  const router = useRouter();

  const [form, setForm] = useState(formInitial);
  const handleForm = (value: Object) => {
    setForm({ ...form, ...value });
  };

  const [locations, setLocation] = useState(
    user.address ?? ([] as Array<AddressType>)
  );
  const handleAddress = (value: any, key: any) => {
    setLocation((locations: Array<AddressType>) =>
      locations.map((locate: AddressType, index: any) =>
        index == key
          ? {
              ...locate,
              ...value,
            }
          : locate
      )
    );
  };

  const addLocation = () => {
    let locations = (content?.address ?? []).filter((locate) => locate);

    locations.push({} as AddressType);

    setLocation(locations);

    handleForm({ edit: locations.length - 1 });
  };

  const [content, setContent] = useState(user as UserType);
  const handleSubmit = async (e: any, handleLocations?: Array<AddressType>) => {
    e.preventDefault();

    handleForm({ loading: true });

    const handle: UserType = {
      ...content,
      address: handleLocations ?? locations,
      id: user.id,
    };

    setContent(handle);

    const request: any = await api.bridge({
      url: "users/update",
      data: handle,
    });

    if (request.response) {
      setContent(handle);
      setLocation(handle?.address ?? ([] as Array<AddressType>));
    }

    handleForm({ edit: -1, loading: false });
  };

  const handleZipCode = async (zipCode: string, key: any) => {
    const location = await getZipCode(zipCode);

    if (!!location) {
      let address = locations.filter(
        (item: AddressType, find: any) => key == find
      )[0];

      address["zipCode"] = zipCode;
      address["street"] = location.logradouro;
      address["neighborhood"] = location.bairro;
      address["city"] = location.localidade;
      address["state"] = location.uf;
      address["country"] = "Brasil";

      handleAddress(address, key);
    }
  };

  const renderAction = (
    key: number,
    label?: { edit?: string; save?: string; cancel?: string }
  ) => {
    return form.edit == key ? (
      <div className="flex gap-4 md:gap-10">
        <Button
          onClick={(e: any) => {
            handleForm({ edit: -1 });
            setLocation(content?.address ?? []);
          }}
          type="button"
          style="btn-link"
        >
          {label?.cancel ? label.cancel : "Cancelar"}
        </Button>
        <Button
          loading={form.edit == key && form.loading}
          className="py-2 px-4"
        >
          {label?.save ? label.save : "Salvar"}
        </Button>
      </div>
    ) : !form.loading ? (
      <Button
        onClick={(e: any) => {
          handleForm({ edit: key });
          setLocation(content?.address ?? []);
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

  const removeLocation = (e: any, remove: any) => {
    e.preventDefault();

    console.log(locations, remove);

    let handleLocations = (locations ?? []).filter(
      (locate: AddressType, index: any) => locate.zipCode != remove.zipCode
    );

    console.log(handleLocations);

    handleForm({ edit: -1 });

    handleSubmit(e, handleLocations);
  };

  return (
    !router.isFallback && (
      <Template
        header={{
          template: "default",
          position: "solid",
          content: HeaderFooter,
        }}
      >
        <section className="">
          <div className="container-medium pt-12 pb-8 md:pt-12">
            <div className="pb-4">
              <Breadcrumbs
                links={[
                  { url: "/dashboard", name: "Dashboard" },
                  { url: "/dashboard/enderecos", name: "Endereços" },
                ]}
              />
            </div>
            <div className="flex items-center">
              <Link passHref href="/dashboard">
                <Icon
                  icon="fa-long-arrow-left"
                  className="mr-6 text-2xl text-zinc-900"
                />
              </Link>
              <div className="font-title font-bold text-3xl md:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                Endereços
              </div>
            </div>
          </div>
        </section>
        <section className="">
          <div className="container-medium pb-12">
            <div className="grid md:flex gap-10 md:gap-24">
              <div className="w-full grid gap-4 md:gap-8 border-t pt-4 md:pt-7">
                {!!locations.length ? (
                  locations.map((locate: AddressType, key: any) => (
                    <form
                      key={key}
                      onSubmit={(e: any) => handleSubmit(e)}
                      method="POST"
                      className="grid gap-4 border-b pb-8 mb-0"
                    >
                      <div className="flex items-center">
                        <div className="w-full">
                          <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
                            {!!locate.street
                              ? `Endereço ${key + 1}`
                              : "Novo endereço"}
                          </h4>
                        </div>
                        <div className="w-fit text-sm md:text-base">
                          {renderAction(key)}
                        </div>
                      </div>
                      <div className="w-full">
                        {form.edit == key ? (
                          <div className="grid gap-2">
                            <Input
                              name="cep"
                              onChange={(e: any) =>
                                handleZipCode(e.target.value, key)
                              }
                              required
                              defaultValue={locate?.zipCode}
                              placeholder="CEP"
                            />
                            <div className="flex gap-2">
                              <div className="w-full">
                                <Input
                                  name="rua"
                                  readonly
                                  required
                                  defaultValue={locate?.street}
                                  placeholder="Rua"
                                />
                              </div>
                              <div className="w-[10rem]">
                                <Input
                                  name="numero"
                                  onChange={(e: any) =>
                                    handleAddress(
                                      { number: e.target.value },
                                      key
                                    )
                                  }
                                  required
                                  defaultValue={locate?.number}
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
                                  defaultValue={locate?.neighborhood}
                                  placeholder="Bairro"
                                />
                              </div>
                              <div className="w-full">
                                <Input
                                  name="complemento"
                                  onChange={(e: any) =>
                                    handleAddress(
                                      { complement: e.target.value },
                                      key
                                    )
                                  }
                                  defaultValue={locate?.complement}
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
                                  defaultValue={locate?.city}
                                  placeholder="Cidade"
                                />
                              </div>
                              <div className="w-[10rem]">
                                <Input
                                  name="estado"
                                  readonly
                                  required
                                  defaultValue={locate?.state}
                                  placeholder="UF"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <label className="flex gap-2 items-center pt-2 text-zinc-900">
                                <input
                                  name="prioridade"
                                  type="checkbox"
                                  defaultChecked={locate.main}
                                  onChange={(e: any) =>
                                    handleAddress({ main: !locate.main }, key)
                                  }
                                />
                                Endereço principal
                              </label>
                              <div>
                                <button
                                  type="button"
                                  className="font-semibold text-sm text-zinc-950"
                                  onClick={(e) => removeLocation(e, locate)}
                                >
                                  remover
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : !!locate?.street ? (
                          <div className="text-sm md:text-base">
                            <div>
                              {locate.street}, {locate.number}
                            </div>
                            <div>{locate.neighborhood}</div>
                            <div>CEP: {locate.zipCode}</div>
                            <div>
                              {locate.city} | {locate.state} - {locate.country}
                            </div>
                          </div>
                        ) : (
                          "Informe a localização da sua loja"
                        )}
                      </div>
                    </form>
                  ))
                ) : (
                  <div className="grid gap-4 border-b pb-4 mb-0">
                    Sem endereços cadastrados
                  </div>
                )}
                <div className="grid">
                  <Button
                    type="button"
                    onClick={() => (form.edit == -1 ? addLocation() : {})}
                    {...(form.edit == -1 ? {} : { disable: true })}
                  >
                    Adicionar endereço
                  </Button>
                </div>
              </div>
              <div className="w-full max-w-[24rem]">
                <HelpCard list={page.help_list} />
              </div>
            </div>
          </div>
        </section>
      </Template>
    )
  );
}
