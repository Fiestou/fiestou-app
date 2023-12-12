import FileInput from "./FileInputUI";
import FileManager from "./FileManager";
import Input from "./InputUI";
import Label from "./LabelUI";
import List from "./ListUI";
import MediaField from "./MediaField";
import Redirect from "./RedirectUI";
import SelectIcon from "./SelectIconUI";
import TextArea from "./TextAreaUI";
import Editor from "./EditorUI";
import Message from "./MessageUI";

export default function HandleField(field: any) {
  const params: any = {
    type: field?.type,
    name: field?.name,
    help: field?.help,
    value: field?.value,
    options: field?.options,
    required: field?.required,
    placeholder: field?.placeholder,
    content: field?.content,
  };

  if (field.type == "input") {
    params["defaultValue"] = params["value"];
    delete params["value"];

    return (
      <>
        <Input
          {...params}
          onChange={(e: any) => field?.emitChange(e.target.value)}
        />
      </>
    );
  }

  if (field.type == "textarea") {
    return (
      <TextArea
        {...params}
        onChange={(event: any) =>
          field?.emitChange(
            !!params?.options?.plugin ? event : event.target.value ?? ""
          )
        }
      />
    );
  }

  if (field.type == "editor") {
    return (
      <Editor
        {...params}
        onChange={(event: any) =>
          field?.emitChange(
            !!params?.options?.plugin ? event : event.target.value ?? ""
          )
        }
      />
    );
  }

  if (field.type == "message") {
    return <Message {...params} content={params.content} />;
  }

  if (field.type == "list") {
    return (
      <List
        {...params}
        form={field?.fields}
        items={field?.value ?? []}
        mainField={field?.mainField}
        singular={field?.singular}
        plural={field?.plural}
        onChange={(emit: any) => field?.emitChange(emit)}
      />
    );
  }

  if (field.type == "media") {
    return (
      <FileManager
        {...params}
        value={field?.value}
        aspect={field?.aspect}
        multiple={field?.multiple}
        onChange={(emit: any) => field?.emitChange(emit)}
      />
    );
  }

  if (field.type == "redirect") {
    return (
      <Redirect {...params} onChange={(emit: any) => field?.emitChange(emit)} />
    );
  }

  if (field.type == "icon") {
    return (
      <SelectIcon
        {...params}
        onChange={(emit: any) => field?.emitChange(emit)}
      />
    );
  }

  return <></>;
}
