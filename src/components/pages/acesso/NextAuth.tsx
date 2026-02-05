import { signIn } from "next-auth/react";

export const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M17.64 9.20419C17.64 8.56601 17.5827 7.95237 17.4764 7.36328H9V10.8446H13.8436C13.635 11.9696 13.0009 12.9228 12.0477 13.561V15.8192H14.9564C16.6582 14.2524 17.64 11.9451 17.64 9.20419Z" fill="#4285F4" />
    <path fillRule="evenodd" clipRule="evenodd" d="M8.99976 18C11.4298 18 13.467 17.1941 14.9561 15.8195L12.0475 13.5613C11.2416 14.1013 10.2107 14.4204 8.99976 14.4204C6.65567 14.4204 4.67158 12.8372 3.96385 10.71H0.957031V13.0418C2.43794 15.9831 5.48158 18 8.99976 18Z" fill="#34A853" />
    <path fillRule="evenodd" clipRule="evenodd" d="M3.96409 10.7098C3.78409 10.1698 3.68182 9.59301 3.68182 8.99983C3.68182 8.40664 3.78409 7.82983 3.96409 7.28983V4.95801H0.957273C0.347727 6.17301 0 7.54755 0 8.99983C0 10.4521 0.347727 11.8266 0.957273 13.0416L3.96409 10.7098Z" fill="#FBBC05" />
    <path fillRule="evenodd" clipRule="evenodd" d="M8.99976 3.57955C10.3211 3.57955 11.5075 4.03364 12.4402 4.92545L15.0216 2.34409C13.4629 0.891818 11.4257 0 8.99976 0C5.48158 0 2.43794 2.01682 0.957031 4.95818L3.96385 7.29C4.67158 5.16273 6.65567 3.57955 8.99976 3.57955Z" fill="#EA4335" />
  </svg>
);

export const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export function GoogleAuthButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className="w-full rounded flex items-center gap-4 justify-center border py-[.85rem] transition-colors border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900"
    >
      <GoogleIcon /> Continuar com Google
    </button>
  );
}

export function FacebookAuthButton() {
  const disabled = true;
  return (
    <button
      type="button"
      onClick={() => !disabled && signIn("facebook")}
      disabled={disabled}
      className={`w-full rounded flex items-center gap-4 justify-center border py-[.85rem] transition-colors ${
        disabled
          ? "border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed"
          : "border-[#1877F2] bg-[#1877F2] hover:bg-[#166FE5] text-white"
      }`}
      title={disabled ? "Em breve" : undefined}
    >
      <FacebookIcon /> Continuar com Facebook
    </button>
  );
}

interface SocialAuthProps {
  showFacebook?: boolean;
}

export function SocialAuth({ showFacebook = true }: SocialAuthProps) {
  return (
    <div className="flex flex-col gap-3">
      <GoogleAuthButton />
      {showFacebook && <FacebookAuthButton />}
    </div>
  );
}

export default function NextAuth() {
  return <GoogleAuthButton />;
}
