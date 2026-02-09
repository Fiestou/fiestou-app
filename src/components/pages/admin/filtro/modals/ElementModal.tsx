import React, { useEffect, useState, useRef } from "react";
import { X, Trash2, Upload, Loader2 } from "lucide-react";
import SelectElements from "../selectElements/selectElements";
import { toast } from "react-toastify";
import { categorie } from "@/src/store/filter";
import Api from "@/src/services/api";
import Cookies from "js-cookie";

interface ElementModalProps {
  open: boolean;
  onRequestClose: () => void;
  localElementsRelatedDetails: categorie[];
  groupId: number;
  grouptargeadc?: boolean;
  relatedElements: categorie[];
  onSaveClick: (data: ReturnElementData) => void;
  data?: categorie | null;
  existingIcons?: string[];
}

export interface ReturnElementData {
  id?: number;
  group_id: number;
  icon: string;
  name: string;
  description: string;
  active?: boolean;
  element_related_id: number[];
}

const ElementModal: React.FC<ElementModalProps> = (props) => {
  const api = new Api();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [icon, setIcon] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [openSelect, setOpenSelect] = useState<boolean>(false);
  const [selectedList, setSelectedList] = useState<categorie[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      let cookie = Cookies.get("fiestou.user") ?? JSON.stringify([]);
      let user = JSON.parse(cookie);

      const upload: any = await api.media({
        app: user.type === "master" ? -1 : user?.store ? user.store : -1,
        dir: "categories",
        index: "media",
        method: "upload",
        medias: [{ base64, fileName: file.name }],
      });

      if (upload?.response && upload?.medias?.[0]) {
        const media = upload.medias[0];
        const url = media.base_url + media.permanent_url;
        setIcon(url);
      } else {
        toast.error("Erro ao fazer upload");
      }
    } catch {
      toast.error("Erro ao fazer upload");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSaveClick = () => {
    if (!icon) {
      toast.error("Selecione um ícone");
      return;
    }
    if (!name) {
      toast.error("Preencha o nome");
      return;
    }

    let data: ReturnElementData = {
      group_id: props.groupId,
      icon: icon,
      name: name,
      active: true,
      description: description,
      element_related_id: selectedList.map((value) => Number(value.id)),
    };

    if (props.data) {
      data.id = props.data.id;
    }

    props.onSaveClick(data);

    setIcon("");
    setName("");
    setDescription("");
    setSelectedList([]);
  };

  useEffect(() => {
    if (props.data) {
      setIcon(props.data.icon);
      setName(props.data.name);
      setDescription(props.data.description || "");
      setSelectedList(props.localElementsRelatedDetails);
    } else {
      setIcon("");
      setName("");
      setDescription("");
      setSelectedList([]);
    }
  }, [props.data, props.localElementsRelatedDetails]);

  const uniqueIcons = (props.existingIcons || []).filter(
    (url, idx, arr) => url && arr.indexOf(url) === idx
  );

  const hideRelatedElements =
    (props.grouptargeadc === true && props.relatedElements?.[0]?.id === -1) ||
    (props.relatedElements?.length === 1 && props.relatedElements?.[0]?.id === -1) ||
    !props.relatedElements ||
    props.relatedElements.length === 0;

  return !props.open ? null : (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[520px] mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="text-lg font-semibold text-zinc-900">
            {props.data?.id ? "Editar Elemento" : "Novo Elemento"}
          </h2>
          <button
            onClick={props.onRequestClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 grid gap-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Ícone
            </label>

            {icon ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg border-2 border-zinc-200 flex items-center justify-center bg-zinc-50">
                  <img src={icon} alt="icon" className="w-7 h-7 object-contain" />
                </div>
                <button
                  onClick={() => setIcon("")}
                  className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Remover
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {uniqueIcons.length > 0 && (
                  <div>
                    <p className="text-xs text-zinc-400 mb-2">Selecionar existente</p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueIcons.map((url, idx) => (
                        <button
                          key={idx}
                          onClick={() => setIcon(url)}
                          className="w-10 h-10 rounded-lg border hover:border-zinc-400 hover:bg-zinc-50 flex items-center justify-center transition-all"
                        >
                          <img src={url} alt="" className="w-6 h-6 object-contain" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  {uniqueIcons.length > 0 && (
                    <p className="text-xs text-zinc-400 mb-2">Ou fazer upload</p>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-3 py-2.5 border border-dashed border-zinc-300 rounded-lg text-sm text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-colors w-full justify-center disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        Fazer upload de novo ícone
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-zinc-400 transition-colors"
              placeholder="Nome do elemento"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-zinc-400 transition-colors min-h-[80px] resize-none"
              placeholder="Descrição do elemento"
            />
          </div>

          {!hideRelatedElements && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Elementos relacionados
              </label>
              <SelectElements
                selectedList={selectedList}
                onRequestClose={() => setOpenSelect(false)}
                onRequestOpen={() => setOpenSelect(!openSelect)}
                open={openSelect}
                relatedElements={props.relatedElements}
                onChageSelectList={(data) => setSelectedList(data)}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-zinc-50 rounded-b-xl shrink-0">
          <button
            onClick={props.onRequestClose}
            className="px-4 py-2.5 text-sm text-zinc-600 hover:text-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSaveClick()}
            className="px-5 py-2.5 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ElementModal;
