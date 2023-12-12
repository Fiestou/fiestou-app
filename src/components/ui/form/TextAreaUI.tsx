import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
// import "react-quill/dist/quill.bubble.css";

// const QuillNoSSRWrapper = dynamic(import("react-quill"), {
//   ssr: false,
//   loading: () => <></>,
// });

const modules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const formats = [
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "indent",
  "link",
];

interface TextAreaType {
  name?: string;
  onChange?: Function;
  onKeyUp?: Function;
  onBlur?: Function;
  prevent?: boolean;
  className?: string;
  id?: string;
  rows?: number | string;
  value?: string;
  placeholder?: string;
  options?: any;
  errorMessage?: string | boolean;
  required?: boolean;
  readonly?: boolean;
}

export default function TextArea(attr: TextAreaType) {
  const [render, setRender] = useState(false as boolean);

  const getLines = (value: string) => {
    let split = value.toString().split("\n");
    return !!split.length ? split.length + 1 : 5;
  };

  const autoHeight = (value: string) => {
    const lines = getLines(value);
    setRows(lines);
  };

  const [rows, setRows] = useState(5 as number);

  const onKeyUp = !!attr?.onKeyUp ? attr?.onKeyUp : attr?.onChange;
  const onBlur = !!attr?.onBlur ? attr?.onBlur : attr?.onChange;

  useEffect(() => {
    if (!!document) {
      setRender(true);
      setRows(parseInt((attr?.rows ?? getLines(attr?.value ?? "")).toString()));
    }
  }, []);

  return !render ? (
    <>
      {attr?.options?.plugin == "quill" ? (
        <div
          className={`form-control ${
            attr?.options?.formate == "line"
              ? "min-h-[40px] pt-[1.99px]"
              : "min-h-[5rem]"
          } focus:border-zinc-800 pb-0 pt-1 px-0 hover:border-zinc-400 ease`}
        >
          {/* <QuillNoSSRWrapper
            modules={modules}
            formats={formats}
            value={attr?.value}
            theme={`${!!attr?.options?.plugin?.theme ? "snow" : "bubble"}`}
            className="h-full"
            onChange={(e: any) => (!!attr?.onChange ? attr?.onChange(e) : {})}
          /> */}
          <style global jsx>
            {`
              .ql-container {
                font-size: 0.9rem;
              }
              .ql-editor {
                line-height: 1.5;
              }
            `}
          </style>
        </div>
      ) : (
        <textarea
          name={attr?.name}
          id={attr?.id ?? attr?.name}
          placeholder={attr?.placeholder}
          readOnly={attr?.readonly}
          defaultValue={attr?.value}
          className={`${attr?.className ?? ""} ${
            attr?.errorMessage ? "border-red-500 placeholder-red-300" : ""
          } form-control focus:border-zinc-800 hover:border-zinc-400 ease ${
            !!attr?.readonly
              ? "opacity-50 bg-zinc-100 placeholder-zinc-500"
              : "focus:border-zinc-800  hover:border-zinc-400"
          }`}
          onChange={(e) => {
            autoHeight(e.target.value);
            !!attr?.onChange ? attr?.onChange(e) : {};
          }}
          onKeyUp={(e) => (!!onKeyUp && !attr?.prevent ? onKeyUp(e) : {})}
          onBlur={(e) => (!!onBlur && !attr?.prevent ? onBlur(e) : {})}
          rows={rows}
          style={{ minHeight: `6rem` }}
          {...(!!attr?.required ? { required: true } : {})}
        ></textarea>
      )}
      {attr?.errorMessage && (
        <div className="text-red-500 text-xs pt-1 font-semibold">
          {attr?.errorMessage}
        </div>
      )}
    </>
  ) : (
    <></>
  );
}
