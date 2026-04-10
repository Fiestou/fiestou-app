import Api from "@/src/services/api";
import Template from "@/src/template";
import { useState } from "react";
import Img from "@/src/components/utils/ImgBase";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { clean, getImage } from "@/src/helper";
import SellerRegistrationForm from "@/src/components/parceiros/SellerRegistrationForm";

export async function getStaticProps(ctx: any) {
    const api = new Api();
    let request: any = await api.content({ method: 'get', url: `become-partner` });
    const Partner = request?.data?.Partner ?? {};
    const Roles = request?.data?.Roles ?? {};
    const HeaderFooter = request?.data?.HeaderFooter ?? {};
    const DataSeo = request?.data?.DataSeo ?? {};
    const Scripts = request?.data?.Scripts ?? {};

    return {
        props: {
            Partner: Partner,
            Roles: Roles,
            HeaderFooter: HeaderFooter,
            DataSeo: DataSeo,
            Scripts: Scripts,
        },
    };
}

export default function SejaParceiro({
    Partner,
    Roles,
    HeaderFooter,
    DataSeo,
    Scripts,
}: {
    Partner: any;
    Roles: any;
    HeaderFooter: any;
    DataSeo: any;
    Scripts: any;
}) {
    const [collapseFaq, setCollapseFaq] = useState(0);

    return (
        <Template
            scripts={Scripts}
            metaPage={{
                title: `Seja um parceiro | ${DataSeo?.site_text || "Fiestou"}`,
                image: !!getImage(Partner?.main_cover) ? getImage(Partner?.main_cover) : "",
                description: clean(Partner?.main_description),
                url: `parceiros/seja-parceiro/`,
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
            <section className="bg-cyan-500 pt-16 md:pt-24 relative" style={{ backgroundColor: "#2dc3ff" }}>
                {getImage(Partner?.main_cover, "default") && (
                    <>
                        {!!Partner?.main_cover && <Img size="7xl" src={getImage(Partner?.main_cover, "default")} className="hidden md:block absolute w-full bottom-0 left-0" />}
                        {!!Partner?.main_cover_mobile && <Img size="7xl" src={getImage(Partner?.main_cover_mobile, "default")} className="md:hidden absolute w-full bottom-0 left-0" />}
                    </>
                )}

                <div className="min-h-[70vh] md:min-h-[80vh]">
                    <div className="container-medium relative py-4 md:py-14 text-white">
                        <div className="grid gap-4 md:flex">
                            <div className="w-full">
                                <h1 className="font-title text-underline font-bold text-4xl lg:text-6xl mb-2 md:mb-4">Clicou, Cadastrou, Faturou!</h1>
                                <span className="text-lg text-underline md:text-3xl md:max-w-xl">Não perca tempo! Entre na plataforma.</span>
                            </div>
                            <div className="w-full md:max-w-[26rem] mb-32 md:mb-10">
                                <SellerRegistrationForm />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Swiper Sec */}
            <section className="py-8 md:pt-20 relative overflow-hidden">
                <div className="container-medium">
                    <div className="max-w-3xl mx-auto text-center pb-6 md:pb-14">
                        <h2 className="font-title text-zinc-900 font-bold text-3xl md:text-5xl mt-2"
                        >A parceria certa para o seu negócio</h2>
                    </div>

                    <div className="px-4 py-6">
                        <Swiper
                            modules={[Navigation, Pagination]}
                            spaceBetween={20}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                1024: { slidesPerView: 4 },
                                1280: { slidesPerView: 4 },
                            }}
                            className="custom-swiper"
                        >
                            <SwiperSlide>
                                <div className="border h-full rounded-lg p-6 md:p-10">
                                    <div className="p-8 text-yellow-400 relative">
                                        <Icon icon="fa-bags-shopping" className="text-6xl absolute top-1/2 left-0 -translate-y-1/2" />
                                        <Icon icon="fa-bags-shopping" type="fa" className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2" />
                                    </div>
                                    <div className="pt-6">
                                        <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">Venda Online</h3>
                                        <span className="text-gray-600 text-justify">Tenha a sua propiá loja virtual focada para o setor de festa. Alcance mais clientes.</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="border h-full rounded-lg p-6 md:p-10">
                                    <div className="p-8 text-yellow-400 relative">
                                        <Icon icon="fa-analytics" className="text-6xl absolute top-1/2 left-0 -translate-y-1/2" />
                                        <Icon icon="fa-analytics" type="fa" className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2" />
                                    </div>
                                    <div className="pt-6">
                                        <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">Tenha acesso aos dados</h3>
                                        <span className="text-gray-600 text-justify">Relatórios de resultado de vendas. Porcentagem de cada categoria vendida e muito mais.</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="border h-full rounded-lg p-6 md:p-10">
                                    <div className="p-8 text-yellow-400 relative">
                                        <Icon icon="fa-box-alt" className="text-6xl absolute top-1/2 left-0 -translate-y-1/2" />
                                        <Icon icon="fa-box-alt" type="fa" className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2" />
                                    </div>
                                    <div className="pt-6">
                                        <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">Acompanhe os pedidos</h3>
                                        <span className="text-gray-600 text-justify">Siga cada etapa de entrega do seu produto. Notifique o cliente também para acompanhar a entrega.</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="border h-full rounded-lg p-6 md:p-10">
                                    <div className="p-8 text-yellow-400 relative">
                                        <Icon icon="fa-headset" className="text-6xl absolute top-1/2 left-0 -translate-y-1/2" />
                                        <Icon icon="fa-headset" type="fa" className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2" />
                                    </div>
                                    <div className="pt-6">
                                        <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">Suporte</h3>
                                        <span className="text-gray-600 text-justify">Estamos disponível para tirara suas dúvidas, pode nos enviar e-mail, ligar que estamos pronto para tirar as dúvidas.</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                        </Swiper>
                    </div>
                </div>
            </section>

            <section className="md:py-14 relative overflow-hidden">
                <div className="max-w-[88rem] pb-6 pt-14 md:p-14 md:py-20 mx-auto bg-zinc-100">
                    <div className="container-medium">
                        <div className="max-w-xl mx-auto text-center pb-10 md:pb-14">
                            <h2 className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2">Conheça os nossas opções</h2>
                        </div>
                        <div className="grid md:flex gap-6 md:gap-16">
                            <div className="bg-white w-full flex flex-col gap-7 p-6 md:p-10 rounded-xl">
                                <div className="text-zinc-900 w-full h-fit grid gap-1 md:gap-3 border-b pb-7">
                                    <div className="font-bold">Plano Simples</div>
                                    <div className="font-title font-bold text-3xl md:text-5xl">R$ 0,00/mês</div>
                                    <div className="text-sm">Plataforma para empresas independentes do tamanho, vender os produtos e serviços de festa.</div>
                                </div>
                                <div className="w-full h-full">
                                    <div className="grid gap-4">
                                        <div className="flex gap-3">
                                            <div><Icon icon="fa-check" className="text-green-500" /></div>
                                            <span className="w-full">
                                                10% em cada venda realizada na plataforma do Fiestou Customização da página Sem limites em números de produtos cadastrados. Transferência automática nos pagamentos. Ou seja, recebe o dinheiro da venda na hora.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pt-10 md:py-14">
                <div className="container-medium">
                    <div className="grid lg:flex justify-center">
                        <div className="w-full">
                            <div className="max-w-xl pb-4 md:pb-14 flex flex-wrap justify-center">
                                <h2 className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-4">Entenda como funciona</h2>
                                <Img src="/images/default-arrow.png" className="w-auto mt-8 rotate-45 md:rotate-0" />
                            </div>
                        </div>
                        <div className="w-full lg:max-w-[40rem] flex flex-col justify-end">
                            <div className="border-b py-4">
                                <div onClick={() => setCollapseFaq(collapseFaq !== 0 ? 0 : -1)} className="flex font-bold text-zinc-900 text-lg cursor-pointer">
                                    <span className="w-full">Já posso me cadastrar?</span>
                                    <div><Icon icon="fa-chevron-down" type="far" className="text-sm" /></div>
                                </div>
                                {collapseFaq === 0 && <div className="pt-4 text-sm leading-normal">Pode, mas ainda não começamos a dar o acesso. Mas com o cadastro vamos notificar quando estivermos pronto</div>}
                            </div>
                            <div className="border-b py-4">
                                <div onClick={() => setCollapseFaq(collapseFaq !== 1 ? 1 : -1)} className="flex font-bold text-zinc-900 text-lg cursor-pointer">
                                    <span className="w-full">O que é o Fiestou?</span>
                                    <div><Icon icon="fa-chevron-down" type="far" className="text-sm" /></div>
                                </div>
                                {collapseFaq === 1 && <div className="pt-4 text-sm leading-normal">É uma plataforma que permite empresas do setor de festas, vender os produtos e serviços na internet.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </Template>
    );
}
