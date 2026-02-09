import Template from "@/src/template";
import { useUsers } from "@/src/hooks/useUsers";
import { UsersTable } from "@/src/components/admin/users/UsersTable";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export default function Usuarios() {
  const { users, loading, error } = useUsers();

  const activeCount = users.filter((i) => !!i.status).length;

  return (
    <Template header={{ template: "admin", position: "solid" }}>
      <section>
        <div className="container-medium pt-8">
          <Breadcrumbs
            links={[
              { url: "/admin", name: "Admin" },
              { url: "/admin/usuarios", name: "Usuários" },
            ]}
          />
        </div>
      </section>

      <section>
        <div className="container-medium py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-title font-bold text-3xl text-zinc-900">
              Usuários
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Total</p>
              <p className="text-2xl font-bold text-zinc-900">{users.length}</p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Ativos</p>
              <p className="text-2xl font-bold text-green-600">
                {activeCount}
              </p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Bloqueados</p>
              <p className="text-2xl font-bold text-red-600">
                {users.length - activeCount}
              </p>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-400"></div>
              <span className="ml-3 text-zinc-500">Carregando...</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
              {error}
            </div>
          )}
          {!loading && !error && <UsersTable users={users} />}

          <div className="pt-3 text-sm text-zinc-400">
            Mostrando {users.length} usuários
          </div>
        </div>
      </section>
    </Template>
  );
}
