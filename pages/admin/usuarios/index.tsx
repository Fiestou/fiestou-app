import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { NextApiRequest, NextApiResponse } from "next";
import Api from "@/src/services/api";
import { ProductType } from "@/src/models/product";
import { moneyFormat } from "@/src/helper";
import { UserType } from "@/src/models/user";
import { useEffect, useState } from "react";

export default function Usuarios() {
  const api = new Api();
  const [users, setUsers] = useState([] as Array<UserType>);

  const getUsers = async () => {
    const request: any = await api.bridge({
      method: "get",
      url: "users/list",
      data: {
        person: "client",
      },
    });

    if (request.response) {
      setUsers(request.data);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

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
          <div className="flex mt-10">
            <div className="w-full">
              <div className="font-title font-bold text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900">
                Usuários
              </div>
            </div>
            <div className="flex gap-6 w-fit">
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
    </Template>
  );
}
