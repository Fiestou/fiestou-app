import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { UserType } from "@/src/models/user";
import { useState } from "react";

export function UsersTable({ users }: { users: UserType[] }) {
  const [search, setSearch] = useState("");

  const filtered = users.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item?.name?.toLowerCase().includes(q) ||
      item?.email?.toLowerCase().includes(q) ||
      item?.phone?.includes(q)
    );
  });

  return (
    <>
      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <Icon icon="fa-search" type="far" className="text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-sm text-zinc-700 placeholder:text-zinc-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-zinc-400 hover:text-zinc-600"
            >
              <Icon icon="fa-times" type="far" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_10rem_1fr_8rem_6rem] gap-4 px-5 py-3 bg-zinc-50 border-b text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <div>Nome</div>
          <div>Celular</div>
          <div>E-mail</div>
          <div className="text-center">Status</div>
          <div className="text-center">Ações</div>
        </div>
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_10rem_1fr_8rem_6rem] gap-4 px-5 py-4 border-b last:border-0 hover:bg-zinc-50 transition-colors items-center"
            >
              <div className="font-medium text-zinc-900 truncate">
                {item.name}
              </div>
              <div className="text-sm text-zinc-600">{item.phone || "-"}</div>
              <div className="text-sm text-zinc-600 truncate">{item.email}</div>
              <div className="text-center">
                <span
                  className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                    item.status
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.status ? "Ativo" : "Bloqueado"}
                </span>
              </div>
              <div className="flex justify-center gap-2">
                <Link
                  href={`/admin/usuarios/${item.id}`}
                  title="Editar"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-blue-100 hover:text-blue-600 transition-colors text-zinc-500"
                >
                  <Icon icon="fa-pen" type="far" className="text-xs" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-zinc-400">
            <Icon icon="fa-search" type="far" className="text-3xl mb-2" />
            <p>Nenhum usuário encontrado</p>
          </div>
        )}
      </div>
      {search && (
        <div className="pt-3 text-sm text-zinc-400">
          {filtered.length} de {users.length} usuários
        </div>
      )}
    </>
  );
}
