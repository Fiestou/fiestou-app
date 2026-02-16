import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import { slugfy } from "../../helper";

export default function Lgpd({ content, status }: any) {
  const [modal, setModal] = useState(false as boolean);
  const [warning, setWarning] = useState(false as boolean);

  const [listAllScripts, setListAllScripts] = useState([] as Array<any>);
  const [allowScripts, setAllowScripts] = useState([] as any);
  const submitAllowScripts = (e: any) => {
    e.preventDefault();

    localStorage.setItem("lgpd.fiestou", JSON.stringify(allowScripts));

    window.location.reload();
  };

  const renderScripts = () => {
    let locate: any = {
      header: "",
      body: "",
      footer: "",
    };

    if (status && !!listAllScripts?.length) {
      listAllScripts
        .filter((script: any) => allowScripts.includes(script.id))
        .map((script: any) => {
          locate[script.script_position] += script.script_text;
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
    }
  };

  useEffect(() => {
    renderScripts();
  }, [listAllScripts]);

  useEffect(() => {
    if (status) {
      let handleAllScripts: any = [];

      if (
        !!content?.header_script_scripts &&
        !!content?.header_script_scripts.length
      ) {
        handleAllScripts = [
          ...handleAllScripts,
          ...content?.header_script_scripts.map((item: any) => {
            return {
              id: item.id,
              script_position: "header",
              script_required: item?.header_script_required ?? "nao",
              script_title: item?.header_script_title ?? "",
              script_description: item?.header_script_description ?? "",
              script_text: item?.header_script_code ?? "",
            };
          }),
        ];
      }

      if (
        !!content?.body_script_scripts &&
        !!content?.body_script_scripts.length
      ) {
        handleAllScripts = [
          ...handleAllScripts,
          ...content?.body_script_scripts.map((item: any) => {
            return {
              id: item.id,
              script_position: "body",
              script_required: item?.body_script_required ?? "nao",
              script_title: item?.body_script_title ?? "",
              script_description: item?.body_script_description ?? "",
              script_text: item?.body_script_code ?? "",
            };
          }),
        ];
      }

      if (
        !!content?.footer_script_scripts &&
        !!content?.footer_script_scripts.length
      ) {
        handleAllScripts = [
          ...handleAllScripts,
          ...content?.footer_script_scripts.map((item: any) => {
            return {
              id: item.id,
              script_position: "footer",
              script_required: item?.footer_script_required ?? "nao",
              script_title: item?.footer_script_title ?? "",
              script_description: item?.footer_script_description ?? "",
              script_text: item?.footer_script_code ?? "",
            };
          }),
        ];
      }

      let handleAllowScripts: any = [];

      if (!!localStorage.getItem("lgpd.fiestou")) {
        handleAllowScripts = JSON.parse(
          localStorage.getItem("lgpd.fiestou") ?? "[]"
        );
        setWarning(false);
      } else {
        handleAllowScripts = handleAllScripts.map((item: any) => item.id);
        setWarning(true);
      }

      setAllowScripts(handleAllowScripts);

      setListAllScripts(handleAllScripts);
    }
  }, [status]);

  return (
    <>
      {status && (
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
                    dangerouslySetInnerHTML={{
                      __html: content?.lgpd_description,
                    }}
                  ></div>
                  <div className="bg-zinc-100 rounded p-3">
                    <form
                      id="lgpd_form"
                      onSubmit={(e) => submitAllowScripts(e)}
                      method="POST"
                      className="grid gap-4"
                    >
                      {!!listAllScripts?.length &&
                        listAllScripts.map((item: any, key: any) => (
                          <label className="flex items-start w-full" key={key}>
                            <div className="pr-2 pt-[1px]">
                              <input
                                type="checkbox"
                                name="lgpd[]"
                                defaultChecked={
                                  !!allowScripts.includes(item?.id)
                                }
                                value={item?.id}
                                onChange={(e: any) =>
                                  !!e.target.checked
                                    ? setAllowScripts([
                                        ...allowScripts,
                                        item.id,
                                      ])
                                    : setAllowScripts(
                                        allowScripts.filter(
                                          (allowID: any) => allowID != item?.id
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
            } fixed w-fit overflow-hidden bottom-24 md:bottom-0 p-1 md:p-3 left-1/2 -translate-x-1/2 z-20`}
          >
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-between text-center md:text-left shadow-lg bg-white text-sm rounded p-2 md:p-3 gap-2 md:gap-4">
              <div className="grid gap-2">
                <div className="">
                  <div
                    className=""
                    dangerouslySetInnerHTML={{
                      __html: `${content?.lgpd_description}`,
                    }}
                  ></div>
                </div>
                <style>{`
                #allowed a {
                  color: var(--bs-info) !important;
                  text-decoration: underline !important;
                }
              `}</style>
              </div>
              <div className="flex gap-2 md:gap-8 md:justify-center">
                {/* <button
                  type="button"
                  onClick={() => setModal(true)}
                  className="btn hover:bg-zinc-100 whitespace-nowrap px-3 py-2"
                  aria-label={""}
                >
                  Ajustar
                </button> */}
                <button
                  type="submit"
                  form="lgpd_form"
                  aria-label={""}
                  className="btn bg-yellow-300 text-zinc-900 whitespace-nowrap hover:bg-yellow-300 md:py-2 md:px-4 px-3 py-1"
                >
                  Ok, continuar
                </button>
              </div>
            </div>
          </div>
        </>
      )}

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
