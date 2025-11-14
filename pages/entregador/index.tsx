import Product from "@/src/components/common/Product";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Image from "next/image";
import Link from "next/link";
import Partner from "@/src/components/common/ProductFeatures";
import Template from "@/src/template";

export default function Entregador() {
  return (
    <Template
      header={{
        template: "default",
        position: "solid",
      }}
    >
      <section className="">
        <div className="container-medium py-12">
          Produtos {">"} Title
          <div className="font-title font-bold text-4xl flex gap-4 items-center mt-10 text-zinc-900">
            Lojas Entregador
          </div>
        </div>
      </section>
      <section className="">
        <div className="container-medium">
          <div className="grid grid-cols-3 gap-10">
            {/* {[1, 2, 3].map((item, key) => (
              <div key={key}>
                <Partner params={item} />
              </div>
            ))} */}
          </div>
        </div>
      </section>
    </Template>
  );
}
