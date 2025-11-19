import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { ReactNode } from "react";

interface ReCaptchaWrapperProps {
  children: ReactNode;
}

export default function ReCaptchaWrapper({ children }: ReCaptchaWrapperProps) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
      language="pt-BR"
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
