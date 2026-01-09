export function RecaptchaNotice() {
  return (
    <div className="text-xs text-center text-gray-500 pt-4">
      Este site é protegido pelo reCAPTCHA e aplica a{" "}
      <a
        href="https://policies.google.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        Política de Privacidade
      </a>{" "}
      e os{" "}
      <a
        href="https://policies.google.com/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        Termos de Serviço
      </a>{" "}
      do Google.
    </div>
  );
}

export default RecaptchaNotice;
