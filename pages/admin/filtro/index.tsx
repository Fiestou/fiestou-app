import Template from "@/src/template";
import Api from "@/src/services/api";
import { useEffect, useState } from "react";

import Breadcrumbs from "@/src/components/common/Breadcrumb";
import NewGroup from "../../../src/components/pages/admin/filtro/buttons/NewGroup";
import { LuCirclePlus } from "react-icons/lu";
import Eye from "../../../src/components/pages/admin/filtro/buttons/Eye";
import Card from "../../../src/components/pages/admin/filtro/section/Card";
import GroupModal, { GroupData } from "@/src/components/pages/admin/filtro/modals/GroupModal";
import { Group, GroupResponse, ResponseRegister } from "./types/response";
import { RequestRegister } from "./types/request";

export default function Categorias() {
  const api = new Api();

  const [openGroupModal, setOpenGroupModal] = useState<boolean>(false);
  const [groups, setGroups] = useState<Group[]>([]);

  const onSaveGroup = async (data: GroupData) => {
    let dataRequest: RequestRegister = {
      name: data?.title || '',
      description: data?.description || '',
      isFather: groups.length === 0
    }

    if (groups.length > 0) {
      dataRequest.parent_id = groups[groups.length - 1].id
    }

    const request = await api.bridge<ResponseRegister>({
      method: "post",
      url: "group/register",
      data: dataRequest
    });

    if (!request.response) {
      //alert
    }

    setOpenGroupModal(false);
    window.location.reload()
  }

  const getGroups = async () => {
    const request = await api.bridge<GroupResponse>({
      method: "get",
      url: "group/list",
    });

    if (request.response) {
      setGroups(request.data);
    }
  };

  useEffect(() => {
  }, [])

  useEffect(()=>{
    getGroups();

  }, [groups])

  return (
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
                    setOpenGroupModal(true);
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
          {groups.map((value) => (
            <Card
              elements={value.elements}
              onDeleteClick={() => { }}
              onEditClick={() => { }}
              title={value.name}
              description={value.description}
              id={value.id} />
          ))}

        </div>
      </section>

      <GroupModal onSaveClick={(data) => { onSaveGroup(data) }} open={openGroupModal} onRequestClose={() => { setOpenGroupModal(false) }} />
    </Template>
  )
}
