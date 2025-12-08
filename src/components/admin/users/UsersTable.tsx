import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { UserType } from "@/src/models/user";

export function UsersTable({ users }: { users: UserType[] }) {
  if (!users.length) {
    return (
      <div className="p-8 text-center text-zinc-500">
        Nenhum usuário encontrado.
      </div>
    );
  }

  return (
    <div className="border">
      <div className="flex bg-zinc-100 p-8 gap-8 font-bold text-zinc-900 font-title">
        <div className="w-full">Nome</div>
        <div className="w-[48rem]">Celular</div>
        <div className="w-[64rem]">E-mail</div>
        <div className="w-[32rem] text-center">Status</div>
        <div className="w-[48rem] text-center">Ações</div>
      </div>

      {users.map((item) => (
        <div
          key={item.id}
          className="flex border-t p-8 gap-8 text-zinc-900 hover:bg-zinc-50 bg-opacity-5 ease items-center"
        >
          <div className="w-full">{item.name}</div>
          <div className="w-[50rem]">{item.phone}</div>
          <div className="w-[64rem]">{item.email}</div>
          <div className="w-[46rem] text-center">
            <span
              className={`rounded-md px-3 py-2 ${
                item.status ? "bg-green-200" : "bg-red-200"
              }`}
            >
              {item.status ? "Ativo" : "Bloqueado"}
            </span>
          </div>
          <div className="w-[40rem] text-center flex gap-2">
            <Link
              href={`/admin/usuarios/${item.id}`}
              title="Editar"
              className="rounded-md bg-zinc-100 hover:bg-yellow-300 ease py-1 px-2 flex items-center"
            >
              Editar
              <Icon icon="fa-pen" type="far" className="ml-2" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
