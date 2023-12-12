import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { NextApiRequest, NextApiResponse } from "next";
import Api from "@/src/services/api";
import { ProductType } from "@/src/models/product";
import { moneyFormat } from "@/src/helper";
import { UserType } from "@/src/models/user";
import { Button, Input, Label } from "@/src/components/ui/form";
import { useState } from "react";
import FileManager from "@/src/components/ui/form/FileManager";
import Modal from "@/src/components/utils/Modal";
import { RelationType } from "@/src/models/relation";
import Categorias from "../filtro";

export async function getServerSideProps(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const api = new Api();
  let request: any = {};

  request = await api.graph(
    {
      url: "content/graph",
      data: [
        {
          model: "roles",
        },
      ],
    },
    req
  );

  const roles = request?.data?.query?.roles ?? [];

  request = await api.bridge(
    {
      url: "users/list",
      data: {
        filter: [
          {
            key: "person",
            value: "partner",
            compare: "=",
          },
        ],
      },
    },
    req
  );

  const users = request.data;

  request = await api.call(
    {
      url: "request/graph",
      data: [
        {
          with: { childs: "category" },
          model: "category as categories",
          filter: [
            {
              key: "parent",
              value: "",
              compare: "=",
            },
          ],
        },
      ],
    },
    req
  );

  const categories = request?.data?.query?.categories ?? [];

  return {
    props: {
      users: users,
      roles: roles[0] ?? {},
      categories: categories,
    },
  };
}

const formInitial = {
  edit: "",
  loading: false,
};

