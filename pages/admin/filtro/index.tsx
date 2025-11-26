import Template from "@/src/template";
import Api from "@/src/services/api";
import { useEffect, useState, useCallback } from "react";

import Breadcrumbs from "@/src/components/common/Breadcrumb";
import NewGroup from "../../../src/components/pages/admin/filtro/buttons/NewGroup";
import { CirclePlus } from "lucide-react";
import Card from "../../../src/components/pages/admin/filtro/section/Card";
import GroupModal, { GroupData } from "@/src/components/pages/admin/filtro/modals/GroupModal";
import { toast } from "react-toastify";
import { categorie, Group } from "@/src/store/filter";
import {
  GroupsResponse,
  RequestRegister,
  ResponseRegister,
} from "@/src/types/filtros";

export default function Categorias() {
  const api = new Api();

  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [targetGroups, setTargetGroups] = useState<Group[]>([]);
  const [updateGroup, setUpdateGroup] = useState<Group | null>(null);
  const [nextGroupElements, setNextGroupElements] = useState<categorie[]>([]);

  // 🚀 Busca de grupos corrigida com rotas corretas
  const fetchGroups = useCallback(async () => {
    try {
      const [groupsRes, targetRes] = await Promise.all([
        api.request<GroupsResponse>({ method: "get", url: "group/list" }),
        api.request<GroupsResponse>({ method: "get", url: "group/targetadcpbl" }),
      ]);

      setGroups(groupsRes?.data ?? []);
      setTargetGroups(targetRes?.data ?? []);
    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
      toast.error("Erro ao carregar os grupos.");
    }
  }, []);

  // 🧾 Salvar grupo (create ou update)
  const onSaveGroup = async (data: GroupData) => {
    const payload: RequestRegister = {
      name: data?.name || "",
      description: data?.description || "",
      active: true,
      segment: data?.segment ?? false,
    };

    try {
      const response = await api.bridge<ResponseRegister>({
        method: data.id ? "put" : "post",
        url: data.id ? `group/update/${data.id}` : "group/register",
        data: payload,
      });

      if (!response) return toast.error("Erro ao salvar o grupo.");

      toast.success("Grupo salvo com sucesso!");
      setOpenGroupModal(false);
      fetchGroups();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar o grupo.");
    }
  };

  const onEditClick = (groupId: number) => {
    const found = groups.find((g) => g.id === groupId);
    if (!found) return console.error("Grupo não encontrado");
    setUpdateGroup(found);
    setOpenGroupModal(true);
  };

  const handleAddElementClick = (groupId: number) => {
    const index = groups.findIndex((g) => g.id === groupId);
    if (index === -1 || index === groups.length - 1) {
      return setNextGroupElements([{ id: -1, name: "É o último grupo", icon: "" }]);
    }

    const next = groups[index + 1];
    const mapped =
      next.categories?.map((el) => ({ ...el, groupName: next.name })) ?? [];
    setNextGroupElements(mapped);
  };

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (!openGroupModal) setUpdateGroup(null);
  }, [openGroupModal]);

  // 🔁 Renderização dos cards otimizada
  const renderCards = (items: Group[], isTarget = false) => {
    if (!items?.length) return <p>Nenhum grupo disponível.</p>;

    return items.map((group) => (
      <Card
        key={group.id}
        id={group.id}
        title={group.name}
        description={group.description}
        elements={group.categories ?? []}
        relatedElements={nextGroupElements}
        grouptargeadc={isTarget}
        onEditClick={onEditClick}
        onDeleteGroup={() => setGroups((prev) => prev.filter((g) => g.id !== group.id))}
        onAddElementClick={handleAddElementClick}
      />
    ));
  };

  return (
    <Template header={{ template: "admin", position: "solid" }}>
      <section>
        <div className="container-medium pt-12">
          <Breadcrumbs
            links={[
              { url: "/admin", name: "Admin" },
              { url: "/admin/blog", name: "Blog" },
            ]}
          />
        </div>
      </section>

      <section className="m-5 flex flex-col items-center gap-3 mx-auto">
        <div className="max-w-[1000px] w-full flex flex-col gap-3">
          <h2 className="font-title text-3xl lg:text-4xl font-bold text-zinc-900">
            Configurar público-alvo
          </h2>
          {renderCards(targetGroups, true)}
        </div>

        <div className="max-w-[1000px] w-full flex flex-col gap-3">
          <div className="flex justify-between">
            <h2 className="font-title text-3xl lg:text-4xl font-bold text-zinc-900">
              Configurar Filtro Dinâmico
            </h2>
            <NewGroup
              onClick={() => setOpenGroupModal(true)}
              text="Adicionar grupo"
              icon={<CirclePlus size={20} />}
            />
          </div>
          {renderCards(groups)}
        </div>
      </section>

      <GroupModal
        data={updateGroup}
        open={openGroupModal}
        onSaveClick={onSaveGroup}
        onRequestClose={() => setOpenGroupModal(false)}
      />
    </Template>
  );
}
