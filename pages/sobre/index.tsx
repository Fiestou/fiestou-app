import Api from "@/src/services/api";
import Template from "@/src/template";
import Img from "@/src/components/utils/ImgBase";
import Newsletter from "@/src/components/common/Newsletter";
import { clean, getImage } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Icon from "@/src/icons/fontAwesome/FIcon";

interface SobreProps {
  About: any;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}

export async function getStaticProps(ctx: any) {
  const api = new Api();
  let request: any = await api.content({ method: 'get', url: `about` });

  const About = request?.data?.About ?? {};
  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  return {
    props: {
      About,
      HeaderFooter,
      DataSeo,
      Scripts,
    },
    revalidate: 60 * 60 * 60,
  };
}

export default function Sobre({ About, HeaderFooter, DataSeo, Scripts }: SobreProps) {
  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `Sobre | ${DataSeo?.site_text}`,
        image: getImage(DataSeo?.site_image) || "",
        description: clean(About?.main_description),
        url: `sobre`,
      }}
      header={{
        template: "default",
        position: "fixed",
        content: HeaderFooter,
      }}
      footer={{
        template: "default",
        content: HeaderFooter,
      }}
    >
      {/* Header */}
      <section className="bg-cyan-500 pt-24 md:pt-32 relative">
        <div className="container-medium relative pb-4 md:pb-10 text-white">
          <div className="flex">
            <div className="w-full">
              <div className="pb-4">
                <Breadcrumbs links={[{ url: "/sobre", name: "Sobre" }]} />
              </div>
              <h1 className="font-title font-bold text-4xl md:text-5xl mb-4">
                Sobre nós
              </h1>
              <div className="text-lg md:text-2xl font-semibold">
                Uma start-up para facilitar em como realizar sua festa
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Te ajudamos a festejar sem dor de cabeça */}
      <section className="py-10 md:pt-20 relative overflow-hidden">
        <div className="container-medium">
          <div className="max-w-3xl mx-auto text-center pb-6 md:pb-14">
            <h2 className="font-title text-zinc-900 font-bold text-3xl md:text-5xl mt-2">
              Te ajudamos a festejar sem dor de cabeça
            </h2>
          </div>
          <div className="px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="border h-full rounded-lg p-6 md:p-10 bg-white">
                <div className="p-8 text-yellow-400 relative">
                  <Icon
                    icon="fa-hand-point-up"
                    className="text-6xl absolute text-yellow-400 top-1/2 left-0 -translate-y-1/2"
                  ></Icon>
                  <Icon
                    icon="fa-hand-point-up"
                    type="fa"
                    className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2"
                  />
                </div>
                <div className="pt-6">
                  <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">
                    Clicou
                  </h3>
                  <div className="text-gray-600">
                    Procure no site pelas melhores ofertas de fornecedores no setor de eventos, pesquisando por produtos ou por parceiros. Em alguns clicks sua festa está pronta.
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="border h-full rounded-lg p-6 md:p-10 bg-white">
                <div className="p-8 text-yellow-400 relative">
                  <Icon
                    icon="fa-calendar-star"
                    className="text-6xl absolute text-yellow-400 top-1/2 left-0 -translate-y-1/2"
                  ></Icon>
                  <Icon
                    icon="fa-calendar-star"
                    type="fa"
                    className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2"
                  />
                </div>
                <div className="pt-6">
                  <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">
                    Marcou
                  </h3>
                  <div className="text-gray-600">
                    Na data e horário marcado, a entrega será feita no endereço registrado. Pontualmente e com o acompanhamento pelo portal do usuário.
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="border h-full rounded-lg p-6 md:p-10 bg-white">
                <div className="p-8 text-yellow-400 relative">
                  <Icon
                    icon="fa-wine-bottle"
                    className="text-6xl absolute text-yellow-400 top-1/2 left-0 -translate-y-1/2"
                  ></Icon>
                  <Icon
                    icon="fa-wine-bottle"
                    type="fa"
                    className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2"
                  />
                </div>
                <div className="pt-6">
                  <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">
                    Fiestou
                  </h3>
                  <p className="text-gray-600">
                    Aproveite sua festa. No dia seguinte recolhemos, o que for alugado. E dá uma forcinha para gente e avalie o serviço.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa missão */}
      <section>
        <div className="md:py-6">
          <div className="max-w-[88rem] pt-10 pb-6 md:py-20 mx-auto bg-zinc-100">
            <div className="container-medium grid lg:flex gap-6 md:gap-10 items-center">
              <div className="w-full grid gap-4 md:gap-8">
                <h4 className="font-title font-bold max-w-[30rem] text-4xl text-zinc-900">
                  Nossa missão</h4>
                <div className="max-w-[30rem] md:text-lg">
                  <p>Com a Fiestou, você pode encontrar tudo o que precisa para a sua festa em um só lugar. Desde itens de decoração até
                    serviços de buffet, a plataforma oferece uma variedade de opções para atender às suas necessidades.</p><br />
                  <p>Então não perca mais tempo e comece a planejar a sua festa com a Fiestou!</p>
                </div>
              </div>
              {!!About?.about_image && (
                <div className="w-full">
                  <Img
                    src="/images/mesa-de-festas.jpeg"
                    className="w-full rounded-xl"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:pt-20 relative overflow-hidden">
        <div className="container-medium">
          <div className="max-w-3xl mx-auto text-center pb-6 md:pb-14">
            <h2 className="font-title text-zinc-900 font-bold text-3xl md:text-5xl mt-2">
              O que você vai contar conosco</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1 */}
            <div className="border h-full rounded-lg p-6 md:p-10 bg-white">
              <div className="p-8 text-yellow-400 relative">
                <Icon
                  icon="fa-medal"
                  className="text-6xl absolute top-1/2 left-0 -translate-y-1/2"
                />
                <Icon
                  icon="fa-medal"
                  type="fa"
                  className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2"
                />
              </div>
              <div className="pt-6">
                <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">
                  Os melhores
                </h3>
                <p className="text-gray-600">
                  Os parceiros são qualificados, experientes no setor. E tem a garantia que  o serviço será entregue.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="border h-full rounded-lg p-6 md:p-10 bg-white">
              <div className="p-8 text-yellow-400 relative">
                <Icon
                  icon="fa-lock-alt"
                  className="text-6xl absolute top-1/2 left-0 -translate-y-1/2"
                />
                <Icon
                  icon="fa-lock-alt"
                  type="fa"
                  className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2"
                />
              </div>
              <div className="pt-6">
                <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">
                  Segurança
                </h3>
                <p className="text-gray-600">
                  O pagamento está seguro, e com garantia. Para parceiros a divisão é feito automaticamente.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="border h-full rounded-lg p-6 md:p-10 bg-white">
              <div className="p-8 text-yellow-400 relative">
                <Icon
                  icon="fa-phone-rotary"
                  className="text-6xl absolute top-1/2 left-0 -translate-y-1/2"
                />
                <Icon
                  icon="fa-phone-rotary"
                  type="fa"
                  className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2"
                />
              </div>
              <div className="pt-6">
                <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">
                  Atendimento
                </h3>
                <p className="text-gray-600">
                  Estamos atentos, converse com cada fornecedor pelo chat, com uma rápida resposta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Newsletter />
    </Template>
  );
}