import Template from "@/src/template";
import Api from "@/src/services/api";
import { useEffect, useState } from "react";

import Breadcrumbs from "@/src/components/common/Breadcrumb";
import NewGroup from "../../../src/components/pages/admin/filtro/buttons/NewGroup";
import { LuCirclePlus } from "react-icons/lu";
import Eye from "../../../src/components/pages/admin/filtro/buttons/Eye";
import Card from "../../../src/components/pages/admin/filtro/section/Card";
import GroupModal from "@/src/components/pages/admin/filtro/modals/GroupModal";
import ElementModal from "@/src/components/pages/admin/filtro/modals/ElementModal";

export default function Categorias() {
  const api = new Api();

  const [listRelation, setListRelation] = useState([] as Array<any>);
  const [openGroupModal, setOpenGroupModal] = useState<boolean>(false);
  const [groupId,  setGroupId] = useState<number>();
  const [openElementModal, setOpenElementModal] = useState(false);

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
      <section className="overflow-y-hidden">
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
              <div className="flex-[1.2] gap-2 justify-center items-center flex flex-row" >
                <Eye onClick={() => { }} />
                <NewGroup
                  onClick={() => {
                    console.log('ola')
                    setOpenGroupModal(true);
                    console.log("Abrindo modal, estado:", openGroupModal);
                  }}
                  text="Adicionar grupo"
                  icon={<LuCirclePlus size={20} />}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-h-[77vh] max-w-[100%] flex justify-center overflow-y-auto">
        <div
          className=" flex flex-col gap-3 w-full max-w-[1000px] max-h-scree  "
        >
          {[1, 2, 3, 4].map((value) => (
            <Card
              description="teste"
              elements={[
                {
                  text: 'Engrenagem',
                  icon: "https://api.fiestou.com.br/storage/categories/media/12-07-2024/1626-2699png.png",
                  id: 1
                },
              ]}
              onDeleteClick={() => { }}
              onEditClick={() => { }}
              onElementClick={() => { }}
              onNewElementClick={(id)=>{ setGroupId(id); setOpenElementModal(true)}}
              title="teste"
              id={value} />
          ))}

        </div>
      </section>

      <GroupModal onSaveClick={(data) => console.log(data)} open={openGroupModal} onRequestClose={() => { setOpenGroupModal(false) }} />
      <ElementModal groupId={groupId || 0} elementsChilds={[
          {text: 'teste', id: 1, icon: '', checked: false},
          {text: 'teste', id: 2, icon: '', checked: false},
          {text: 'teste', id: 3, icon: '', checked: false}
          ]} onRequestClose={()=>{setOpenElementModal(false)}} open={openElementModal}/>
    </Template>
  ) : (
    <></>
  );
}
