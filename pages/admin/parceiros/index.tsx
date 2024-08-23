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
import { useEffect, useState } from "react";
import FileManager from "@/src/components/ui/form/FileManager";
import Modal from "@/src/components/utils/Modal";
import { RelationType } from "@/src/models/relation";
import Categorias from "../filtro";

export default function Partner() {
  const api = new Api();

  const [partners, setPartners] = useState([] as Array<any>);

  const getPartners = async () => {
    let request: any = await api.bridge({
      method: "get",
      url: "users/list",
      data: {
        person: "partner",
      },
    });

    if (request.response) {
      setPartners(request.data);
    }
  };

  useEffect(() => {
    getPartners();
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
          <div className="flex mt-10 items-center">
            <div className="w-full">
              <div className="font-title font-bold text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900">
                Parceiros
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
            {!!partners?.length &&
              partners
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
                        href={`/admin/parceiros/${item?.id}`}
                        className="rounded-md bg-zinc-100 hover:bg-yellow-300 ease py-2 px-3"
                      >
                        <Icon icon="fa-pen" type="far" />
                      </Link>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>
    </Template>
  );
}
