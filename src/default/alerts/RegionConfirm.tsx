import { useEffect, useState } from "react";
import Modal from "../../components/utils/Modal";
import { Button, Input } from "../../components/ui/form";
import { isCEPInRegion } from "@/src/helper";
import ShareModal from "@/src/components/utils/ShareModal";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Cookies from "js-cookie";
import Api from "@/src/services/api";
import { getUser } from "@/src/contexts/AuthContext";

export default function RegionConfirm() {
  const api = new Api();
  const [status, setStatus] = useState(false as boolean);
  const [region, setRegion] = useState({} as any);
  const [cep, setCEP] = useState("" as string);

  const verifyCEP = async (e?: any) => {
    e?.preventDefault();

    // let request: any = await api.get({
    //   url: "content/default",
    // });

    const handle: any = {
      cep: cep,
      validate: isCEPInRegion(cep),
    };

    setRegion(handle);

    Cookies.set("fiestou.region", JSON.stringify(handle), { expires: 14 });

    if (handle?.validate) {
      setTimeout(() => {
        setStatus(false);
      }, 2000);
    }

    return false;
  };

  useEffect(() => {
    if (!!window && !Cookies.get("fiestou.region")) {
      const user = getUser();

      if ((user?.address ?? []).filter((item: any) => !!item.zipCode).length) {
        user.address
          ?.filter((item: any) => !!item.zipCode)
          .map((item: any) => {
            setCEP(item.zipCode);
          });
      }

      setStatus(true);
    }
  }, []);

  return (
    <>
      <Modal
        status={status}
        title={
          !!region?.cep && !region?.validate
            ? "Aviso importante!"
            : "Informe sua região"
        }
        close={() => setStatus(false)}
      >
        {!!region?.cep && (
          <>
            {!region?.validate ? (
              <div className="flex flex-col gap-8 text-center pt-5 md:pb-8">
                <div className="text-xl md:text-2xl text-zinc-900 max-w-[32rem] mx-auto">
                  Sua região ainda não está disponível para nossos fornecedores.
                </div>
                {/*
                <div className="text-sm">
                  Compartilhe nosso site com seus fornecedores:
                </div>
                <ShareModal url="https://fiestou.com.br/" title={`Fiestou`} />
                <div>OU</div> */}
                <div>
                  <Button href="contato">Entre em contato com a gente</Button>
                </div>
              </div>
            ) : (
              <div className="text-center pt-5 md:pb-8">
                <div className="inline-block relative p-6 rounded-full text-white bg-green-500 text-2xl">
                  <Icon
                    icon="fa-check"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
                <div className="text-xl pt-4 md:text-2xl text-zinc-900 max-w-[32rem] mx-auto">
                  Sua região está disponível para nossos fornecedores.
                </div>
              </div>
            )}
          </>
        )}

        {!region?.cep && (
          <form onSubmit={(e) => verifyCEP(e)} className="grid gap-4">
            <Input
              defaultValue={cep ?? ""}
              placeholder="Digite seu CEP..."
              onChange={(e: any) => setCEP(e.target.value)}
              className="h-14 text-center"
            />
            <Button>Verificar</Button>
          </form>
        )}
      </Modal>
    </>
  );
}
