import Template from "@/src/template";
import { useUsers } from "@/src/hooks/useUsers";
import { UsersTable } from "@/src/components/admin/users/UsersTable";

export default function Usuarios() {
  const { users, loading, error } = useUsers();

  return (
    <Template header={{ template: "admin", position: "solid" }}>
      <section>
        <div className="container-medium pt-12 flex justify-between">
          <span>Usuários &gt; Lista</span>
          {/* <div className="flex items-center gap-2 underline cursor-pointer">
            Precisa de ajuda? <Icon icon="fa-question-circle" />
          </div> */}
        </div>
      </section>

      <section className="pt-6 container-medium pb-12">
        {loading && <div>Carregando...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && <UsersTable users={users} />}

        <div className="pt-4">
          Mostrando 1 página de 1 com {users.length} usuários
        </div>
      </section>
    </Template>
  );
}