export default function Partner({
  users,
  roles,
  categories,
}: {
  users: Array<UserType>;
  roles: any;
  categories: Array<RelationType>;
}) {
  const api = new Api();

  const [modalCategory, setModalCategory] = useState<boolean>(false);
  const [listCategory, setListCategory] = useState(
    categories as Array<RelationType>
  );

  const [form, setForm] = useState(formInitial);
  const handleForm = (value: Object) => {
    setForm({ ...form, ...value });
  };

  const [data, setData] = useState(roles);
  const handleData = (value: Object) => {
    setData((data: any) => ({ ...data, ...value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    handleForm({ loading: true });

    const request: any = await api.graph({
      url: "content/graph",
      data: [
        {
          method: "register",
          model: "roles",
          title: "roles",
          slug: "roles",
          content: data,
        },
      ],
    });

    if (request.response) {
      setModalCategory(false);
    }

    handleForm({ loading: false, sended: request.response });
  };

  const [editStoryType, setEditStoryType] = useState(
    (data?.storyTypes ?? []).map((item: any) => parseInt(item)) as Array<any>
  );
  const handleEditStoryType = (e: any) => {
    let categories: any = editStoryType.map((item: any) => parseInt(item));

    categories = e.target.checked
      ? [...categories, parseInt(e.target.value)]
      : categories.filter((value: any) => value !== parseInt(e.target.value));

    categories = categories.map((item: any) => parseInt(item));

    setEditStoryType(categories);
    handleData({ storyTypes: categories });
  };

  const renderCategoriesForm = (category: any) => {
    return (
      <div>
        <label>
          <div className="flex gap-2 items-center">
            <div>
              <input
                type="checkbox"
                name="storyType"
                value={category.id}
                {...(!!editStoryType?.includes(category.id)
                  ? { checked: true }
                  : {})}
                onChange={(e: any) => handleEditStoryType(e)}
              />
            </div>
            <div className="pb-[2px]">{category.title}</div>
          </div>
        </label>
        {!!category?.childs?.category?.length &&
          category?.childs?.category?.map((sub: RelationType) => (
            <div key={sub.id} className="pl-5">
              {renderCategoriesForm(sub)}
            </div>
          ))}
      </div>
    );
  };

  return (
    <Template
      header={{
        template: "admin",
        position: "solid",
      }}
    >
      <section className="">
        <div className="container-medium pt-12">
          <div className="flex">
            <div className="w-full">usuarios {">"} Title</div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="underline">Precisa de ajuda?</div>{" "}
              <Icon icon="fa-question-circle" />
            </div>
          </div>
          <div className="flex mt-10 items-center">
            <div className="w-full">
              <div className="font-title font-bold text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900">
                Parceiros
              </div>
            </div>
            <div className="flex gap-6 w-fit">
              <Button
                onClick={() => setModalCategory(true)}
                className="whitespace-nowrap"
              >
                Tipos de loja
              </Button>
              <button
                type="button"
                className="rounded-xl whitespace-nowrap border py-4 text-zinc-900 font-semibold px-8"
              >
                Filtrar{" "}
                <Icon
                  icon="fa-chevron-down"
                  type="far"
                  className="text-xs ml-1"
                />
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="pt-6">
        <div className="container-medium pb-12">
          <div className="border">
            <div className="flex bg-zinc-100 p-8 gap-8 font-bold text-zinc-900 font-title">
              <div className="w-full">Nome</div>
              <div className="w-[48rem]">Celular</div>
              <div className="w-[64rem]">E-mail</div>
              <div className="w-[32rem]">Status</div>
              <div className="w-[48rem]">Ações</div>
            </div>
            {!!users &&
              users
                .filter((item, key) => !!item.id)
                .map((item, key) => (
                  <div
                    key={key}
                    className="flex border-t p-8 gap-8 text-zinc-900 hover:bg-zinc-50 bg-opacity-5 ease items-center"
                  >
                    <div className="w-full">
                      <div>{item?.name}</div>
                    </div>
                    <div className="w-[48rem]">
                      <div>{item?.phone}</div>
                    </div>
                    <div className="w-[64rem]">
                      <div>{item?.email}</div>
                    </div>
                    <div className="w-[32rem] text-center">
                      <div className="rounded-md bg-zinc-100 py-2">
                        {!!item?.status ? "Ativo" : "Bloqueado"}
                      </div>
                    </div>
                    <div className="w-[48rem] text-center flex gap-2">
                      <Link
                        title="Editar"
                        href={`/admin/usuarios/${item?.id}`}
                        className="rounded-md bg-zinc-100 hover:bg-yellow-300 ease py-2 px-3"
                      >
                        <Icon icon="fa-pen" type="far" />
                      </Link>
                      <button
                        title="Bloquear"
                        className="rounded-md bg-zinc-100 hover:bg-yellow-300 ease py-2 px-3"
                      >
                        <Icon icon="fa-ban" type="far" />
                      </button>
                    </div>
                  </div>
                ))}
          </div>
          <div className="pt-4">Mostrando 1 página de 1 com 4 usuarios</div>
        </div>
      </section>

      <Modal
        title="Tipos de lojas"
        status={modalCategory}
        close={() => setModalCategory(!modalCategory)}
      >
        <form
          onSubmit={(e) => {
            handleSubmit(e);
          }}
          method="POST"
        >
          <div className="pb-2">
            Selecione as categorias que serão usadas para tipos de loja:
          </div>
          <div className="text-sm rounded-md border">
            {!!listCategory.length ? (
              listCategory
                .filter((handle: any) => !handle?.parent)
                .map((handle: any, key: any) => (
                  <div
                    key={handle.id}
                    className={`p-2 ${!key ? "" : "border-t"}`}
                  >
                    {renderCategoriesForm(handle)}
                  </div>
                ))
            ) : (
              <div className="text-center p-4 text-sx opacity-50">
                Ainda não existem categorias neste filtro.
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-6">
            <div className="w-full">
              <Button
                style="btn-link"
                onClick={() => setModalCategory(!modalCategory)}
              >
                Cancelar
              </Button>
            </div>
            <div>
              <Button loading={form.loading} className="px-10">
                Salvar
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </Template>
  );
}
