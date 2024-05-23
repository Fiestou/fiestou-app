import React, { useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function HCaptchaComponent({ onVerify }: any) {
  const [token, setToken] = useState("");
  const captchaRef = useRef(null);

  const handleVerificationSuccess = (token: string) => {
    setToken(token);
    if (onVerify) {
      onVerify(token);
    }
  };

  return (
    <div>
      <HCaptcha
        ref={captchaRef}
        sitekey="5e9ea4c4-f610-40d0-a45c-d9065fde275e"
        onVerify={handleVerificationSuccess}
      />
    </div>
  );
}
