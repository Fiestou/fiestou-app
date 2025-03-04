import Template from "@/src/template";
import Api from "@/src/services/api";
import { useEffect, useState } from "react";

import Breadcrumbs from "@/src/components/common/Breadcrumb";
import NewGroup from "../../../src/components/pages/admin/filtro/buttons/NewGroup";
import { LuCirclePlus } from "react-icons/lu";
import Eye from "../../../src/components/pages/admin/filtro/buttons/Eye";
import Card from "../../../src/components/pages/admin/filtro/section/Card";

export default function Categorias() {
  const api = new Api();

  const [listRelation, setListRelation] = useState([] as Array<any>);
  console.log(listRelation)
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
            <div className="flex w-full flex-row">
              <div className="flex-[4] font-title font-bold text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900">
                Configurar filtro
              </div>
              <div className="flex-[1] gap-2 justify-center items-center flex flex-row" >
                <Eye onClick={() => { }} />
                <NewGroup onClick={() => { }} text="Novo grupo" icon={<LuCirclePlus size={20} />} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-h-screen max-w-[100%] flex justify-center items-center">
        <div 
          className="w-full max-w-[1000px] max-h-screen bg-red"
        >
          <Card description="teste" elements={[
            {
              text: 'Engrenagem',
              icon: "https://api.fiestou.com.br/storage/categories/media/12-07-2024/1626-2699png.png",
              id: '1'
            }
          ]} onDeleteClick={() => { }} onEditClick={() => { }} onElementClick={()=>{}} title="teste" />
        </div>
      </section>
    </Template>
  ) : (
    <></>
  );
}
