import { useEffect, useRef, useState } from "react";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { Button } from "../ui/form";

interface ShareType {
  url: string;
  title?: string;
  mode?: "full" | "minimal";
}

export default function ShareModal(props: ShareType) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");
  const resetTimerRef = useRef<number | null>(null);

  const encodedUrl = encodeURIComponent(props.url);
  const encodedTitle = encodeURIComponent(props.title ?? "");
  const isMinimal = props.mode === "minimal";

  const clearResetTimer = () => {
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  };

  const scheduleReset = () => {
    clearResetTimer();
    resetTimerRef.current = window.setTimeout(() => {
      setCopyStatus("idle");
    }, 1800);
  };

  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(props.url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = props.url;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopyStatus("success");
      scheduleReset();
    } catch (error) {
      setCopyStatus("error");
      scheduleReset();
    }
  };

  useEffect(() => {
    return () => clearResetTimer();
  }, []);

  return (
    <div className="grid gap-2">
      {!isMinimal && (
        <>
          <a
            rel="noreferrer"
            href={`https://www.facebook.com/sharer.php?u=${encodedUrl}`}
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
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
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
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}`}
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
            href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&title=${encodedTitle}`}
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
            href={`https://t.me/share/url?url=${encodedUrl}&title=${encodedTitle}`}
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
        </>
      )}
      <a
        rel="noreferrer"
        href={`https://api.whatsapp.com/send?text=${encodedUrl}`}
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
      {isMinimal ? (
        <Button
          type="button"
          style="btn-outline-light"
          className="relative p-2 font-normal w-full justify-between"
          onClick={copyLink}
        >
          <Icon
            icon={copyStatus === "success" ? "fa-check" : "fa-copy"}
            className={copyStatus === "success" ? "text-cyan-600" : "text-zinc-900"}
          />
          <span>
            {copyStatus === "success"
              ? "link copiado"
              : copyStatus === "error"
              ? "erro ao copiar"
              : "copiar link"}
          </span>
        </Button>
      ) : (
        <a
          rel="noreferrer"
          href={`mailto:?subject=${encodedTitle}%20%7C%20Produto%20da%20Fiestou&body=${encodedUrl}`}
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
      )}
    </div>
  );
}
