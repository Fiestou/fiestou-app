import { print_r } from "@/src/helper";
import { UserType } from "@/src/models/user";
import Api from "@/src/services/api";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button, Select } from "../ui/form";
import { MailType } from "@/src/models/mail";

const formInitial = {
  edit: "",
  loading: false,
};

export default function UserEditAdmin({ user }: { user: UserType }) {
  const api = new Api();

  const router = useRouter();

  const [form, setForm] = useState(formInitial);
  const handleForm = (value: Object) => {
    setForm({ ...form, ...value });
  };

  const [data, setData] = useState({} as UserType);
  const handleData = (value: Object) => {
    setData({ ...data, ...value });
  };

  const submitUser = async (e: any) => {
    e.preventDefault();

    handleForm({ loading: true });

    const handle: UserType = {
      ...user,
      ...data,
    };

    const request: any = await api.bridge({
      url: "users/validate",
      data: {
        ...handle,
      },
    });

    if (request.response) {
      router.push({ pathname: "/admin/usuarios" });
    }

    handleForm({ edit: "", loading: false });
  };

  return (
    <section className="">
      <div className="container-medium pb-12">
        <div className="grid md:flex gap-10 md:gap-24">
          <div className="w-full">
            {Object.entries(user).map((item: any, key: any) => (
              <div key={key} className="flex gap-2 border-b py-2">
                <div className="font-semibold">{item[0]}:</div>{" "}
                <pre className="whitespace-pre-wrap">{print_r(item[1])}</pre>
              </div>
            ))}
          </div>
          <div className="w-full max-w-[24rem]">
            <form className="grid" onSubmit={(e: any) => submitUser(e)}>
              <div className="pb-6">
                <Select
                  name="status"
                  value={user.status}
                  options={[
                    {
                      name: "Ativo",
                      value: 1,
                    },
                    {
                      name: "Bloqueado",
                      value: 0,
                    },
                  ]}
                  onChange={(e: any) => handleData({ status: e.target.value })}
                />
              </div>
              <div className="pb-6 grid">
                <Button loading={form.loading}>Salvar</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
