import Template from "@/src/template";
import Api from "@/src/services/api";
import { useEffect, useState } from "react";

import Breadcrumbs from "@/src/components/common/Breadcrumb";
import NewGroup from "../../../src/components/pages/admin/filtro/buttons/NewGroup";
import { CirclePlus } from 'lucide-react';
import EyeButton from "../../../src/components/pages/admin/filtro/buttons/Eye";
import Card from "../../../src/components/pages/admin/filtro/section/Card";
import GroupModal, { GroupData } from "@/src/components/pages/admin/filtro/modals/GroupModal";


import { toast } from "react-toastify";
import { categorie, Group } from "@/src/store/filter";
import { GroupsResponse, RequestRegister, ResponseRegister } from "@/src/types/filtros";

// TODO : refatorar tipo das chamadas de API

export default function Categorias() {
  const api = new Api();

  const [openGroupModal, setOpenGroupModal] = useState<boolean>(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [updateGroup, setUpdateGroup] = useState<Group | null>();
  const [nextGroupElements, setNextGroupElements] = useState<categorie[]>([]);

  const onSaveGroup = async (data: GroupData) => {
    let dataRequest: RequestRegister = {
      name: data?.name || '',
      description: data?.description || '',
      active: true,
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

    setNextGroupElements([]); // Limpa os elementos do próximo grupo ao adicionar um novo elemento
    const currentIndex = groups.findIndex(group => group.id === groupId);

    if (currentIndex === -1) {
      return; // Caso o grupo não exista, não faça nada
    }
  
    const nextGroup = groups[currentIndex + 1];
  
    if (currentIndex === groups.length - 1) {
      // Se for o último grupo, defina um elemento de "último grupo"
      setNextGroupElements([
        {
          name: "é o último grupo",
          icon: '',
          id: -1, // Você pode definir isso conforme necessário
        }
      ]);
    } else if (nextGroup && nextGroup.categories) {
      // Mapeando os elementos de Element[] para ElementsCard[]
      const mappedElements = nextGroup.categories.map((categorie) => ({
        ...categorie,  // Preserva as propriedades de Element
        groupName: nextGroup.name, // Adiciona a propriedade groupName
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

    if (GroupGet.length > 0) {  // Verifica se encontrou o grupo
        setUpdateGroup(GroupGet[0]); // Apenas usa o primeiro grupo encontrado
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
              <div className="flex-[4] font-title font-bold text-3xl lg:text-4xl flex gap-4 items-end text-zinc-900">
                Configurar filtro
              </div>
                {/* <EyeButton onClick={() => { }} /> */}
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
                  elements={value.categories as categorie[]}
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