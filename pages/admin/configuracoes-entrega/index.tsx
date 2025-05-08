import { useEffect, useMemo, useState } from "react";
import Input from "@/src/components/ui/form/InputUI";
import Button from "@/src/components/ui/form/ButtonUI";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import Api from "../../../src/services/api";
import InputMask from "react-input-mask";
import Pagination from "@/src/components/ui/Pagination";

const PAGE_SIZE = 10;

export default function ConfiguracoesEntrega() {
  const api = useMemo(() => new Api(), []);
  // Formulário para criar nova região
  const [newRegion, setNewRegion] = useState({
    name: "",
    start: "",
    finish: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Listagem
  const [regions, setRegions] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [links, setLinks] = useState<any[]>([]);

  // Fetch paginado
  const fetchRegions = async (pageNum = 1) => {
    const response = await api.request<any>({
      method: "get",
      url: `zipcode-cities-range?page=${pageNum}`,
    });
    const data = response?.data;
    setRegions(data.data || []);
    setPage(data.current_page);
    setTotal(data.total);
    setLastPage(data.last_page);
    setLinks(data.links);
  };

  useEffect(() => {
    fetchRegions(page);
    // eslint-disable-next-line
  }, [page]);

  const handleInputChange = (field: string, value: string) => {
    setNewRegion((region) => ({ ...region, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");
    try {
      const payload = {
        ...newRegion,
        start: newRegion.start.replace(/\D/g, ""),
        finish: newRegion.finish.replace(/\D/g, ""),
      };
      await api.request<any>({
        method: "post",
        url: "zipcode-cities-range",
        data: payload,
      });
      setSuccess(true);
      setNewRegion({ name: "", start: "", finish: "" });
      fetchRegions(1);
      setPage(1);
    } catch (err: any) {
      setError("Erro ao salvar. Tente novamente.");
    }
    setLoading(false);
  };

  // Paginação
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Template
      header={{ template: "admin", position: "solid" }}
      footer={{ template: "clean" }}
    >
      <section className="">
        <div className="container-medium pt-12 pb-8 md:py-12">
          <div className="flex items-center mt-10">
            <div className="font-title font-bold text-3xl md:text-4xl flex gap-4 items-center text-zinc-900 w-full">
              Configuração de regiões de entrega
            </div>
          </div>
        </div>
      </section>
      <section className="">
        <div className="container-medium pb-12">
          {/* Formulário para nova região */}
          <form onSubmit={handleSubmit} method="POST">
            <div className="border-t pt-4 pb-2">
              <div className="grid gap-8">
                <div className="">
                  <div className="flex gap-2 items-end mb-2">
                    <label className="text-zinc-900 font-bold">
                      Nova região de atendimento
                    </label>
                  </div>
                  <div className="space-y-2 mt-2">
                    <Input
                      placeholder="Nome da cidade"
                      name="city-name"
                      value={newRegion.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                    />
                    <div className="flex gap-2">
                      <InputMask
                        mask="99999-999"
                        maskChar={null}
                        value={newRegion.start}
                        onChange={(e) =>
                          handleInputChange("start", e.target.value)
                        }
                      >
                        {(inputProps) => (
                          <Input
                            {...inputProps}
                            placeholder="CEP inicial"
                            required
                          />
                        )}
                      </InputMask>
                      <InputMask
                        mask="99999-999"
                        maskChar={null}
                        value={newRegion.finish}
                        onChange={(e) =>
                          handleInputChange("finish", e.target.value)
                        }
                      >
                        {(inputProps) => (
                          <Input {...inputProps} placeholder="CEP final" required />
                        )}
                      </InputMask>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-4 items-center">
                    <Button type="submit" className="px-10" loading={loading}>
                      Salvar
                    </Button>
                    {success && (
                      <span className="text-green-600">Salvo com sucesso!</span>
                    )}
                    {error && <span className="text-red-500">{error}</span>}
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Listagem das regiões cadastradas */}
          <div className="border-t pt-8 mt-8">
            <h4 className="text-2xl text-zinc-900 pb-6">Regiões cadastradas</h4>
            <div className="grid gap-4">
              {regions.length === 0 && (
                <div className="text-zinc-400">Nenhuma região cadastrada.</div>
              )}
              {regions.map((region, idx) => (
                <div
                  key={idx}
                  className="border rounded p-3 bg-zinc-50 flex flex-col md:flex-row md:items-center md:gap-6"
                >
                  <div className="font-semibold text-zinc-800 flex-1">
                    {region.name}
                  </div>
                  <div className="flex gap-2 text-sm items-center">
                    <span className="bg-zinc-200 rounded px-2 py-1">
                      {region.start}
                    </span>
                    <Icon icon="fa-arrow-right" className="text-zinc-500" />
                    <span className="bg-zinc-200 rounded px-2 py-1">
                      {region.finish}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* Paginação */}
            {links.length > 0 && (
              <Pagination links={links} onPageChange={setPage} />
            )}
          </div>
        </div>
      </section>
    </Template>
  );
}
