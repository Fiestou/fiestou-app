import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { useEffect, useState } from "react";
import { Button, Input, Select, TextArea } from "@/src/components/ui/form";
import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import { formatName, formatPhone } from "src/components/utils/FormMasks";
import GroupConfigUsers from "./GroupConfigUsers";
import GroupConfigBank from "./GroupConfigBank";
import GroupConfigBasicUser from "./GroupConfigBasicUser";
import GroupConfig from "./GroupConfig";
import { getStore } from "@/src/contexts/AuthContext";
import { RecipientType } from "@/src/models/Recipient";
import { toast } from "react-toastify";

const formInitial = {
  edit: "",
  loading: false,
};

export default function UserEdit({ user }: { user: UserType }) {
  const api = new Api();

  const [form, setForm] = useState(formInitial);
  const handleForm = (value: Object) => {
    setForm({ ...form, ...value });
  };

  const [oldUser, setOldUser] = useState(user as UserType);
  const [content, setContent] = useState<RecipientType>();
  const [storeId, setStoreId] = useState<any>();

  const getRecipientCode = async (storeId: string) => {
    try {
      const response: any = await api.bridge({
        method: "GET",
        url: `info/recipient/${storeId}`,
      });
      setContent(response.recipient);
    } catch (error) {
      console.error("Complete o cadastro :", error);
    }
  };

  const createRecipient = async (storeId: string | undefined) => {
    try {
      const response: any = await api.bridge({
        method: "POST",
        url: `createrecipient/${storeId}`,
      });

      if (response.success) {
        setContent(response.recipient);
        toast.success("Recebedor criado com sucesso!");
      }
    } catch (error) {
      console.error("Complete o cadastro :", error);
    }
  };

  useEffect(() => {
    if (!!window) {
      setStoreId(getStore());
      createRecipient(getStore());
    }
  }, []);

  useEffect(() => {
    if (storeId) {
      getRecipientCode(storeId); // ✅
    }
  }, [storeId]);

  const [handleProfile, setHandleProfile] = useState({
    remove: 0,
    preview: user?.profile?.preview ?? "",
  });

  console.log("UserEdit content:", content);


  // const handleSubmitFile = async (e: any) => {
  //   e.preventDefault();

  //   handleForm({ loading: true });

  //   let profileValue = content?.profile;

  //   if (!!handleProfile.remove) {
  //     const request = await api
  //       .media({
  //         dir: "user",
  //         app: user.id,
  //         index: user.id,
  //         method: "remove",
  //         medias: [handleProfile.remove],
  //       })
  //       .then((res: any) => res);

  //     if (request.response && !!request.removed) {
  //       profileValue = {};
  //     }
  //   }

  //   if (!!content?.profile?.files) {
  //     const upload = await api
  //       .media({
  //         dir: "user",
  //         app: user.id,
  //         index: user.id,
  //         method: "upload",
  //         medias: [content?.profile?.files],
  //       })
  //       .then((data: any) => data);

  //     if (upload.response && !!upload.medias[0].status) {
  //       const media = upload.medias[0].media;
  //       media["details"] = JSON.parse(media.details);

  //       profileValue = {
  //         id: media.id,
  //         base_url: media.base_url,
  //         permanent_url: media.permanent_url,
  //         details: media.details,
  //         preview: media.base_url + media.details?.sizes["lg"],
  //       };
  //     }
  //   }

  //   handleContent({ profile: profileValue });

  //   const handle = {
  //     ...content,
  //     profile: profileValue,
  //     id: user.id,
  //   };

  //   const request: any = await api.bridge({
  //     method: 'post',
  //     url: "users/update",
  //     data: handle,
  //   });

  //   if (request.response) {
  //     setContent(handle);
  //     setOldUser(Object.assign({}, handle));

  //     setHandleProfile({
  //       preview: typeof profileValue?.preview === "string" ? profileValue.preview : "",
  //       remove: 0,
  //     });
  //   }

  //   handleForm({ edit: "", loading: false });
  // };


  return (
    <>
      <GroupConfigBasicUser content={content} />

      <GroupConfigUsers title="Pessoa Física" content={content} />

      <GroupConfigBank
        title="Contas bancárias"
        recipientId={content?.id}
      />

      <GroupConfig
        title="Configurações"
        content={{
          autoTransfer: "Sim",
          transferFrequency: "Mensal",
          transferDay: "Dia 15",
          autoAdvance: "Sim",
          advanceType: "Full",
          advanceVolume: "50",
          advanceDays: "Dia X",
        }}
      />

    </>
  );
}
