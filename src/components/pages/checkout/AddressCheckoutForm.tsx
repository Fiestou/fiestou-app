import { Button, Input } from "@/src/components/ui/form";
import { getZipCode, justNumber } from "@/src/helper";
import { AddressType } from "@/src/models/address";

export default function AddressCheckoutForm(attrs: any) {
  const handleChange = (value: any) => {
    attrs.onChange({
      ...attrs.address,
      ...value,
    });
  };

  const handleZipCode = async (zipCode: string) => {
    const location = await getZipCode(zipCode);

    let handle = {} as AddressType;

    handle["zipCode"] = justNumber(zipCode);
    handle["country"] = "Brasil";

    if (!location?.erro) {
      handle["street"] = location.logradouro;
      handle["neighborhood"] = location.bairro;
      handle["city"] = location.localidade;
      handle["state"] = location.uf;
      handle["main"] = true;
    }

    handleChange(handle);
  };

  return (
    <>
      <div className="grid gap-2">
        <Input
          name="cep"
          onChange={(e: any) => handleZipCode(e.target.value)}
          required
          defaultValue={attrs.address?.zipCode}
          placeholder="CEP"
        />
        <div className="flex gap-2">
          <div className="w-full">
            <Input
              name="rua"
              required
              defaultValue={attrs.address?.street}
              placeholder="Rua"
              onChange={(e: any) => handleChange({ street: e.target.value })}
            />
          </div>
          <div className="w-[10rem]">
            <Input
              name="numero"
              onChange={(e: any) =>
                handleChange({
                  number: e.target.value,
                })
              }
              required
              defaultValue={attrs.address?.number}
              placeholder="Número"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-full">
            <Input
              name="bairro"
              required
              defaultValue={attrs.address?.neighborhood}
              placeholder="Bairro"
              onChange={(e: any) =>
                handleChange({
                  neighborhood: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-full">
            <Input
              name="cidade"
              required
              defaultValue={attrs.address?.city}
              placeholder="Cidade"
              onChange={(e: any) =>
                handleChange({
                  city: e.target.value,
                })
              }
            />
          </div>
          <div className="w-[10rem]">
            <Input
              name="estado"
              required
              defaultValue={attrs.address?.state}
              placeholder="UF"
              onChange={(e: any) =>
                handleChange({
                  state: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="w-full">
          <Input
            name="complemento"
            onChange={(e: any) =>
              handleChange({
                complement: e.target.value,
              })
            }
            required
            defaultValue={attrs.address?.complement}
            placeholder="Complemento. Ex: Ap, Casa, Condomínio, etc..."
          />
        </div>
      </div>
    </>
  );
}
