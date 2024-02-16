import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import { slugfy } from "../../helper";

export default function Lgpd({ content }: any) {
  const [modal, setModal] = useState(false as boolean);
  const [warning, setWarning] = useState(false as boolean);

  const [allowScripts, setAllowScripts] = useState([] as any);
  const submitAllowScripts = (e: any) => {
    e.preventDefault();

    localStorage.setItem("lgpd.fiestou", JSON.stringify(allowScripts));

    setModal(false);
    setWarning(false);
  };

  const renderScripts = (listScripts: any) => {
    let locate: any = {
      header: "",
      body: "",
      footer: "",
    };

    if (!!listScripts?.length) {
      listScripts
        .filter((script: any) => !!script?.script_position)
        .map((script: any) => {
          locate[script.script_position] = script.script_text;
        });

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
    } else {
      setWarning(false);
    }
  };

  useEffect(() => {
    if (!!window) {
      let handleScripts: any = {};

      if (!!localStorage.getItem("lgpd.fiestou")) {
        handleScripts = JSON.parse(
          localStorage.getItem("lgpd.fiestou") ?? "[]"
        );
        setWarning(false);
      } else {
        handleScripts = content?.script_list;
        setWarning(true);
      }

      setAllowScripts(handleScripts);
      renderScripts(handleScripts);
    }
  }, [content]);

  return (
    <>
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
        <div className="bg-white rounded relative max-w-xl p-6 mt-10 grid gap-8 mx-auto">
          <div className="grid gap-2">
            <h5 className="font-semibold text-zinc-900" id="lgpdModalLabel">
              {content?.lgpd_text}
            </h5>
            <div className="grid gap-6">
              <div
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: content?.lgpd_description }}
              ></div>
              <div className="bg-zinc-100 rounded p-3">
                <form
                  id="lgpd_form"
                  onSubmit={(e) => submitAllowScripts(e)}
                  method="POST"
                  className="grid gap-4"
                >
                  {!!content?.script_list.length &&
                    content?.script_list.map((item: any, key: any) => (
                      <label className="flex items-start w-full" key={key}>
                        <div className="pr-2 pt-[1px]">
                          <input
                            type="checkbox"
                            name="lgpd[]"
                            defaultChecked={
                              !!allowScripts.filter(
                                (itm: any) => itm?.id == item?.id
                              ).length
                            }
                            value={item?.id}
                            onChange={(e: any) =>
                              !!e.target.checked
                                ? setAllowScripts([...allowScripts, item])
                                : setAllowScripts(
                                    allowScripts.filter(
                                      (itm: any) => itm?.id != item?.id
                                    )
                                  )
                            }
                          />
                        </div>
                        <div>
                          <h5 className="font-semibold">
                            <div className="text-sm">
                              {item?.script_title}
                              <div className="text-xs inline-block pl-1">
                                {item?.script_required != "nao"
                                  ? " (obrigatório)"
                                  : ""}
                              </div>
                            </div>
                          </h5>
                          <div className="text-sm">
                            {item?.script_description}
                          </div>
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
              className="btn bg-yellow-300 text-black hover:bg-yellow-300 whitespace-nowrap py-3 px-8"
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
          warning ? "" : "hidden"
        } fixed w-full max-w-5xl overflow-hidden bottom-0 p-3 left-1/2 -translate-x-1/2 z-20`}
      >
        <div className="grid shadow-lg bg-white text-sm rounded text-center p-4 gap-4">
          <div className="grid gap-2">
            <div className="font-semibold text-zinc-900">
              {content?.lgpd_text}
            </div>
            <div
              dangerouslySetInnerHTML={{ __html: content?.lgpd_description }}
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
              className="btn bg-yellow-300 text-zinc-900 whitespace-nowrap hover:bg-yellow-300 px-4 py-2"
            >
              Ok, continuar
            </button>
          </div>
        </div>
      </div>

      <div
        dangerouslySetInnerHTML={{
          __html: `
            <script>
              setTimeout(() => {
                document?.getElementById("lgpd_reset")?.addEventListener("click", (e) => {
                  localStorage.removeItem("lgpd.fiestou");
                  document.location.reload();
                });
              }, 100);
            </script>
          `,
        }}
      ></div>
    </>
  );
}
