import Template from "@/src/template";
import Api from "@/src/services/api";
import { useEffect, useState, useCallback } from "react";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import GroupModal, { GroupData } from "@/src/components/pages/admin/filtro/modals/GroupModal";
import { toast } from "react-toastify";
import { categorie, Group } from "@/src/store/filter";
import {
  GroupsResponse,
  RequestRegister,
  ResponseRegister,
} from "@/src/types/filtros";
import FilterGroupCard from "@/src/components/pages/admin/filtro/FilterGroupCard";
import Icon from "@/src/icons/fontAwesome/FIcon";

export default function Categorias() {
  const api = new Api();

  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [targetGroups, setTargetGroups] = useState<Group[]>([]);
  const [updateGroup, setUpdateGroup] = useState<Group | null>(null);
  const [nextGroupElements, setNextGroupElements] = useState<categorie[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const [groupsRes, targetRes] = await Promise.all([
        api.request<GroupsResponse>({ method: "get", url: "group/list" }),
        api.request<GroupsResponse>({ method: "get", url: "group/targetadcpbl" }),
      ]);

      setGroups(groupsRes?.data ?? []);
      setTargetGroups(targetRes?.data ?? []);
    } catch (error) {
      toast.error("Erro ao carregar os grupos.");
    }
    setLoading(false);
  }, []);

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
      toast.error("Erro ao salvar o grupo.");
    }
  };

  const onEditClick = (groupId: number) => {
    const found = groups.find((g) => g.id === groupId) || targetGroups.find((g) => g.id === groupId);
    if (!found) return;
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

  const totalElements = [...groups, ...targetGroups].reduce(
    (acc, g) => acc + (g.categories?.length || 0), 0
  );

  const allIcons = [...groups, ...targetGroups]
    .flatMap((g) => g.categories?.map((c) => c.icon) || [])
    .filter((url, idx, arr) => url && arr.indexOf(url) === idx);

  return (
    <Template header={{ template: "admin", position: "solid" }}>
      <section>
        <div className="container-medium pt-8">
          <Breadcrumbs
            links={[
              { url: "/admin", name: "Admin" },
              { url: "/admin/filtro", name: "Filtro" },
            ]}
          />
        </div>
      </section>

      <section>
        <div className="container-medium py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-title font-bold text-3xl text-zinc-900">
              Filtros e Categorias
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Grupos</p>
              <p className="text-2xl font-bold text-zinc-900">
                {groups.length + targetGroups.length}
              </p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Elementos</p>
              <p className="text-2xl font-bold text-zinc-900">{totalElements}</p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Público-alvo</p>
              <p className="text-2xl font-bold text-blue-600">
                {targetGroups.reduce((acc, g) => acc + (g.categories?.length || 0), 0)}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-400"></div>
              <span className="ml-3 text-zinc-500">Carregando...</span>
            </div>
          ) : (
            <div className="grid gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Icon icon="fa-bullseye" type="far" className="text-blue-600 text-sm" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">Público-alvo</h2>
                    <p className="text-sm text-zinc-400">Segmentação de público para os produtos</p>
                  </div>
                </div>
                <div className="grid gap-4">
                  {targetGroups.length > 0 ? (
                    targetGroups.map((group) => (
                      <FilterGroupCard
                        key={group.id}
                        id={group.id}
                        title={group.name}
                        description={group.description}
                        elements={group.categories ?? []}
                        relatedElements={nextGroupElements}
                        isTargetGroup
                        onEditClick={onEditClick}
                        onDeleteGroup={() =>
                          setTargetGroups((prev) => prev.filter((g) => g.id !== group.id))
                        }
                        onAddElementClick={handleAddElementClick}
                        onRefresh={fetchGroups}
                        allIcons={allIcons}
                      />
                    ))
                  ) : (
                    <div className="bg-white border rounded-xl p-8 text-center text-zinc-400">
                      Nenhum grupo de público-alvo
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Icon icon="fa-filter" type="far" className="text-amber-600 text-sm" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-900">Filtro Dinâmico</h2>
                      <p className="text-sm text-zinc-400">Grupos e elementos que aparecem como filtro na loja</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenGroupModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <Icon icon="fa-plus" type="far" className="text-xs" />
                    Novo grupo
                  </button>
                </div>
                <div className="grid gap-4">
                  {groups.length > 0 ? (
                    groups.map((group) => (
                      <FilterGroupCard
                        key={group.id}
                        id={group.id}
                        title={group.name}
                        description={group.description}
                        elements={group.categories ?? []}
                        relatedElements={nextGroupElements}
                        onEditClick={onEditClick}
                        onDeleteGroup={() =>
                          setGroups((prev) => prev.filter((g) => g.id !== group.id))
                        }
                        onAddElementClick={handleAddElementClick}
                        onRefresh={fetchGroups}
                        allIcons={allIcons}
                      />
                    ))
                  ) : (
                    <div className="bg-white border rounded-xl p-8 text-center text-zinc-400">
                      Nenhum grupo cadastrado
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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
