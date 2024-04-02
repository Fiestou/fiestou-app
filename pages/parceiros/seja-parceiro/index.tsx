import Api from "@/src/services/api";
import Template from "@/src/template";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import ButtonLoader from "@/src/components/utils/ButtonLoader";
import Img from "@/src/components/utils/ImgBase";
import { Button, Input, Label } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getImage, moneyFormat } from "@/src/helper";

export async function getStaticProps(ctx: any) {
  const api = new Api();
  let request: any = await api.call(
    {
      url: "request/graph",
      data: [
        {
          model: "page",
          filter: [
            {
              key: "slug",
              value: "seja-parceiro",
              compare: "=",
            },
          ],
        },
        {
          model: "roles",
          filter: [
            {
              key: "slug",
              value: "roles",
              compare: "=",
            },
          ],
        },
        {
          model: "page as HeaderFooter",
          filter: [
            {
              key: "slug",
              value: "menu",
              compare: "=",
            },
          ],
        },
        {
          model: "page as DataSeo",
          filter: [
            {
              key: "slug",
              value: "seo",
              compare: "=",
            },
          ],
        },
      ],
    },
    ctx
  );

  const content = request?.data?.query?.page ?? [];
  const roles = request?.data?.query?.roles ?? [];
  const HeaderFooter = request?.data?.query?.HeaderFooter ?? [];
  const DataSeo = request?.data?.query?.DataSeo ?? [];

  return {
    props: {
      content: content[0] ?? {},
      roles: roles[0] ?? {},
      HeaderFooter: HeaderFooter[0] ?? {},
      DataSeo: DataSeo[0] ?? {},
    },
  };
}

const FormInitialType = {
  sended: false,
  loading: false,
  redirect: "/parceiros/cadastro",
};

