import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import { slugfy } from "./helper";

export default function Lgpd({ scripts }: any) {
  const [modal, setModal] = useState(false as boolean);
  const [warning, setWarning] = useState(false as boolean);
  const [lgpd, setLGPD] = useState({} as any);
  const router = useRouter();
  const query = router.query;

  const [allow, setAllow] = useState([] as any);
  const submitAllow = (e: any) => {
    e.preventDefault();
    // localStorage.setItem("allow.fiestou", JSON.parse(allow));

    // setWarning(false);

    return false;
  };

  const [allScripts, setAllScripts] = useState([] as Array<any>);
  const handleScripts = (item: any) => {
    setAllow([...allow, item.slug]);
    setAllScripts([...allScripts, item]);
  };

  const [render, setRender] = useState(false);

  let locate: any = {
    header: "",
    body: "",
    footer: "",
  };

  useEffect(() => {
    if (!!window && window.location.href.search("noscript") == -1) {
      Object.values(scripts?.header_script_scripts ?? []).forEach(
        (item: any) => {
          handleScripts({
            title: item?.header_script_title,
            slug: slugfy(item?.header_script_title),
            description: item?.header_script_description,
            required: item?.header_script_required,
          });

          locate["header"] += ` ${item?.header_script_code} `;
        }
      );

      Object.values(scripts?.body_script_scripts ?? []).forEach((item: any) => {
        handleScripts({
          title: item?.body_script_title,
          slug: slugfy(item?.body_script_title),
          description: item?.body_script_description,
          required: item?.body_script_required,
        });

        locate["body"] += ` ${item?.body_script_code} `;
      });

      Object.values(scripts?.footer_script_scripts ?? []).forEach(
        (item: any) => {
          handleScripts({
            title: item?.footer_script_title,
            slug: slugfy(item?.footer_script_title),
            description: item?.footer_script_description,
            required: item?.footer_script_required,
          });

          locate["footer"] += ` ${item?.footer_script_code} `;
        }
      );

      if (document.querySelector("#scripts-body") == null) {
        let queryBody = document
          .createRange()
          .createContextualFragment(
            '<div id="scripts-body" class="d-none"></div>'
          );
        let queryFooter = document
          .createRange()
          .createContextualFragment(
            '<div id="scripts-footer" class="d-none"></div>'
          );

        let behaviorBody: any = document.querySelector("body");

        if (!!behaviorBody) {
          behaviorBody.prepend(queryBody);
          behaviorBody.appendChild(queryFooter);
        }

        let header = document
          .createRange()
          .createContextualFragment(locate.header);
        let body = document.createRange().createContextualFragment(locate.body);
        let footer = document
          .createRange()
          .createContextualFragment(locate.footer);

        let scripts_head = document.querySelector("head");
        let scripts_body = document.querySelector("#scripts-body");
        let scripts_footer = document.querySelector("#scripts-footer");

        setTimeout(() => {
          scripts_head?.prepend(header);
          scripts_body?.appendChild(body);
          scripts_footer?.appendChild(footer);
        }, 100);
      }
    }
  }, [scripts]);

  return render ? (
    <>
      <div
        dangerouslySetInnerHTML={{
          __html: `            
            setTimeout(() => {
              document?.getElementById("lgpd_form")?.addEventListener("submit", (e) => {
                e.preventDefault();
            
                var checkeds = [];
                var form = document.querySelectorAll('[name="lgpd[]"]:checked');
            
                form.forEach((item) => {
                  checkeds.push(item?.value);
                });
            
                localStorage?.setItem("lgpd.fiestou", JSON.stringify(checkeds));
                localStorage?.setItem("allow.fiestou", "true");
            
                document.location.reload();
            
                return false;
              });
            
              document?.getElementById("lgpd_reset")?.addEventListener("click", (e) => {
                localStorage.removeItem("lgpd.fiestou");
                localStorage.removeItem("allow.fiestou");
            
                document.location.reload();
              });
            }, 100);
          `,
        }}
      ></div>

      <div
        className={`fixed ${
          modal ? "w-full h-full inset-0" : "h-[0px]"
        } overflow-hidden z-[999999]`}
        id="lgpdModal"
      >
        <div
          onClick={() => setModal(false)}
          className="absolute w-full h-full inset-0 bg-zinc-900 opacity-75"
        ></div>
        <div className="bg-white relative max-w-xl p-6 mt-10 grid gap-8 mx-auto">
          <div className="grid gap-2">
            <h5 className="font-semibold text-zinc-900" id="lgpdModalLabel">
              {lgpd?.lgpd_text}
            </h5>
            <div className="grid gap-6">
              <div
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: lgpd?.lgpd_description }}
              ></div>
              <div className="bg-zinc-100 rounded-md p-3">
                <form
                  id="lgpd_form"
                  onSubmit={(e) => submitAllow(e)}
                  method="POST"
                  className="grid gap-4"
                >
                  {allScripts.map((item: any, key) => (
                    <label className="flex items-start w-full" key={key}>
                      <div className="pr-2 pt-[1px]">
                        <input
                          type="checkbox"
                          name="lgpd[]"
                          defaultChecked={!!allow.includes(item?.slug)}
                          value={item?.slug}
                          onChange={(e: any) =>
                            !!e.target.checked
                              ? setAllow([...allow, e.target.value])
                              : setAllow(
                                  allow.filter(
                                    (item: any) => item != e.target.value
                                  )
                                )
                          }
                        />
                      </div>
                      <div>
                        <h5 className="font-semibold">
                          <div className="text-sm">{item?.title}</div>
                          <div className="text-xs">
                            {item?.required != "nao" ? " (obrigatório)" : ""}
                          </div>
                        </h5>
                        <div className="text-sm">{item?.description}</div>
                      </div>
                    </label>
                  ))}
                </form>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 content-between">
            <button
              aria-label="fechar"
              type="button"
              className="btn hover:bg-zinc-100 whitespace-nowrap text-black py-2 md:py-3 px-8"
              onClick={() => setModal(false)}
            >
              fechar
            </button>
            <button
              aria-label="salvar"
              type="submit"
              className="btn bg-yellow-300 text-black hover:bg-yellow-200 whitespace-nowrap py-3 px-8"
              form="lgpd_form"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>

      <div
        id="allowed"
        className={`${
          warning ? "d-none" : ""
        } fixed w-full max-w-5xl overflow-hidden bottom-0 p-3 left-1/2 -translate-x-1/2 z-20`}
      >
        <div className="grid shadow-lg bg-white text-sm rounded-sm text-center p-4 gap-4">
          <div className="grid gap-2">
            <div className="font-semibold text-zinc-900">{lgpd?.lgpd_text}</div>
            <div
              dangerouslySetInnerHTML={{ __html: lgpd?.lgpd_description }}
            ></div>
            <style>{`
                #allowed a {
                  color: var(--bs-info) !important;
                  text-decoration: underline !important;
                }
              `}</style>
          </div>
          <div className="grid md:flex gap-2 md:gap-8 justify-center">
            <button
              type="button"
              onClick={() => setModal(true)}
              className="btn hover:bg-zinc-100 whitespace-nowrap px-3 py-2"
              aria-label={""}
            >
              Ajustar
            </button>
            <button
              type="submit"
              form="lgpd_form"
              aria-label={""}
              className="btn bg-yellow-300 text-zinc-900 whitespace-nowrap hover:bg-yellow-200 px-4 py-2"
            >
              Ok, continuar
            </button>
          </div>
        </div>
      </div>
    </>
  ) : (
    <></>
  );
}
