import Icon from "@/src/icons/fontAwesome/FIcon";
import Button from "../ButtonUI";
import { useState } from "react";
import Api from "@/src/services/api";
import Img from "@/src/components/utils/ImgBase";
import Cookies from "js-cookie";
import { getImage } from "@/src/helper";

interface FileManagerType {
  name?: string;
  aspect?: string;
  onChange?: Function;
  id?: string;
  value?: Array<any>;
  loading?: boolean;
  placeholder?: string;
  className?: string;
  errorMessage?: string | boolean;
  required?: boolean;
  readonly?: boolean;
  options: {
    dir: string;
    type?: string;
  };
  min?: string | number;
  max?: string | number;
  size?: number;
  multiple?: string | boolean;
  rounded?: boolean;
}

export default function FileManager(attr: FileManagerType) {
  const api = new Api();

  let cookie = Cookies.get("fiestou.user") ?? JSON.stringify([]);
  let user = JSON.parse(cookie);

  const [removeActive, setRemoveActive] = useState(false as boolean);

  const [placeholder, setPlaceholder] = useState([] as any);
  const [selecteds, setSelecteds] = useState(
    ([attr?.value] ?? []) as Array<any>
  );
  const setSelected = (media: any) => {
    setRemoveActive(false);
    setSelecteds(!!attr?.multiple ? [...selecteds, media] : [media]);
  };

  const unsetSelected = (mediaId: any) => {
    const medias = selecteds.filter((media: any) => media.id != mediaId);

    setSelecteds(medias);
    setRemoveActive(false);

    if (!!attr?.onChange) attr?.onChange(medias);
  };

  const uploadMedias = async (e: any) => {
    const uploadFiles = e.target.files;
    const send: any = [];

    setPlaceholder(new Array(uploadFiles.length).fill(true));

    for (let i = 0; i < uploadFiles.length; i++) {
      const file = uploadFiles[i];

      const base64: any = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

      send.push({ base64, fileName: file.name });
    }

    if (!!uploadFiles.length) {
      const upload = await api
        .media({
          app: user.person == "master" ? -1 : !!user?.store ? user?.store : -1,
          dir: attr.options.dir,
          index: "media",
          method: "upload",
          medias: send,
        })
        .then((data: any) => data);

      if (upload.response && !!upload.medias) {
        const request: any = await api.graph({
          url: "files/list-medias",
        });

        if (!!request.response) {
          setPlaceholder([]);
          setMediaList(request.medias);
        }
      }
    }
  };

  const emitSelection = () => {
    if (!!attr?.onChange) attr?.onChange(selecteds);

    setRemoveActive(false);
    setModalStatus(false);
    setMediaList([]);
  };

  const [mediaList, setMediaList] = useState([] as Array<any>);
  const [modalStatus, setModalStatus] = useState(false as boolean);

  const removeSelection = async () => {
    const removeFiles = selecteds.map((item, key) => item.id);

    setMediaList(
      mediaList.filter((item: any) => !removeFiles.includes(item.id))
    );

    const remove = await api
      .media({
        app: user.person == "master" ? -1 : !!user?.store ? user?.store : -1,
        dir: attr.options.dir,
        index: "media",
        method: "remove",
        medias: removeFiles,
      })
      .then((res: any) => res);

    setRemoveActive(false);
    setSelecteds([]);
  };

  const openModal = async () => {
    setModalStatus(true);

    const request: any = await api.graph({
      url: "files/list-medias",
    });

    if (!!request.response) {
      setMediaList(request.medias);
    }
  };

  const closeModal = async () => {
    setModalStatus(false);
    setMediaList([]);
    setSelecteds(attr?.value ?? []);
  };

  return (
    <div>
      <div
        className={`${
          attr?.options?.type == "thumb"
            ? "flex flex-row-reverse items-center"
            : "grid"
        } ${!!selecteds.length ? "gap-2" : ""}`}
      >
        <Button
          type="button"
          onClick={() => openModal()}
          style="btn-outline-light"
          className={`block py-3 px-3 w-full ${attr?.className} border-zinc-300`}
        >
          <Icon icon="fa-image" />
          {attr.placeholder ?? "Selecionar"}
        </Button>

        {!!selecteds.filter((item) => !!getImage(item)).length && (
          <div
            className={`grid gap-2 w-full ${
              attr?.multiple && attr?.options?.type != "thumb"
                ? "grid-cols-4"
                : attr?.options?.type == "thumb"
                ? "max-w-[4rem]"
                : ""
            }`}
          >
            {selecteds
              .filter((item) => !!getImage(item))
              .map((item: any, key: any) => (
                <div
                  key={key}
                  className={`${
                    attr?.options?.type == "thumb" ? "max-w-[5rem]" : ""
                  } w-full group bg-zinc-100 rounded-md relative overflow-hidden`}
                >
                  <div
                    className={
                      !!attr?.multiple || attr?.options?.type == "thumb"
                        ? "aspect-square"
                        : ""
                    }
                  >
                    <Img
                      src={getImage(item, !!attr?.multiple ? "thumb" : "md")}
                      className={
                        !!attr?.multiple || attr?.options?.type == "thumb"
                          ? "absolute inset-0 object-contain w-full h-full"
                          : "mx-auto w-auto max-w-full"
                      }
                    />
                    <div
                      className={`${
                        attr?.options?.type != "thumb" ? "p-2" : "text-xs"
                      } hidden group-hover:block absolute top-0 right-0 z-10`}
                    >
                      <Button
                        type="button"
                        onClick={() => unsetSelected(item.id)}
                        style="btn-light"
                        className="p-2"
                      >
                        <Icon icon="fa-trash-alt" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {modalStatus && (
        <div className="fixed flex flex-col bg-white z-50 w-full h-full inset-0">
          <div className="border-b border-zinc-300 p-2 flex gap-2">
            <div className="w-fit">
              <Button
                style="btn-light"
                onClick={() => closeModal()}
                className="p-4"
              >
                <Icon
                  icon="fa-arrow-left"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </Button>
            </div>
            <div className="w-full"></div>
            {!!selecteds?.length && (
              <div className="w-fit">
                <Button
                  type="button"
                  onClick={() => {
                    removeActive ? removeSelection() : setRemoveActive(true);
                  }}
                  style={removeActive ? "btn-danger" : "btn-light"}
                  className="p-4 h-full"
                >
                  <Icon
                    icon="fa-trash"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  />
                </Button>
              </div>
            )}
            <div className="w-fit">
              <Button
                type="button"
                onClick={() => emitSelection()}
                className="py-2 px-5 text-sm"
              >
                Confimar
              </Button>
            </div>
          </div>
          <div className="h-full relative">
            <div className="absolute w-full h-full inset-0 overflow-x-hidden overflow-y-auto">
              <div className="grid grid-cols-7 p-3 gap-3">
                {!!placeholder.length &&
                  placeholder.map((item: any, key: any) => (
                    <div
                      className="aspect-square animate-pulse bg-zinc-300 rounded-md cursor-wait"
                      key={key}
                    ></div>
                  ))}
                {!!mediaList &&
                  mediaList.map((item: any, key: any) => (
                    <div
                      className="group relative overflow-hidden cursor-pointer rounded-lg"
                      key={key}
                    >
                      <div className="aspect-square bg-zinc-100 rounded-md">
                        {!!getImage(item, "sm") && (
                          <Img
                            src={getImage(item, "sm")}
                            className="absolute inset-0 object-contain w-full h-full"
                          />
                        )}
                      </div>
                      {!!item?.id &&
                      !!selecteds?.filter((sel) => sel.id == item?.id)
                        .length ? (
                        <div
                          onClick={() => unsetSelected(item.id)}
                          className="absolute inset-0 w-full h-full border-4 border-yellow-400 rounded-md"
                        ></div>
                      ) : (
                        <div
                          onClick={() => setSelected(item)}
                          className="absolute inset-0 w-full h-full"
                        ></div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pb-6">
              <div className="relative overflow-hidden p-6 rounded-full bg-yellow-300 hover:bg-yellow-300 ease text-zinc-900">
                <Icon
                  icon="fa-arrow-up"
                  type="far"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
                <input
                  type="file"
                  onChange={(e: any) => uploadMedias(e)}
                  name="upload_media"
                  multiple
                  className="absolute inset-0 pt-20 w-full h-full cursor-pointer opacity-0"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <style global jsx>{`
        body,
        html {
          overflow-y: ${modalStatus ? "hidden" : ""};
        }
      `}</style>
    </div>
  );
}
