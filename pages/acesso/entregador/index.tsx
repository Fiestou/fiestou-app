import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useContext, useState } from "react";
import { Button, Input, Label } from "@/src/components/ui/form";
import { AuthContext } from "@/src/contexts/AuthContext";

const formInitial = {
  sended: false,
  loading: false,
  email: "",
  password: "",
};

export default function Restrito() {
  const { SignIn } = useContext(AuthContext);

  const router = useRouter();
  const [form, setForm] = useState(formInitial);

  const setFormValue = (value: any) => {
    setForm({ ...form, ...value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setFormValue({ loading: true });

    const user = await SignIn({
      email: form.email,
      password: form.password,
    });

    if (!user) {
      setFormValue({ loading: false, sended: false });
    }
  };

  return (
    <Template
      header={{
        template: "clean",
        position: "solid",
        background: "purple",
      }}
    >
      <div className="container-medium">
        <div className="py-6 md:py-20">
          <div className="max-w-md mx-auto">
            <form
              onSubmit={(e) => {
                handleSubmit(e);
              }}
              method="POST"
            >
              <div className="text-center mb-4 md:mb-10">
                <h3 className="font-title text-zinc-900 font-bold text-4xl text-center">
                  Restrito
                </h3>
                <div className="pt-2">
                  Entre na sua conta ou faça seu cadastro
                </div>
              </div>

              <div className="form-group">
                <Label>E-mail</Label>
                <Input
                  onChange={(e: any) => {
                    setFormValue({ email: e.target.value });
                  }}
                  type="text"
                  name="email"
                  placeholder="Informe seu e-mail"
                  required
                />
              </div>

              <div className="form-group">
                <Label>Senha</Label>
                <Input
                  onChange={(e: any) => {
                    setFormValue({ password: e.target.value });
                  }}
                  type="password"
                  name="senha"
                  placeholder="*******"
                  required
                />
              </div>

              <div className="form-group">
                <Button loading={form.loading}>Acessar</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Template>
  );
}
