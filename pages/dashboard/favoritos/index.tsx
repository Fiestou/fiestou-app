import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import { useRouter } from "next/router";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { useCallback, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import Product from "@/src/components/common/Product";

export async function getServerSideProps(ctx: any) {
  const api = new Api();
  let request: any = {};

  let user = JSON.parse(ctx.req.cookies["fiestou.user"]);

  request = await api.bridge(
    {
      method: "get",
      url: "users/get",
      data: {
        ref: user.email,
      },
    },
    ctx
  );

  user = request?.data ?? {};

  request = await api.content({
    method: "get",
    url: "account/user",
  });

  const HeaderFooter = request?.data?.HeaderFooter ?? {};

  return {
    props: {
      user: user,
      HeaderFooter,
    },
  };
}

export default function Favoritos({
  user,
  HeaderFooter,
}: {
  user: UserType;
  HeaderFooter: any;
}) {
  const api = useMemo(() => new Api(), []);
  const router = useRouter();

  const [products, setProducts] = useState([] as Array<number>);

  const getLikes = useCallback(async () => {
    const likes: any = Object.values(
      JSON.parse(Cookies.get("fiestou.likes") ?? JSON.stringify([]))
    );

    if (!likes.length) {
      setProducts([]);
      return;
    }

    const request: any = await api.request({
      method: "get",
      url: "request/products",
      data: {
        whereIn: likes,
      },
    });

    setProducts(request?.data ?? []);
  }, [api]);

  useEffect(() => {
    getLikes();
  }, [getLikes]);

  return (
    !router.isFallback && (
      <Template
        header={{
          template: "default",
          position: "solid",
          content: HeaderFooter,
        }}
      >
        <section className="">
          <div className="container-medium pt-12 pb-8">
            <div className="pb-4">
              <Breadcrumbs
                links={[
                  { url: "/dashboard", name: "Dashboard" },
                  { url: "/dashboard/favoritos", name: "Favoritos" },
                ]}
              />
            </div>
            <div className="flex items-center">
              <Link passHref href="/dashboard">
                <Icon
                  icon="fa-long-arrow-left"
                  className="mr-6 text-2xl text-zinc-900"
                />
              </Link>
              <div className="font-title font-bold text-3xl md:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                Favoritos
              </div>
            </div>
          </div>
        </section>
        <section className="">
          <div className="container-medium pb-12 md:pb-32">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {products &&
                products.map((item, key) => (
                  <div key={key}>
                    <Product product={item} />
                  </div>
                ))}
            </div>
          </div>
        </section>
      </Template>
    )
  );
}
