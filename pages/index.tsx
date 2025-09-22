import { Button } from "@/src/components/ui/form";
import { getImage } from "@/src/helper";
import { ProductType } from "@/src/models/product";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper";
import { useEffect, useState } from "react";
import Newsletter from "@/src/components/common/Newsletter";
import Img from "@/src/components/utils/ImgBase";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Api from "@/src/services/api";
import Template from "@/src/template";
import Link from "next/link";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Product from "@/src/components/common/Product";
import PostItem from "@/src/components/common/PostItem";
import Filter from "@/src/components/common/filters/Filter";


export async function getStaticProps(ctx: any) {
  const api = new Api();

  let request: any = await api.content({
    method: 'get',
    url: `home`,
  });

  const Categories = request?.data?.Categories ?? [];
  const Home = request?.data?.Home ?? {};
  const Products = request?.data?.Products ?? [];
  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};
  const Blog = request?.data?.Blog ?? [];

  return {
    props: {
      Categories: Categories,
      Products: Products,
      Home: Home,
      Blog: Blog,
      HeaderFooter: HeaderFooter,
      DataSeo: DataSeo,
      Scripts: Scripts,
    },
    revalidate: 60 * 60 * 60,
  };
}

export default function Home({
  Home,
  Products,
  Blog,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  Home: any;
  Products: Array<ProductType>;
  Blog: Array<any>;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}) {
  const api = new Api();

  const renderImageSlider = (slide: any) => {
    const desktopImage = getImage(slide?.main_slide_cover, "default");
    const mobileImage = getImage(slide?.main_slide_cover_mobile, "default");

    if (!desktopImage && !mobileImage) return null;

    return (
      <>
        {desktopImage && (
          <Img
            size="7xl"
            src={desktopImage}
            className="hidden md:block absolute w-full bottom-0 left-0"
          />
        )}
        {mobileImage && (
          <Img
            size="7xl"
            src={mobileImage}
            className="md:hidden absolute w-full bottom-0 left-0"
          />
        )}
      </>
    );
  };


  const [imgLinks] = useState<string[]>(
    Array.isArray(Home?.main_slide)
      ? Home.main_slide.map((slide: any) => slide?.main_slide_redirect?.url)
      : []
  );

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `${DataSeo?.site_text} - ${DataSeo?.site_description}`,
        image: !!getImage(DataSeo?.site_image)
          ? getImage(DataSeo?.site_image)
          : "",
        description: DataSeo?.site_description,
      }}
      header={{
        template: "default",
        position: "fixed",
        background: "bg-transparent",
        content: HeaderFooter,
      }}
      footer={{
        template: "default",
        content: HeaderFooter,
      }}
    >
      {/* Slider principal */}
      <section className="group relative">
        <Swiper
          spaceBetween={0}
          modules={[Pagination, Navigation, Autoplay]}
          navigation={{
            nextEl: ".swiper-main-next",
            prevEl: ".swiper-main-prev",
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
          }}
        >
          {(Home?.main_slide ?? []).map((slide: any, key: any) => (
            <SwiperSlide key={key}>
              <div
                className="bg-cyan-500 pt-16 md:pt-24 relative"
                style={{ backgroundColor: "#2dc3ff" }}
              >
                {key > 0 && !!slide?.main_slide_redirect?.url && slide ? (
                  <Link href={slide?.main_slide_redirect?.url}>
                    {renderImageSlider(slide)}
                  </Link>
                ) : (
                  <>{renderImageSlider(slide)}</>
                )}

                <div className="min-h-[70vh] md:min-h-[80vh]">
                  <div className="container-medium relative py-4 md:py-14 text-white">
                    <div className="grid text-center md:text-left">
                      {!!slide?.main_slide_text && (
                        <h1
                          className="font-title text-underline font-bold text-4xl lg:text-6xl mb-2 md:mb-4"
                          dangerouslySetInnerHTML={{
                            __html: slide?.main_slide_text,
                          }}
                        ></h1>
                      )}

                      {!!slide?.main_slide_description && (
                        <div
                          className="text-lg text-underline md:text-3xl md:max-w-xl"
                          dangerouslySetInnerHTML={{
                            __html: slide?.main_slide_description,
                          }}
                        ></div>
                      )}

                      {!!slide?.main_slide_redirect?.url &&
                        !!slide?.main_slide_redirect?.label && (
                          <div className="pt-4 md:pt-6">
                            <Button
                              href={`${process.env.APP_URL}/acesso`}
                              className="md:text-lg px-4 py-2 md:py-4 md:px-8"
                            >
                              {slide?.main_slide_redirect?.label}
                            </Button>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>


        {(Home?.main_slide ?? []).length > 1 && (
          <div className="opacity-0 group-hover:opacity-100 hidden sm:flex ease absolute px-4 top-1/2 left-0 w-full -translate-y-1/2 items-center h-0 justify-between z-10">
            <div>
              <Button className="swiper-main-prev p-6 rounded-full" alt="Seta para esquerda" title="Seta para esquerda">
                <Icon
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-[2px]"
                  icon="fa-chevron-left"
                  type="far"
                  alt="Seta para esquerda"
                  title="Seta para esquerda"
                />
              </Button>
            </div>
            <div>
              <Button className="swiper-main-next p-6 rounded-full" alt="Seta para direita" title="Seta para direita">
                <Icon
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ml-[1px]"
                  icon="fa-chevron-right"
                  type="far"
                  alt="Seta para direita"
                  title="Seta para direita"
                />
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Filtros */}
      <div className="relative pb-16 -mt-7">
        <div className="absolute w-full">
          <Filter />
        </div>
      </div>

      {/* Produtos em destaque */}
      <section className="py-14">
        <div className="container-medium">
          <div className="max-w-2xl mx-auto text-center pb-6 md:pb-8">
            <h2
              className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2"
            >Encontre a decoração perfeita para você</h2>
          </div>
          <div className="flex flex-wrap md:flex-nowrap items-center md:pt-6">
            <div className="order-3 md:order-2 grid md:grid-cols-2 lg:grid-cols-4 gap-4 w-full relative overflow-hidden">
              {!!Products.length &&
                Products.map((item: any, key: any) => (
                  <Product key={key} product={item} />
                ))}
            </div>
          </div>
          <div className="text-center mt-10">
            <Button href="/produtos">
              <Icon icon="fa-shopping-bag" type="far" /> Ver todos os produtos
            </Button>
          </div>
        </div>
      </section>

      {/* Como montar sua festa */}
      <section className="py-12 md:py-20">
        <div className="container-medium">
          <div className="max-w-2xl mx-auto text-center pb-6 md:pb-14">
            <h2
              className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2"
            >Veja como é muito fácil montar sua festa!</h2>
          </div>
          <div className="flex flex-wrap md:flex-nowrap items-center md:pt-6 -mx-[1rem] xl:-mx-[4rem]">
            <div className="hidden md:block order-1 w-1/2 text-right md:text-center md:w-fit p-2">
              <Button className="swiper-prev p-5 rounded-full" alt="Seta para esquerda" title="Seta para esquerda">
                <Icon
                  icon="fa-arrow-left"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  alt="Seta para esquerda"
                  title="Seta para esquerda"
                />
              </Button>
            </div>
            <div className="order-3 md:order-2 w-full relative overflow-hidden rounded-[.5rem]">
              <Swiper
                spaceBetween={16}
                modules={[Navigation]}
                navigation={{
                  prevEl: ".swiper-prev",
                  nextEl: ".swiper-next",
                }}
                breakpoints={{
                  0: {
                    slidesPerView: 1.5,
                    centeredSlides: true,
                  },
                  640: {
                    slidesPerView: 2.5,
                    centeredSlides: false,
                  },
                  1024: {
                    slidesPerView: 4,
                    centeredSlides: false,
                  },
                }}
                className="swiper-equal"
              >
                {/* Slide 1 */}
                <SwiperSlide>
                  <div className="border h-full rounded-lg">
                    <div className="aspect-square bg-zinc-100">
                      <Img
                        className="w-full h-full object-cover"
                        src="/images/stepsImage/step1.jpeg"
                        alt="1 - Peça pelo site"
                        title="No primeiro passo, escolha seu produto e peça pelo site"
                      />
                    </div>
                    <div className="p-4 md:p-5 text-center">
                      <h4 className="font-title text-zinc-900 font-bold">1 - Peça pelo site</h4>
                    </div>
                  </div>
                </SwiperSlide>

                {/* Slide 2 */}
                <SwiperSlide>
                  <div className="border h-full rounded-lg">
                    <div className="aspect-square bg-zinc-100">
                      <Img
                        className="w-full h-full object-cover"
                        src="/images/stepsImage/step2.jpeg"
                        alt="2 - Recebemos o seu pedido"
                        title="No segundo passo, recebemos o seu pedido"
                      />
                    </div>
                    <div className="p-4 md:p-5 text-center">
                      <h4 className="font-title text-zinc-900 font-bold">2 - Recebemos o seu pedido</h4>
                    </div>
                  </div>
                </SwiperSlide>

                {/* Slide 3 */}
                <SwiperSlide>
                  <div className="border h-full rounded-lg">
                    <div className="aspect-square bg-zinc-100">
                      <Img
                        className="w-full h-full object-cover"
                        src="/images/stepsImage/step3.jpeg"
                        alt="3 - Preparamos para o envio"
                        title="No terceiro passo, preparamos para o envio"
                      />
                    </div>
                    <div className="p-4 md:p-5 text-center">
                      <h4 className="font-title text-zinc-900 font-bold">3 - Preparamos para o envio</h4>
                    </div>
                  </div>
                </SwiperSlide>

                {/* Slide 4 */}
                <SwiperSlide>
                  <div className="border h-full rounded-lg">
                    <div className="aspect-square bg-zinc-100">
                      <Img
                        className="w-full h-full object-cover"
                        src="/images/stepsImage/step4.jpeg"
                        alt="4 - Entregamos sem atraso"
                        title="No quarto passo, entregamos sem atraso"
                      />
                    </div>
                    <div className="p-4 md:p-5 text-center">
                      <h4 className="font-title text-zinc-900 font-bold">4 - Entregamos sem atraso</h4>
                    </div>
                  </div>
                </SwiperSlide>

                {/* Slide 5 */}
                <SwiperSlide>
                  <div className="border h-full rounded-lg">
                    <div className="aspect-square bg-zinc-100">
                      <Img
                        className="w-full h-full object-cover"
                        src="/images/stepsImage/step5.jpeg"
                        alt="5 - Fiestouuu!"
                        title="No quinto passo, é só curtir a festa! Fiestouuu!"
                      />
                    </div>
                    <div className="p-4 md:p-5 text-center">
                      <h4 className="font-title text-zinc-900 font-bold">5 - Fiestouuu!</h4>
                    </div>
                  </div>
                </SwiperSlide>

                {/* Slide 6 */}
                <SwiperSlide>
                  <div className="border h-full rounded-lg">
                    <div className="aspect-square bg-zinc-100">
                      <Img
                        className="w-full h-full object-cover"
                        src="/images/stepsImage/step6.jpeg"
                        alt="6 - Recolhemos"
                        title="No sexto passo, recolhemos tudo depois da festa sem que você precise se preocupar com nada"
                      />
                    </div>
                    <div className="p-4 md:p-5 text-center">
                      <h4 className="font-title text-zinc-900 font-bold">6 - Recolhemos</h4>
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>


            <div className="hidden md:block order-2 md:order-3 w-1/2 text-left md:text-center md:w-fit p-2">
              <Button className="swiper-next p-5 rounded-full" alt="Seta para direita" title="Seta para direita">
                <Icon
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  icon="fa-arrow-right"
                  alt="Seta para direita"
                  title="Seta para direita"
                />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Parceiros */}
      <section className="xl:py-14">
        <div className="max-w-[88rem] py-12 md:py-20 mx-auto bg-zinc-100">
          <div className="container-medium">
            <div className="max-w-4xl mx-auto text-center pb-8 md:pb-14">
              <h2 className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2">
                Confira os parceiros já cadastrados</h2>
            </div>
            {/* Confira nosso parceiros cadastrados */}
            <div className="flex justify-center gap-2 md:gap-12">
              <div className="flex flex-col gap-4 aspect-square text-center">
                <a href="https://www.fiestou.com.br/circus-festas/" target="_blank" rel="noopener noreferrer">
                  <Img
                    className="w-full h-full rounded-[10px] border border-solid border-yellow shadow-md"
                    src="/images/circus.png"
                    alt="Visite nosso parceiro Circus Festas"
                    title="Visite nosso parceiro Circus Festas"
                  />
                </a>
                <h4 className="font-bold">Circus Festas</h4>
              </div>
              <div className="flex flex-col gap-4 aspect-square text-center">
                <a href="https://www.fiestou.com.br/fiori/" target="_blank" rel="noopener noreferrer">
                  <Img
                    className="w-full h-full rounded-[10px] border border-solid border-yellow shadow-md"
                    src="/images/fiori.png"
                    alt="Visite nosso parceiro Fiori"
                    title="Visite nosso parceiro Fiori"
                  />
                </a>
                <h4 className="font-bold">Fiori</h4>
              </div>
              <div className="flex flex-col gap-4 aspect-square text-center">
                <div className="aspect-square">
                  <a href="https://www.fiestou.com.br/flavia-fagundes-cerimonial/" target="_blank" rel="noopener noreferrer">
                    <Img
                      className="w-full h-full rounded-[10px] border border-solid border-yellow shadow-md"
                      src="/images/flavia.png"
                      alt="Visite nosso parceiro Flávia Fagundes cerimonial"
                      title="Visite nosso parceiro Flávia Fagundes cerimonial"
                    />
                  </a>
                </div>
                <h4 className="font-bold ">Flávia Fagundes</h4>
              </div>
            </div>

            {/* Faça para do fiestou */}
            <div className="bg-white mt-6 lg:mt-20 rounded-xl grid lg:flex items-center relative overflow-hidden">
              <div className="w-full grid gap-6 p-6 md:p-16">
                <h4
                  className="font-title font-bold max-w-[30rem] text-zinc-900 text-5xl">
                  Faça parte do Fiestou</h4>
                <div
                  className="max-w-[20rem]">
                  <span>
                    Atua no setor de eventos e quer alcançar mais clientes, em João Pessoa? Entre no nosso time criando sua conta agora!
                  </span>
                </div>
                <div className="md:pt-4">
                  <Button href="/parceiros/seja-parceiro">
                    <Icon icon="fa-store" type="far" />
                    Eu quero ser parceiro
                  </Button>
                </div>
              </div>
              <div className="w-full">
                <div className="aspect-[2/2]">
                  <Img
                    className="w-full h-full object-contain"
                    src="/images/Faca-parte-do-Fiestou.png"
                    alt="Faça parte do Fiestou"
                    title="Faça parte do Fiestou"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-14">
        <div className="container-medium">
          <div className="lg:flex justify-center">
            <div className="w-full">
              <div className="max-w-xl pb-14">
                <h2
                  className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-4"

                >Veja quem recomenda</h2>
                <div className="pt-10">
                  <Img
                    src="/images/loop-arrow.png"
                    className="w-auto rotate-90 md:rotate-0"
                  />
                </div>
              </div>
            </div>
            <div className="w-full lg:max-w-[30rem]">
              <div>
                <Swiper
                  pagination={{
                    el: ".swiper-quotes-pagination",
                    type: "fraction",
                  }}
                  spaceBetween={16}
                  modules={[Pagination, Navigation, Autoplay]}
                  navigation={{
                    nextEl: ".swiper-quotes-next",
                    prevEl: ".swiper-quotes-prev",
                  }}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                  }}
                  loop={true}
                  breakpoints={{
                    0: {
                      slidesPerView: 1,
                    },
                  }}
                >
                  <SwiperSlide>
                    <div className="w-full">
                      <div className="flex gap-4 items-center">
                        <div className="max-w-[2.5rem] overflow-hidden relative rounded-full">
                          <div className="aspect-square bg-zinc-200">
                            <Img
                              src="images/depoimentos/debora-pinheiro.png"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900">
                            <p>Débora Pinheiro</p>
                          </div>
                          <div className="text-sm">
                            <p>Decoradora de eventos</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-xl py-8">
                        <p>
                          Tem diversas opções de decoração. Trabalhei no ramo em mais de
                          25 anos, e agora tem uma solução mais prática para decorar sua
                          festa em João Pessoa.
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className="w-full">
                      <div className="flex gap-4 items-center">
                        <div className="max-w-[2.5rem] overflow-hidden relative rounded-full">
                          <div className="aspect-square bg-zinc-200">
                            <Img
                              src="images/depoimentos/priscila.png"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900">
                            <p>Priscila</p>
                          </div>
                          <div className="text-sm">
                            <p>Cerimionalista Infantil</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-xl py-8">
                        <p>
                          Uma nova maneira de realizar festa na capital João pessoa, facilidade de encontrar os itens que precisa para complementar na decoração.
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                </Swiper>
              </div>

              <div className="flex gap-2 pt-4 items-center">
                <span className="swiper-quotes-pagination w-auto pr-3"></span>
                <Button className="swiper-quotes-prev p-4 rounded-full">
                  <Icon
                    icon="fa-arrow-left"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  />
                </Button>
                <Button className="swiper-quotes-next p-4 rounded-full">
                  <Icon
                    icon="fa-arrow-right"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  />
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="pb-14 xl:py-14">
        <div className="container-medium">
          <div className="max-w-2xl mx-auto text-center pb-6 md:pb-14">
            <h2 className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2">
              Veja nossas dicas
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10 md:gap-6">
            {!!Blog?.length &&
              Blog.sort(
                (a, b) => b.id - a.id
              ).map((post: any, key: any) => (
                <div key={key}>
                  <PostItem post={post} />
                </div>
              ))}
          </div>
          <div className="text-center mt-10">
            <Button href="/blog">
              <Icon icon="fa-newspaper" type="far" /> Mais postagens
            </Button>
          </div>
        </div>
      </section>

      <Newsletter />
    </Template>
  );
}
