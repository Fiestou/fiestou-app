import { useEffect, useState } from "react";
import Modal from "../../components/utils/Modal";
import { Button, Input } from "../../components/ui/form";
import { isCEPInRegion } from "@/src/helper";
import ShareModal from "@/src/components/utils/ShareModal";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Cookies from "js-cookie";
import Api from "@/src/services/api";
import { getUser } from "@/src/contexts/AuthContext";
import LocationComponent from "@/src/components/utils/LocationComponent";

interface Location {
  lat: number;
  lng: number;
}

const expires = { expires: 14 };

export default function RegionConfirm() {
  const api = new Api();

  const [formLoader, setFormLoader] = useState(false as boolean);

  const [askForZipCode, setAskForZipCode] = useState(false as boolean);
  const [region, setRegion] = useState({} as any);
  const [cep, setCEP] = useState("" as string);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(behaviorPosition, behaviorError);
    } else {
      setAskForZipCode(true);
      console.log("Geolocalização não é suportada por este navegador.");
    }
  };

  const behaviorPosition = async (position: GeolocationPosition) => {
    setFormLoader(true);

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    try {
      const response = await fetch(
        `/api/get-cep-from-coords?lat=${lat}&lng=${lng}`
      );

      const data = await response.json();

      if (data.cep) {
        registerRegion(data.cep);
      } else {
        setAskForZipCode(true);
        console.error("Erro ao buscar o CEP");
      }
    } catch (error) {
      setAskForZipCode(true);
      console.error("Erro ao buscar o CEP:", error);
    }

    setFormLoader(false);
  };

  const behaviorError = (error: GeolocationPositionError) => {
    setAskForZipCode(true);

    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log("Permissão negada pelo usuário.");
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Informação de localização indisponível.");
        break;
      case error.TIMEOUT:
        console.log("O pedido para obter a localização expirou.");
        break;
    }
  };

  const verifyCEP = async (e?: any) => {
    e?.preventDefault();

    setFormLoader(true);

    const handle: any = {
      cep: cep,
      validate: isCEPInRegion(cep),
    };

    setRegion(handle);

    Cookies.set("fiestou.region", JSON.stringify(handle), expires);

    if (handle?.validate) {
      setTimeout(() => {
        setAskForZipCode(false);
      }, 2000);
    }

    setTimeout(() => {
      setFormLoader(false);
    }, 2000);

    return false;
  };

  const registerRegion = (zipCode: string) => {
    const handle: any = {
      cep: zipCode,
      validate: isCEPInRegion(zipCode),
    };

    setRegion(handle);

    Cookies.set("fiestou.region", JSON.stringify(handle), expires);

    setCEP(zipCode);
  };

  useEffect(() => {
    if (!!window) {
      if (!!Cookies.get("fiestou.region")) {
        const handle: any = JSON.parse(Cookies.get("fiestou.region") ?? "");

        setRegion(handle);
        setCEP(handle.cep);
      } else {
        const user = getUser();

        let zipCode = "";

        if (
          !!user?.address &&
          (user?.address ?? []).filter((item: any) => !!item.zipCode).length
        ) {
          user.address
            ?.filter((item: any) => !!item.zipCode)
            .map((item: any) => {
              zipCode = item.zipCode;
            });
        }

        if (!!zipCode) {
          registerRegion(zipCode);
        } else {
          getLocation();
        }
      }
    }
  }, []);

  return (
    <>
      <div>
        <div
          onClick={() => setAskForZipCode(true)}
          className="flex cursor-pointer py-2 justify-end gap-2 items-center text-white"
        >
          <Icon icon="fa-map-marker-alt" className="text-xl" />
          <div className="grid text-nowrap">
            {!!region.cep && <span className="text-xs">{region.cep}</span>}

            <span className="text-xs">
              {!!region?.validate ? "Região disponível" : "Região indisponível"}
            </span>
          </div>
        </div>
      </div>

      <Modal
        status={askForZipCode}
        title="Informe sua região"
        close={() => setAskForZipCode(false)}
      >
        <div className="text-zinc-950">
          <>
            {!region?.validate ? (
              <div className="flex items-center gap-2 mb-4">
                <div className="relative p-3 rounded-full text-white bg-yellow-300">
                  <Icon
                    icon="fa-exclamation"
                    type="fa"
                    className="absolute text-xs text-zinc-950 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
                <div className="w-full">
                  Sua região ainda não está disponível para nossos fornecedores.
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-4">
                <div className="relative p-3 rounded-full text-white bg-green-500">
                  <Icon
                    icon="fa-check"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
                <div className="w-full">
                  Sua região está disponível para nossos fornecedores.
                </div>
              </div>
            )}
          </>

          <form onSubmit={(e) => verifyCEP(e)} className="grid gap-4">
            <Input
              defaultValue={cep ?? ""}
              placeholder="Digite seu CEP..."
              onChange={(e: any) => setCEP(e.target.value)}
              className="h-14 text-center"
            />
            <Button loading={formLoader}>Verificar</Button>
          </form>
        </div>
      </Modal>
    </>
  );
}
