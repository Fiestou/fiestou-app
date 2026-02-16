import { Button, Input } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Api from "@/src/services/api";
import Template from "@/src/template";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type TabType = "gmail" | "zapi";

interface GmailStatus {
  enabled: boolean;
  connected: boolean;
  connected_email: string | null;
  client_configured: boolean;
  from_name: string;
}

interface ZapiSettings {
  enabled: string;
  instance_id: string;
  token: string;
  security_token: string;
  token_configured?: boolean;
  security_token_configured?: boolean;
}

const initialZapi: ZapiSettings = {
  enabled: "0",
  instance_id: "",
  token: "",
  security_token: "",
};

export default function Configuracoes() {
  const api = new Api();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("gmail");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [gmail, setGmail] = useState<GmailStatus>({
    enabled: false,
    connected: false,
    connected_email: null,
    client_configured: false,
    from_name: "Fiestou",
  });
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [fromName, setFromName] = useState("Fiestou");
  const [testEmail, setTestEmail] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);

  const [zapi, setZapi] = useState<ZapiSettings>(initialZapi);
  const [testPhone, setTestPhone] = useState("");
  const [redirectUri, setRedirectUri] = useState("");

  useEffect(() => {
    setRedirectUri(`${window.location.origin}/admin/configuracoes/gmail-callback`);
  }, []);

  const handleZapi = (value: Partial<ZapiSettings>) => {
    setZapi((prev) => ({ ...prev, ...value }));
  };

  const loadGmailStatus = async () => {
    setLoading(true);
    try {
      const response: any = await api.bridge({
        method: "get",
        url: "admin/settings/gmail/status",
      });
      if (response.response) {
        setGmail(response.data);
        setFromName(response.data.from_name || "Fiestou");
      }
    } catch (error) {
      console.error("Erro ao carregar status Gmail:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadZapiSettings = async () => {
    setLoading(true);
    try {
      const response: any = await api.bridge({
        method: "get",
        url: "admin/settings/zapi",
      });
      if (response.response) {
        setZapi({ ...initialZapi, ...response.data });
      }
    } catch (error) {
      console.error("Erro ao carregar Z-API:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveGoogleCredentials = async () => {
    if (!clientId || !clientSecret) {
      setMessage({ type: "error", text: "Preencha todos os campos" });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const response: any = await api.bridge({
        method: "put",
        url: "admin/settings/gmail/credentials",
        data: { client_id: clientId, client_secret: clientSecret, from_name: fromName },
      });
      if (response.response) {
        setMessage({ type: "success", text: "Credenciais salvas" });
        setShowCredentials(false);
        loadGmailStatus();
      } else {
        setMessage({ type: "error", text: response.message || "Erro ao salvar" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao salvar" });
    } finally {
      setSaving(false);
    }
  };

  const connectGoogle = async () => {
    try {
      const response: any = await api.bridge({
        method: "get",
        url: `admin/settings/gmail/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`,
      });
      if (response.response && response.auth_url) {
        window.location.href = response.auth_url;
      } else {
        setMessage({ type: "error", text: response.message || "Erro ao conectar" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao conectar" });
    }
  };

  const disconnectGmail = async () => {
    if (!confirm("Desconectar Gmail?")) return;
    setSaving(true);
    try {
      const response: any = await api.bridge({
        method: "post",
        url: "admin/settings/gmail/disconnect",
      });
      if (response.response) {
        setMessage({ type: "success", text: "Desconectado" });
        loadGmailStatus();
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro" });
    } finally {
      setSaving(false);
    }
  };

  const testGmail = async () => {
    if (!testEmail) {
      setMessage({ type: "error", text: "Digite um email" });
      return;
    }
    setTesting(true);
    setMessage(null);
    try {
      const response: any = await api.bridge({
        method: "post",
        url: "admin/settings/gmail/test",
        data: { test_email: testEmail },
      });
      if (response.response) {
        setMessage({ type: "success", text: "Email enviado" });
      } else {
        setMessage({ type: "error", text: response.error || "Erro no envio" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: "Erro no envio" });
    } finally {
      setTesting(false);
    }
  };

  const saveZapi = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response: any = await api.bridge({
        method: "put",
        url: "admin/settings/zapi",
        data: zapi,
      });
      if (response.response) {
        setMessage({ type: "success", text: "Salvo" });
        loadZapiSettings();
      } else {
        setMessage({ type: "error", text: response.message || "Erro" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao salvar" });
    } finally {
      setSaving(false);
    }
  };

  const testZapi = async () => {
    if (!testPhone) {
      setMessage({ type: "error", text: "Digite um telefone" });
      return;
    }
    setTesting(true);
    setMessage(null);
    try {
      const response: any = await api.bridge({
        method: "post",
        url: "admin/settings/test-zapi",
        data: { test_phone: testPhone },
      });
      if (response.response) {
        setMessage({ type: "success", text: "Mensagem enviada" });
      } else {
        setMessage({ type: "error", text: response.error || "Erro" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: "Erro no envio" });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    if (activeTab === "gmail") {
      loadGmailStatus();
    } else {
      loadZapiSettings();
    }
  }, [activeTab]);

  useEffect(() => {
    const { code, error } = router.query;
    if (code && typeof code === "string" && redirectUri) {
      const processCallback = async () => {
        setLoading(true);
        try {
          const response: any = await api.bridge({
            method: "post",
            url: "admin/settings/gmail/callback",
            data: { code, redirect_uri: redirectUri },
          });
          if (response.response) {
            setMessage({ type: "success", text: `Conectado: ${response.email}` });
            loadGmailStatus();
          } else {
            setMessage({ type: "error", text: response.error || "Erro" });
          }
        } catch (err) {
          setMessage({ type: "error", text: "Erro na autorização" });
        } finally {
          setLoading(false);
          router.replace("/admin/configuracoes", undefined, { shallow: true });
        }
      };
      processCallback();
    }
    if (error) {
      setMessage({ type: "error", text: `Erro: ${error}` });
      router.replace("/admin/configuracoes", undefined, { shallow: true });
    }
  }, [router.query, redirectUri]);

  return (
    <Template header={{ template: "admin", position: "solid" }} footer={{ template: "clean" }}>
      <section>
        <div className="container-medium pt-12 pb-8 md:py-12">
          <div className="flex">
            <div className="w-full">Admin {">"} Configurações</div>
          </div>
          <div className="flex items-center mt-10">
            <div className="font-title font-bold text-3xl md:text-4xl flex gap-4 items-center text-zinc-900 w-full">
              <Icon icon="fa-cog" />
              Configurações do Sistema
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container-medium pb-12">
          <div className="flex gap-4 border-b mb-8 items-center">
            <button
              onClick={() => setActiveTab("gmail")}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === "gmail" ? "border-b-2 border-yellow-500 text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Icon icon="fa-envelope" className="mr-2" />
              Email (Gmail)
            </button>
            <button
              onClick={() => setActiveTab("zapi")}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === "zapi" ? "border-b-2 border-yellow-500 text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Icon icon="fa-whatsapp" type="fab" className="mr-2" />
              WhatsApp (Z-API)
            </button>
            <a
              href="/admin/templates"
              className="pb-3 px-4 font-semibold text-zinc-500 hover:text-zinc-700 transition-colors ml-auto"
            >
              <Icon icon="fa-file-alt" className="mr-2" />
              Templates
            </a>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <Icon icon="fa-spinner" className="animate-spin text-2xl" />
            </div>
          ) : (
            <>
              {activeTab === "gmail" && (
                <div className="bg-white border rounded-lg p-6">
                  {gmail.connected ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <Icon icon="fa-check" className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">{gmail.connected_email}</p>
                          <p className="text-sm text-zinc-500">Conectado</p>
                        </div>
                      </div>

                      <div className="flex gap-3 flex-wrap">
                        <Button onClick={disconnectGmail} className="bg-zinc-200 text-zinc-700 hover:bg-zinc-300">
                          Desconectar
                        </Button>
                        <Button onClick={() => setShowCredentials(true)} className="bg-zinc-200 text-zinc-700 hover:bg-zinc-300">
                          Alterar credenciais
                        </Button>
                      </div>

                      <div className="border-t pt-6">
                        <p className="font-medium mb-3">Testar envio</p>
                        <div className="flex gap-3">
                          <Input
                            type="email"
                            placeholder="email@teste.com"
                            value={testEmail}
                            onChange={(e: any) => setTestEmail(e.target.value)}
                            className="flex-1"
                          />
                          <Button onClick={testGmail} loading={testing}>
                            Enviar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : showCredentials || !gmail.client_configured ? (
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium mb-1">Client ID</label>
                        <Input
                          type="text"
                          placeholder="Client ID"
                          value={clientId}
                          onChange={(e: any) => setClientId(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Client Secret</label>
                        <Input
                          type="password"
                          placeholder="Client Secret"
                          value={clientSecret}
                          onChange={(e: any) => setClientSecret(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Nome do remetente</label>
                        <Input
                          type="text"
                          placeholder="Fiestou"
                          value={fromName}
                          onChange={(e: any) => setFromName(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button onClick={saveGoogleCredentials} loading={saving}>
                          Salvar
                        </Button>
                        {gmail.client_configured && (
                          <Button onClick={() => setShowCredentials(false)} className="bg-zinc-200 text-zinc-700">
                            Cancelar
                          </Button>
                        )}
                      </div>
                      {redirectUri && (
                        <p className="text-xs text-zinc-500 pt-2">
                          Redirect URI: <code className="bg-zinc-100 px-1 rounded">{redirectUri}</code>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Button onClick={connectGoogle} className="bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-50 px-6">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5 mr-2" />
                        Conectar com Google
                      </Button>
                      <p className="text-xs text-zinc-500 mt-4">
                        <button onClick={() => setShowCredentials(true)} className="underline">
                          Alterar credenciais
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "zapi" && (
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-medium">WhatsApp (Z-API)</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm text-zinc-500">{zapi.enabled === "1" ? "Ativo" : "Inativo"}</span>
                      <div
                        onClick={() => handleZapi({ enabled: zapi.enabled === "1" ? "0" : "1" })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${zapi.enabled === "1" ? "bg-green-500" : "bg-zinc-300"}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${zapi.enabled === "1" ? "translate-x-6" : "translate-x-1"}`} />
                      </div>
                    </label>
                  </div>

                  <div className="space-y-4 max-w-lg">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Instance ID</label>
                        <Input
                          type="text"
                          placeholder="Instance ID"
                          value={zapi.instance_id}
                          onChange={(e: any) => handleZapi({ instance_id: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Token {zapi.token_configured && <span className="text-green-600 text-xs">(ok)</span>}
                        </label>
                        <Input
                          type="password"
                          placeholder={zapi.token_configured ? "••••••••" : "Token"}
                          value={zapi.token}
                          onChange={(e: any) => handleZapi({ token: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Security Token {zapi.security_token_configured && <span className="text-green-600 text-xs">(ok)</span>}
                      </label>
                      <Input
                        type="password"
                        placeholder={zapi.security_token_configured ? "••••••••" : "Security Token (opcional)"}
                        value={zapi.security_token}
                        onChange={(e: any) => handleZapi({ security_token: e.target.value })}
                      />
                    </div>
                    <div className="pt-2">
                      <Button onClick={saveZapi} loading={saving}>
                        Salvar
                      </Button>
                    </div>
                  </div>

                  <div className="border-t mt-6 pt-6">
                    <p className="font-medium mb-3">Testar envio</p>
                    <div className="flex gap-3 max-w-md">
                      <Input
                        type="text"
                        placeholder="11999999999"
                        value={testPhone}
                        onChange={(e: any) => setTestPhone(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={testZapi} loading={testing} className="bg-green-600 hover:bg-green-700">
                        Enviar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Template>
  );
}
