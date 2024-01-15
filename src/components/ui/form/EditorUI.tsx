import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface EditorType {
  name?: string;
  onChange?: Function;
  onKeyUp?: Function;
  onBlur?: Function;
  prevent?: boolean;
  className?: string;
  id?: string;
  value?: string;
  placeholder?: string;
  errorMessage?: string | boolean;
  required?: boolean;
  readonly?: boolean;
}

export default function Editor(attr: EditorType) {
  const onKeyUp = !!attr?.onKeyUp ? attr?.onKeyUp : attr?.onChange;
  const onBlur = !!attr?.onBlur ? attr?.onBlur : attr?.onChange;

  const [value, setValue] = useState(attr?.value ?? ("" as any));
  const handleValue = (value: any) => {
    setValue(value);

    attr?.onChange ? attr?.onChange(value) : {};
    onKeyUp && !attr?.prevent ? onKeyUp(value) : {};
    onBlur && !attr?.prevent ? onBlur(value) : {};
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
  ];

  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );

  return (
    <div>
      <ReactQuill
        theme="snow"
        modules={modules}
        formats={formats}
        value={attr?.value}
        onChange={handleValue}
      />
    </div>
  );
}
