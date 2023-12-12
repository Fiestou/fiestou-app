import Template from "@/src/template";

export default function Admin() {
  return (
    <Template
      header={{
        template: "admin",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      <section className="">
        <div className="container-medium py-14">
          <div className="font-title font-bold text-5xl flex gap-4 items-center mb-4 text-zinc-900">
            Olá, Admin
          </div>
          <div>
            Lorem ipsum dolor sit amet consectetu enim nisi massa rutrum
            tristique.
          </div>
        </div>

        <div className="text-center mt-20">
          <a href="/logout" className="underline text-zinc-900 font-semibold">
            Sair da conta
          </a>
        </div>
      </section>
    </Template>
  );
}
