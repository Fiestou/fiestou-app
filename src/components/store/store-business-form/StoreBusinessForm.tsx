import { Input } from "../../ui/form";


export default function StoreBusinessForm({
  editing,
  document,
  companyName,
  // oldDocument,
  // oldCompanyName,
  onChangeDocument,
  onChangeCompanyName,
  onSubmit,
  actions,
}: {
  editing: boolean;
  document: string;
  companyName: string;
  oldDocument: string;
  oldCompanyName: string;
  onChangeDocument: (value: string) => void;
  onChangeCompanyName: (value: string) => void;
  onSubmit: (e: any) => void;
  actions: React.ReactNode;
}) {
  return (
    <form
      onSubmit={onSubmit}
      method="POST"
      className="grid gap-4 border-b pb-8 mb-0"
    >
      <div className="flex items-center">
        <div className="w-full">
          <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
            Empresa
          </h4>
        </div>
        <div className="w-fit">{actions}</div>
      </div>

      <div className="w-full">
        {editing ? (
          <div className="grid gap-2">
            <Input
              name="cnpj"
              onChange={(e: any) => onChangeDocument(e.target.value)}
              required
              value={document}
              placeholder="CNPJ"
            />
            <Input
              name="nome"
              onChange={(e: any) =>
                onChangeCompanyName(e.target.value)
              }
              required
              value={companyName}
              placeholder="Nome jurídico"
            />
          </div>
        ) : document || companyName ? (
          <>
            <div>CNPJ: {document}</div>
            <div>Nome jurídico: {companyName}</div>
          </>
        ) : (
          "Insira os dados da empresa"
        )}
      </div>
    </form>
  );
}
