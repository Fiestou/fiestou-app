import Template from "@/src/template";
import Api from "@/src/services/api";
import { useEffect, useState } from "react";

import Breadcrumbs from "@/src/components/common/Breadcrumb";
import HandleCategories from "@/src/components/pages/admin/filtro/HandleCategories";

export default function Categorias() {
  const api = new Api();

  const [listRelation, setListRelation] = useState([] as Array<any>);

  const sendReorder = async () => {
    const request: any = await api.bridge({
      url: "categories/reorder",
      data: { list: listRelation },
    });
  };

  useEffect(() => {
    sendReorder();
  }, [listRelation]);

  const getCategories = async () => {
    const api = new Api();

    let request: any = await api.bridge({
      url: "categories/list",
    });

    if (!!request?.response) {
      setListRelation(request.data);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return !!listRelation?.length ? (
    <Template
      header={{
        template: "admin",
        position: "solid",
      }}
    >
      <section className="">
        <div className="container-medium pt-12">
          <div className="">
            <Breadcrumbs
              links={[
                { url: "/admin", name: "Admin" },
                { url: "/admin/blog", name: "Blog" },
              ]}
            />
          </div>
          <div className="flex mt-6 pb-6">
            <div className="w-full">
              <div className="font-title font-bold text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900">
                Configurar filtro
              </div>
            </div>
            <div className="flex gap-6 w-fit">
              {/* <Button
                onClick={() => {
                  setModalRelation(true);
                  setEditRelation({} as RelationType);
                }}
                style="btn-outline-light"
                className="whitespace-nowrap"
              >
                Novo filtro
              </Button> */}
            </div>
          </div>
        </div>
      </section>

      <section className="">
        <div className="container-medium pb-12">
          <HandleCategories
            list={listRelation}
            emitEdit={(handleList: any) => setListRelation(handleList)}
          />
        </div>
      </section>
    </Template>
  ) : (
    <></>
  );
}
