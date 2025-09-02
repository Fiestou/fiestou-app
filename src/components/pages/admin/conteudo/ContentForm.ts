import { HeaderFooterForm } from "@/src/components/pages/admin/conteudo/HeaderFooterForm";
import { HomeForm } from "@/src/components/pages/admin/conteudo/HomeForm";
import { AboutForm } from "@/src/components/pages/admin/conteudo/AboutForm";
import { PartnerForm } from "@/src/components/pages/admin/conteudo/PartnerForm";
import { DeliveryForm } from "@/src/components/pages/admin/conteudo/DeliveryForm";
import { ProductsForm } from "@/src/components/pages/admin/conteudo/ProductsForm";
import { PartnersForm } from "@/src/components/pages/admin/conteudo/PartnersForm";
import { FaqForm } from "@/src/components/pages/admin/conteudo/FaqForm";
import { ContactForm } from "@/src/components/pages/admin/conteudo/ContactForm";
import { HomePartnerForm } from "@/src/components/pages/admin/conteudo/HomePartnerForm";
import { ProductForm } from "@/src/components/pages/admin/conteudo/ProductForm";
import { StoreForm } from "@/src/components/pages/admin/conteudo/StoreForm";
import { AccountForm } from "@/src/components/pages/admin/conteudo/AccountForm";
import { BankForm } from "@/src/components/pages/admin/conteudo/BankForm";
import { AddressForm } from "@/src/components/pages/admin/conteudo/AddressForm";
import { OrdersForm } from "@/src/components/pages/admin/conteudo/OrdersForm";
import { SeoForm } from "@/src/components/pages/admin/conteudo/SeoForm";
import { ScriptsForm } from "@/src/components/pages/admin/conteudo/ScriptsForm";
import { EmailForm } from "@/src/components/pages/admin/conteudo/EmailForm";
import { WithdrawForm } from "@/src/components/pages/admin/conteudo/WithdrawForm";
import { BlogForm } from "./BlogForm";
import { CheckoutForm } from "./CheckoutForm";
import { DashboardForm } from "./DashboardForm";

export interface FormType {
  title: string;
  slug: string;
  publicUrl?: string;
  form: Array<any>;
  origin: string;
}

const site: Array<FormType> = [
  {
    title: "Home",
    slug: "home",
    publicUrl: "/",
    form: HomeForm,
    origin: "site",
  },
  {
    title: "Produtos",
    slug: "produtos",
    publicUrl: "/produtos",
    form: ProductsForm,
    origin: "site",
  },
  {
    title: "Parceiros",
    slug: "parceiros",
    publicUrl: "/parceiros",
    form: PartnersForm,
    origin: "site",
  },
  {
    title: "Seja Parceiro",
    slug: "seja-parceiro",
    publicUrl: "/parceiros/seja-parceiro",
    form: PartnerForm,
    origin: "site",
  },
  {
    title: "Entregadores",
    slug: "entregadores",
    publicUrl: "/entregadores/seja-entregador",
    form: DeliveryForm,
    origin: "site",
  },
  {
    title: "Sobre",
    slug: "sobre",
    publicUrl: "/sobre",
    form: AboutForm,
    origin: "site",
  },
  {
    title: "Blog",
    slug: "blog",
    publicUrl: "/blog",
    form: BlogForm,
    origin: "site",
  },
  {
    title: "FAQ",
    slug: "faq",
    publicUrl: "/faq",
    form: FaqForm,
    origin: "site",
  },
  {
    title: "Contato",
    slug: "contato",
    publicUrl: "/contato",
    form: ContactForm,
    origin: "site",
  },
  {
    title: "Checkout",
    slug: "checkout",
    publicUrl: "/checkout",
    form: CheckoutForm,
    origin: "site",
  },
  {
    title: "Dados e SEO",
    slug: "seo",
    publicUrl: "",
    form: SeoForm,
    origin: "site",
  },
  {
    title: "Scripts",
    slug: "scripts",
    publicUrl: "",
    form: ScriptsForm,
    origin: "site",
  },
  {
    title: "Emails de notificações",
    slug: "email",
    publicUrl: "",
    form: EmailForm,
    origin: "site",
  },
];

const painel: Array<FormType> = [
  {
    title: "Home Parceiro",
    slug: "home-partner",
    publicUrl: "",
    form: HomePartnerForm,
    origin: "painel",
  },
  {
    title: "Cadastro/Edição de produto",
    slug: "product",
    publicUrl: "",
    form: ProductForm,
    origin: "painel",
  },
  {
    title: "Personalizar loja",
    slug: "store-custom",
    publicUrl: "",
    form: StoreForm,
    origin: "painel",
  },
  {
    title: "Saques",
    slug: "withdraw",
    publicUrl: "",
    form: WithdrawForm,
    origin: "painel",
  },
  {
    title: "Dados de usuário",
    slug: "account",
    publicUrl: "",
    form: AccountForm,
    origin: "painel",
  },
  {
    title: "Conta bancária",
    slug: "bank",
    publicUrl: "",
    form: BankForm,
    origin: "painel",
  },
  {
    title: "Cadastro/Edição de endereços",
    slug: "address",
    publicUrl: "",
    form: AddressForm,
    origin: "painel",
  },
];

const dashboard: Array<FormType> = [
  {
    title: "Dashboard",
    slug: "client-menu",
    publicUrl: "",
    form: DashboardForm,
    origin: "dashboard",
  },
  {
    title: "Lista de pedidos",
    slug: "client-orders",
    publicUrl: "",
    form: OrdersForm,
    origin: "dashboard",
  },
];

export const HandleForm: Array<FormType> = [...site, ...painel, ...dashboard];

export const HandleGetFields = (slug: any) => {
  const form = HandleForm.find((item: any) => slug.toString() == item.slug);

  return !!form ? form : ({} as FormType);
};