export default function SejaParceiro({
  content,
  roles,
  HeaderFooter,
  DataSeo,
}: {
  content: any;
  roles: any;
  HeaderFooter: any;
  DataSeo: any;
}) {
  console.log(roles);

  const api = new Api();
  const router = useRouter();

  const [collapseFaq, setCollapseFaq] = useState(0);

  const [form, setForm] = useState(FormInitialType);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setForm({ ...form, loading: true });

    const data: any = await api.bridge({
      url: "auth/pre-register",
      data: {
        name: name,
        email: email,
        details: { phone: phone },
        person: "partner",
      },
    });

    if (data.response) {
      router.push({
        pathname: form.redirect,
        query: { ref: data.hash },
      });
    } else {
      setForm({ ...form, sended: data.response });
    }
  };

  return (
    <Template
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
      <section
        className="pb-24 md:pb-0 pt-[2rem] md:pt-24 relative"
        style={{ backgroundColor: "#2dc4fe" }}
      >
        {getImage(content.main_cover, "default") && (
          <>
            {!!content.main_cover && (
              <Img
                size="7xl"
                src={getImage(content.main_cover, "default")}
                className="hidden md:block absolute w-full bottom-0 left-0"
              />
            )}
            {!!content.main_cover_mobile && (
              <Img
                size="7xl"
                src={getImage(content.main_cover_mobile, "default")}
                className="md:hidden absolute w-full bottom-0 left-0"
              />
            )}
          </>
        )}
        <div className="container-medium relative pt-16 md:py-16 text-white">
          <div className="grid gap-10 md:flex">
            <div className="w-full">
              <h1
                className="font-title font-bold text-4xl md:text-6xl mb-4"
                dangerouslySetInnerHTML={{ __html: content.main_text }}
              ></h1>
              <div
                className="text-xl md:text-3xl font-semibold"
                dangerouslySetInnerHTML={{ __html: content.main_description }}
              ></div>
            </div>
            <div className="w-full md:max-w-[26rem] mb-6 md:mb-10">
              <form
                onSubmit={(e) => {
                  handleSubmit(e);
                }}
                name="seja-parceiro"
                id="seja-parceiro"
                method="POST"
              >
                <div className="bg-white text-zinc-900 rounded-2xl p-8 grid gap-4">
                  <div>
                    <h2
                      className="font-bold font-title text-3xl text-center pb-4"
                      dangerouslySetInnerHTML={{
                        __html: content.form_title,
                      }}
                    ></h2>
                    <div className="form-group">
                      <Label style="light">Nome</Label>
                      <Input
                        onChange={(e: any) => {
                          setName(e.target.value);
                        }}
                        name="nome"
                        placeholder="Digite o nome completo"
                      />
                    </div>
                    <div className="form-group">
                      <Label style="light">E-mail</Label>
                      <Input
                        onChange={(e: any) => {
                          setEmail(e.target.value);
                        }}
                        name="email"
                        placeholder="email@email.com.br"
                      />
                    </div>
                    <div className="form-group">
                      <Label style="light">Celular (com DDD)</Label>
                      <Input
                        onChange={(e: any) => {
                          setPhone(e.target.value);
                        }}
                        name="phone"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div
                      className="form-group text-zinc-500 py-1 text-sm leading-tight"
                      dangerouslySetInnerHTML={{
                        __html: content.form_term,
                      }}
                    ></div>

                    <div className="form-group">
                      <Button loading={form.loading}>
                        {content.form_button}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-14 md:pt-20 pb-5 md:pb-20 relative overflow-hidden">
        <div className="container-medium">
          <div className="max-w-xl mx-auto text-center pb-10 md:pb-14">
            <span>{content.works_title}</span>
            <h2
              className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2"
              dangerouslySetInnerHTML={{
                __html: content.works_text,
              }}
            ></h2>
          </div>

          <Swiper
            spaceBetween={16}
            modules={[Navigation]}
            breakpoints={{
              0: {
                slidesPerView: 1.25,
              },
              640: {
                slidesPerView: 2.5,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
            className="swiper-equal swiper-visible"
          >
            {!!content.works_list &&
              content.works_list.map((item: any, key: any) => (
                <SwiperSlide key={key}>
                  <div className="border h-full rounded-lg p-6 md:p-10">
                    <div className="p-8 text-yellow-400 relative">
                      <Icon
                        icon={item.work_image ?? "fa-hand-point-up"}
                        className="text-6xl absolute top-1/2 left-0 -translate-y-1/2"
                      />
                      <Icon
                        icon={item.work_image ?? "fa-hand-point-up"}
                        type="fa"
                        className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2"
                      />
                    </div>
                    <div className="pt-6">
                      <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">
                        {item.work_title}
                      </h3>
                      <div>{item.work_description}</div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
          </Swiper>
        </div>
      </section>

      <section className="md:py-14 relative overflow-hidden">
        <div className="max-w-[88rem] pb-6 pt-14 md:p-14 md:py-20 mx-auto bg-zinc-100">
          <div className="container-medium">
            <div className="max-w-xl mx-auto text-center pb-10 md:pb-14">
              <span>{content.plain_title}</span>
              <h2
                className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2"
                dangerouslySetInnerHTML={{
                  __html: content.plain_text,
                }}
              ></h2>
              <div
                className="pt-4"
                dangerouslySetInnerHTML={{
                  __html: content.plain_description,
                }}
              ></div>
            </div>
            <div className="grid md:flex gap-6 md:gap-16">
              {!!roles?.plans?.length &&
                roles?.plans.map((item: any, key: any) => (
                  <div
                    className={`${
                      key % 2 == 0 ? "bg-white" : "bg-zinc-900 text-white"
                    } w-full flex flex-col gap-7 p-6 md:p-10 rounded-xl`}
                    key={key}
                  >
                    <div
                      className={`${
                        key % 2 == 0 ? "text-zinc-900" : ""
                      } w-full h-fit grid gap-1 md:gap-3 border-b pb-7`}
                    >
                      <div className="font-bold">{item?.plan_title}</div>
                      <div className="font-title font-bold text-3xl md:text-5xl">
                        R$ {moneyFormat(item?.plan_price)}/mês
                      </div>
                      <div className="text-sm">{item?.plan_description}</div>
                    </div>
                    <div className="w-full h-full">
                      <div className="grid gap-4">
                        {!!item?.plan_resources?.length &&
                          item.plan_resources
                            .split(";")
                            .filter((item: any) => !!item)
                            .map((item: any, key: any) => (
                              <div key={key} className="flex gap-3">
                                <div>
                                  <Icon
                                    icon="fa-check"
                                    className="text-green-500"
                                  />
                                </div>
                                <div className="w-full">{item}</div>
                              </div>
                            ))}
                      </div>
                    </div>
                    {/* <div className="text-center mt-4 grid">
                      <Button href="#">Quero este!</Button>
                    </div> */}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pt-10 md:py-14">
        <div className="container-medium">
          <div className="grid lg:flex justify-center">
            <div className="w-full">
              <div className="max-w-xl pb-4 md:pb-14">
                <span>{content.faq_title}</span>
                <h2
                  className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-4"
                  dangerouslySetInnerHTML={{
                    __html: content.faq_text,
                  }}
                ></h2>
                <div
                  className="pt-4"
                  dangerouslySetInnerHTML={{
                    __html: content.faq_description,
                  }}
                ></div>
                <Img
                  src="/images/default-arrow.png"
                  className="w-auto mt-8 rotate-45 md:rotate-0"
                />
              </div>
            </div>
            <div className="w-full lg:max-w-[40rem]">
              {!!content.faq_list &&
                content.faq_list.map((item: any, key: any) => (
                  <div key={key} className="border-b py-4">
                    <div
                      onClick={() =>
                        setCollapseFaq(key != collapseFaq ? key : -1)
                      }
                      className="flex font-bold text-zinc-900 text-lg cursor-pointer"
                    >
                      <span className="w-full">{item.answer_question}</span>
                      <div>
                        <Icon
                          icon="fa-chevron-down"
                          type="far"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    {collapseFaq == key && (
                      <div
                        className="pt-4 text-sm leading-normal"
                        dangerouslySetInnerHTML={{
                          __html: item.answer_text,
                        }}
                      ></div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container-medium py-10 md:py-20">
          <div className="bg-zinc-100 rounded-xl grid lg:flex items-center relative overflow-hidden">
            <div className="w-full grid gap-6 p-6 md:p-16 text-zinc-900">
              <h4
                className="font-title font-bold max-w-[30rem] text-4xl"
                dangerouslySetInnerHTML={{
                  __html: content.cta_text,
                }}
              ></h4>
              <div
                className="max-w-[24rem]"
                dangerouslySetInnerHTML={{
                  __html: content.cta_description,
                }}
              ></div>
              <div className="pt-2">
                <Button href="#">{content.cta_button}</Button>
              </div>
            </div>
            <div className="w-full">
              <div className="aspect-square relative">
                {!!getImage(content.cta_image, "xl") && (
                  <Img
                    src={getImage(content.cta_image, "xl")}
                    className="w-full h-full object-contain absolute inset-0"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Template>
  );
}
