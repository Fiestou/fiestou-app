import * as React from "react";

// Props: herda TUDO do <input>, e adiciona seus extras
export type InputType = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  // vamos controlar esses nomes para dar alias/semântica
  "readOnly" | "onChange" | "onKeyUp" | "onKeyPress" | "onBlur"
> & {
  placeholderStyle?: string;
  errorMessage?: string | boolean;
  help?: string;
  /** se true, bloqueia onKeyUp/onBlur (como no seu código) */
  prevent?: boolean;
  /** alias legada para readOnly */
  readonly?: boolean;
  /** alias legada para autoFocus */
  focus?: boolean;
  /** callbacks tipados */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>;
  onKeyPress?: React.KeyboardEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
};

const Input = React.forwardRef<HTMLInputElement, InputType>((attr, ref) => {
  const {
    className,
    placeholderStyle,
    errorMessage,
    help,
    prevent,
    readonly,
    focus,
    onChange,
    onKeyUp,
    onKeyPress,
    onBlur,
    type = "text",
    ...rest
  } = attr;

  // Handlers respeitando o "prevent" do seu componente
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange?.(e);
  };

  const handleKeyUp: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!prevent) onKeyUp?.(e);
  };

  const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    onKeyPress?.(e);
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    if (!prevent) onBlur?.(e);
  };

  const classes = `${className ?? ""} ${
    errorMessage
      ? "border-red-500 placeholder-red-300"
      : placeholderStyle ?? "placeholder-zinc-300"
  } form-control ease ${
    readonly ? "opacity-50 bg-zinc-100 placeholder-zinc-500" : "focus:border-zinc-800  hover:border-zinc-400"
  }`;

  return (
    <>
      <input
        ref={ref}
        // aliases legados convertidos para props nativas
        readOnly={readonly}
        autoFocus={!!focus}
        type={type}
        className={classes}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        onKeyPress={handleKeyPress}
        onBlur={handleBlur}
        {...rest} // <- ESSENCIAL: libera inputMode, pattern, maxLength, etc.
      />
      {help && <div className="text-zinc-400 text-xs pt-[2px]">{help}</div>}
      {errorMessage && (
        <div className="text-red-500 text-xs pt-1 font-semibold">
          {errorMessage}
        </div>
      )}
    </>
  );
});

Input.displayName = "Input";
export default Input;
