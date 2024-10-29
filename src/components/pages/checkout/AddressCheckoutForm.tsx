import { Button, Input } from "@/src/components/ui/form";
import { getZipCode, justNumber } from "@/src/helper";
import { AddressType } from "@/src/models/address";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { useEffect, useState } from "react";

export default function AddressCheckoutForm(attrs: any) {
  const [mounted, setMounted] = useState(false as boolean);

  const [zipCode, setZipCode] = useState("" as string);
  const [street, setStreet] = useState("" as string);
  const [number, setNumber] = useState("" as string);
  const [neighborhood, setNeighborhood] = useState("" as string);
  const [city, setCity] = useState("" as string);
  const [state, setState] = useState("" as string);
  const [country, setCountry] = useState("Brasil" as string);
  const [complement, setComplement] = useState("" as string);
  const [main, setMain] = useState(false as boolean);

  useEffect(() => {
    const handle = {} as AddressType;

    handle["zipCode"] = zipCode;
    handle["street"] = street;
    handle["number"] = number;
    handle["neighborhood"] = neighborhood;
    handle["city"] = city;
    handle["state"] = state;
    handle["country"] = country;
    handle["complement"] = complement;
    handle["main"] = main;

    attrs.onChange(handle);
  }, [
    zipCode,
    street,
    number,
    neighborhood,
    city,
    state,
    country,
    complement,
    main,
  ]);

  useEffect(() => {
    if (!mounted) {
      setMounted(true);

      setZipCode(attrs.address?.zipCode ?? "");
      setStreet(attrs.address?.street ?? "");
      setNumber(attrs.address?.number ?? "");
      setNeighborhood(attrs.address?.neighborhood ?? "");
      setCity(attrs.address?.city ?? "");
      setState(attrs.address?.state ?? "");
      setCountry(attrs.address?.country ?? "");
      setComplement(attrs.address?.complement ?? "");
      setMain(attrs.address?.main ?? "");
    }
  }, [attrs.address]);

  const handleZipCode = async () => {
    const location = await getZipCode(zipCode);

    setZipCode(justNumber(zipCode));
    setCountry("Brasil");

    if (!location?.erro) {
      setStreet(location.logradouro);
      setNeighborhood(location.bairro);
      setCity(location.localidade);
      setState(location.uf);
      setMain(true);
    }
  };

  return (
    <>
      <div className="grid gap-2">
        <div className="relative">
          <input
            name="cep"
            onChange={(e: any) => setZipCode(e.target.value)}
            required
            value={zipCode ?? ""}
            placeholder="CEP"
            className="form-control pr-[3rem]"
          />
          <Button
            type="button"
            style="btn-light"
            onClick={() => handleZipCode()}
            className="absolute top-1/2 -translate-y-1/2 right-0 p-3 mr-1"
          >
            <Icon icon="fa-search" />
          </Button>
        </div>
        <div className="flex gap-2">
          <div className="w-full">
            <input
              name="rua"
              required
              value={street ?? ""}
              placeholder="Rua"
              onChange={(e: any) => setStreet(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="w-[10rem]">
            <input
              name="numero"
              onChange={(e: any) => setNumber(e.target.value)}
              required
              value={number ?? ""}
              placeholder="Número"
              className="form-control"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-full">
            <input
              name="bairro"
              required
              value={neighborhood ?? ""}
              placeholder="Bairro"
              onChange={(e: any) => setNeighborhood(e.target.value)}
              className="form-control"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-full">
            <input
              name="cidade"
              required
              value={city ?? ""}
              placeholder="Cidade"
              onChange={(e: any) => setCity(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="w-[10rem]">
            <input
              name="estado"
              required
              value={state ?? ""}
              placeholder="UF"
              onChange={(e: any) => setState(e.target.value)}
              className="form-control"
            />
          </div>
        </div>
        <div className="w-full">
          <input
            name="complemento"
            onChange={(e: any) => setComplement(e.target.value)}
            required
            value={complement ?? ""}
            placeholder="Complemento. Ex: Ap, Casa, Condomínio, etc..."
            className="form-control"
          />
        </div>
      </div>
    </>
  );
}
