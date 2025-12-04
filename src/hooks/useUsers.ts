import { useEffect, useState } from "react";
import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";

export function useUsers() {
  const api = new Api();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUsers = async () => {
    try {
      setLoading(true);
      const request: any = await api.bridge({
        method: "get",
        url: "users/list",
        data: { person: "client" },
      });

      if (request.response) setUsers(request.data);
      else setError("Não foi possível carregar os usuários");
    } catch (err: any) {
      setError("Erro interno ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return { users, loading, error };
}
