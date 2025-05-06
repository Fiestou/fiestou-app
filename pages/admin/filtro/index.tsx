import Template from "@/src/template";
import Api from "@/src/services/api";
import { useEffect, useState } from "react";
 
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import NewGroup from "../../../src/components/pages/admin/filtro/buttons/NewGroup";
import { CirclePlus } from 'lucide-react';
import EyeButton from "../../../src/components/pages/admin/filtro/buttons/Eye";
import Card from "../../../src/components/pages/admin/filtro/section/Card";
import GroupModal, { GroupData } from "@/src/components/pages/admin/filtro/modals/GroupModal";
import { Group, GroupResponse, GroupsResponse, ResponseRegister } from "../../../src/types/filtros/response";
import { RequestRegister } from "../../../src/types/filtros/request";
import { toast } from "react-toastify";
import { Element } from "@/src/types/filtros/response";
export default function Categorias() {
  const api = new Api();
 
  const [openGroupModal, setOpenGroupModal] = useState<boolean>(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [updateGroup, setUpdateGroup] = useState<Group | null>();
  const [nextGroupElements, setNextGroupElements] = useState<Element[]>([]);
 
  const onSaveGroup = async (data: GroupData) => {
    let dataRequest: RequestRegister = {
      name: data?.name || '',
      description: data?.description || '',
      active: true,
      segment: data?.segment ?? false
    };
 
    try {
      let request;
 
      if (data.id) {
        request = await api.bridge<ResponseRegister>({
          method: "put",
          url: `group/update/${data.id}`,
          data: dataRequest
        });
      } else {
        request = await api.bridge<ResponseRegister>({
          method: "post",
          url: "group/register",
          data: dataRequest
        });
      }
 
      if (!request) {
        toast.error('Não foi possível salvar o grupo de filtros.');
        return;
      }
      setOpenGroupModal(false);
      window.location.reload();
 
      toast.success('Grupo de filtros salvo com sucesso!');
 
    } catch (error) {
      console.error('Erro ao salvar o grupo:', error);
      toast.error('Ocorreu um erro ao salvar o grupo de filtros.');
    }
  };
 
  const handleAddElementClick = (groupId: number) => {
 
    setNextGroupElements([]);
    const currentIndex = groups.findIndex(group => group.id === groupId);
 
    if (currentIndex === -1) {
      return;
    }
 
    const nextGroup = groups[currentIndex + 1];
 
    if (currentIndex === groups.length - 1) {
      setNextGroupElements([
        {
          name: "é o último grupo",
          icon: '',
          id: -1,
        }
      ]);
    } else if (nextGroup && nextGroup.elements) {
      const mappedElements = nextGroup.elements.map((element) => ({
        ...element,
        groupName: nextGroup.name,
      }));
       
      setNextGroupElements(mappedElements);
    } else {
      setNextGroupElements([]);
    }
  };
 
  const getGroups = async () => {
    try {
      const request = await api.request<GroupsResponse>({
        method: "get",
        url: "group/list",
      });
      if (request) {
        setGroups(request.data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };
 
  const onEditClick = async (groupId: number) => {
    const GroupGet = groups.filter((el) => el.id === groupId); // Corrigir o uso do filter
 
    if (GroupGet.length > 0) {
        setUpdateGroup(GroupGet[0]);
        setOpenGroupModal(true);
    } else {
        console.error("Grupo não encontrado");
    }
};
 
  useEffect(() => {
    getGroups();
  }, [])
 
  useEffect(() => {
    if (!openGroupModal) {
      setUpdateGroup(null);
    }
  }, [openGroupModal])
 
  return (
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
            <div className="w-full flex justify-between ">
              <div className="font-title font-bold text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900">
                Configurar filtro
              </div>
              <div className="flex-[1.2] gap-2 justify-end items-center flex flex-row w-" >
                <NewGroup
                  onClick={() => {
                    setOpenGroupModal(true);
                  }}
                  text="Adicionar grupo"
                  icon={<CirclePlus size={20} />}
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
          {groups && groups.length > 0 ? (
            groups.map((value, index) => {
 
              return (
                <Card
                  key={index}
                  onEditClick={onEditClick}
                  elements={value.elements as Element[]}
                  relatedElements={nextGroupElements}
                  title={value.name}
                  description={value.description}
                  id={value.id}
                  onDeleteGroup={() => { setGroups((prev) => prev.filter((group) => group.id !== value.id)) }}
                  onAddElementClick={handleAddElementClick}
                />
              );
            })
          ) : (
            <p>No groups available.</p>
          )}
 
        </div>
      </section>
 
      <GroupModal onSaveClick={(data) => { onSaveGroup(data) }} data={updateGroup} open={openGroupModal} onRequestClose={() => { setOpenGroupModal(false) }} />
    </Template>
  )
}