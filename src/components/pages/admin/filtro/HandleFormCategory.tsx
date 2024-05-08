import { Input, Label, Select } from "@/src/components/ui/form";
import FileManager from "@/src/components/ui/form/FileManager";
import { useEffect } from "react";

export default function HandleFormCategory({
  item,
  emit,
}: {
  item: any;
  emit: Function;
}) {
  return (
    <>
      <div className="form-group">
        <Label style="float">Nome</Label>
        <Input
          value={item?.title ?? ""}
          onChange={(e: any) =>
            emit({
              title: e.target.value,
            })
          }
          required
          className="py-2"
        />
      </div>
      <div className="form-group">
        <Label style="float">Destacar categoria</Label>
        <Select
          onChange={(e: any) =>
            emit({
              feature: e.target.value == "on",
            })
          }
          className="py-2"
          name="destaque"
          value={!!item?.feature ? "on" : "off"}
          options={[
            {
              name: "Não",
              value: "off",
            },
            {
              name: "Sim",
              value: "on",
            },
          ]}
        />
      </div>

      {!item?.parent && (
        <div className="flex gap-4">
          <div className="form-group w-full">
            <Label style="float">Quantidade de seleção</Label>
            <Select
              onChange={(e: any) =>
                emit({
                  multiple: e.target.value == "true",
                })
              }
              className="py-2"
              name="destaque"
              value={!!item?.multiple}
              options={[
                {
                  name: "Múltipla",
                  value: true,
                },
                {
                  name: "Única",
                  value: false,
                },
              ]}
            />
          </div>

          {!!item?.multiple && (
            <div className="form-group w-full max-w-[4rem]">
              <Label style="float">Máx</Label>
              <Input
                value={item?.limitSelect ?? 0}
                onChange={(e: any) =>
                  emit({
                    limitSelect: e.target.value,
                  })
                }
                required
                className="py-2"
              />
            </div>
          )}

          <div className="form-group w-full max-w-[12rem]">
            <Label style="float">Tamanho do elemento</Label>
            <Select
              onChange={(e: any) =>
                emit({
                  style: e.target.value,
                })
              }
              className="py-2"
              name="estilo"
              value={item?.style ?? ""}
              options={[
                {
                  name: "Pequeno",
                  value: "md",
                },
                {
                  name: "Médio",
                  value: "lg",
                },
                {
                  name: "Grande",
                  value: "xl",
                },
              ]}
            />
          </div>
        </div>
      )}

      <div className="form-group">
        <FileManager
          multiple={false}
          value={item?.image ?? []}
          onChange={(value: any) => {
            emit({
              image: value,
            });
          }}
          options={{
            dir: "categories",
            type: "thumb",
          }}
          className="py-[.6rem] text-sm"
        />
      </div>
    </>
  );
}
