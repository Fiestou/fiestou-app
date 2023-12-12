import Icon from "@/src/icons/fontAwesome/FIcon";
import { Button } from "../ui/form";

interface ShareType {
  url: string;
  title?: string;
}

export default function ShareModal(props: ShareType) {
  return (
    <div className="grid gap-2">
      <a
        rel="noreferrer"
        href={`https://www.facebook.com/sharer.php?u=${props.url}`}
        target="_blank"
      >
        <Button
          type="button"
          style="btn-outline-light"
          className="relative p-2 font-normal w-full justify-between"
        >
          <Icon icon="fa-facebook-f" type="fab" className="text-blue-700" />
          <span>facebook</span>
        </Button>
      </a>
      <a
        rel="noreferrer"
        href={`https://twitter.com/intent/tweet?url=${props.url}&text=${
          props?.title ?? ""
        }`}
        target="_blank"
      >
        <Button
          type="button"
          style="btn-outline-light"
          className="relative p-2 font-normal w-full justify-between"
        >
          <Icon icon="fa-twitter" type="fab" className="text-blue-400" />
          <span>twitter</span>
        </Button>
      </a>
      <a
        rel="noreferrer"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${props.url}&title=${props.title}`}
        target="_blank"
      >
        <Button
          type="button"
          style="btn-outline-light"
          className="relative p-2 font-normal w-full justify-between"
        >
          <Icon icon="fa-linkedin" type="fab" className="text-blue-900" />
          <span>linkedin</span>
        </Button>
      </a>
      <a
        rel="noreferrer"
        href={`https://pinterest.com/pin/create/button/?url=${props.url}&title=${props.title}`}
        target="_blank"
      >
        <Button
          type="button"
          style="btn-outline-light"
          className="relative p-2 font-normal w-full justify-between"
        >
          <Icon icon="fa-pinterest" type="fab" className="text-red-600" />
          <span>pinterest</span>
        </Button>
      </a>
      <a
        rel="noreferrer"
        href={`https://t.me/share/url?url=${props.url}&title=${props.title}`}
        target="_blank"
      >
        <Button
          type="button"
          style="btn-outline-light"
          className="relative p-2 font-normal w-full justify-between"
        >
          <Icon icon="fa-telegram" type="fab" className="text-cyan-400" />
          <span>telegram</span>
        </Button>
      </a>
      <a
        rel="noreferrer"
        href={`https://api.whatsapp.com/send?text=${props.url}`}
        target="_blank"
      >
        <Button
          type="button"
          style="btn-outline-light"
          className="relative p-2 font-normal w-full justify-between"
        >
          <Icon icon="fa-whatsapp" type="fab" className="text-green-500" />
          <span>whatsapp</span>
        </Button>
      </a>
      <a
        rel="noreferrer"
        href={`mailto:?subject=${props.title} | Produto da Fiestou&body=${props.url}`}
        target="_blank"
      >
        <Button
          type="button"
          style="btn-outline-light"
          className="relative p-2 font-normal w-full justify-between"
        >
          <Icon icon="fa-envelope" className="text-zinc-900" />
          <span>e-mail</span>
        </Button>
      </a>
    </div>
  );
}
