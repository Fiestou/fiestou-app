import { Button, Input } from "@/src/components/ui/form";
import Editor from "@/src/components/ui/form/EditorUI";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Api from "@/src/services/api";
import Template from "@/src/template";
import { useEffect, useState } from "react";

type ChannelTab = "email" | "whatsapp";
type EditorMode = "visual" | "code" | "preview";

const BODY_START_MARKER = "<!-- BODY_START -->";
const BODY_END_MARKER = "<!-- BODY_END -->";

interface TemplateVariable {
  key: string;
  label: string;
}

interface MessageTemplate {
  id: number;
  slug: string;
  name: string;
  description: string;
  email_subject: string;
  email_body: string;
  email_enabled: boolean;
  whatsapp_body: string;
  whatsapp_enabled: boolean;
  available_variables: string;
  variables: TemplateVariable[];
  has_default?: boolean;
}

function extractBodyContent(html: string): string {
  const startIdx = html.indexOf(BODY_START_MARKER);
  const endIdx = html.indexOf(BODY_END_MARKER);
  if (startIdx === -1 || endIdx === -1) return html;
  return html.substring(startIdx + BODY_START_MARKER.length, endIdx).trim();
}

function replaceBodyContent(fullHtml: string, newContent: string): string {
  const startIdx = fullHtml.indexOf(BODY_START_MARKER);
  const endIdx = fullHtml.indexOf(BODY_END_MARKER);
  if (startIdx === -1 || endIdx === -1) return newContent;
  return (
    fullHtml.substring(0, startIdx + BODY_START_MARKER.length) +
    "\n" +
    newContent +
    "\n" +
    fullHtml.substring(endIdx)
  );
}

function hasBodyMarkers(html: string): boolean {
  return html.includes(BODY_START_MARKER) && html.includes(BODY_END_MARKER);
}

export default function Templates() {
  const api = new Api();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selected, setSelected] = useState<MessageTemplate | null>(null);
  const [channelTab, setChannelTab] = useState<ChannelTab>("email");
  const [editorMode, setEditorMode] = useState<EditorMode>("code");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappBody, setWhatsappBody] = useState("");
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response: any = await api.bridge({
        method: "get",
        url: "admin/templates",
      });
      if (response.response) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = (t: MessageTemplate) => {
    setSelected(t);
    setEmailSubject(t.email_subject || "");
    setEmailBody(t.email_body || "");
    setEmailEnabled(t.email_enabled);
    setWhatsappBody(t.whatsapp_body || "");
    setWhatsappEnabled(t.whatsapp_enabled);
    setMessage(null);
    setEditorMode("code");
  };

  const saveTemplate = async () => {
    if (!selected) return;
    setSaving(true);
    setMessage(null);
    try {
      const response: any = await api.bridge({
        method: "put",
        url: `admin/templates/${selected.slug}`,
        data: {
          email_subject: emailSubject,
          email_body: emailBody,
          email_enabled: emailEnabled,
          whatsapp_body: whatsappBody,
          whatsapp_enabled: whatsappEnabled,
        },
      });
      if (response.response) {
        setMessage({ type: "success", text: "Template salvo" });
        loadTemplates();
      } else {
        setMessage({ type: "error", text: response.message || "Erro ao salvar" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao salvar" });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (!selected) return;
    if (!confirm("Restaurar este template ao padrao original? As alteracoes atuais serao perdidas.")) return;
    setResetting(true);
    setMessage(null);
    try {
      const response: any = await api.bridge({
        method: "post",
        url: `admin/templates/${selected.slug}/reset`,
      });
      if (response.response) {
        const data = response.data;
        setEmailSubject(data.email_subject || "");
        setEmailBody(data.email_body || "");
        setEmailEnabled(data.email_enabled);
        setSelected(data);
        setMessage({ type: "success", text: "Template restaurado ao padrao" });
        loadTemplates();
      } else {
        setMessage({ type: "error", text: response.message || "Erro ao restaurar" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao restaurar template" });
    } finally {
      setResetting(false);
    }
  };

  const insertVariable = (variable: string) => {
    if (channelTab === "email") {
      if (editorMode === "visual" && hasBodyMarkers(emailBody)) {
        const currentBody = extractBodyContent(emailBody);
        setEmailBody(replaceBodyContent(emailBody, currentBody + variable));
      } else {
        setEmailBody((prev) => prev + variable);
      }
    } else {
      setWhatsappBody((prev) => prev + variable);
    }
  };

  const getVariables = (): TemplateVariable[] => {
    if (!selected) return [];
    try {
      const vars =
        typeof selected.available_variables === "string"
          ? JSON.parse(selected.available_variables)
          : selected.variables || [];
      return vars;
    } catch {
      return [];
    }
  };

  const sendTest = async () => {
    if (!selected || !testEmail) {
      setMessage({ type: "error", text: "Digite um email para teste" });
      return;
    }
    setTesting(true);
    setMessage(null);
    try {
      await api.bridge({
        method: "put",
        url: `admin/templates/${selected.slug}`,
        data: {
          email_subject: emailSubject,
          email_body: emailBody,
          email_enabled: emailEnabled,
          whatsapp_body: whatsappBody,
          whatsapp_enabled: whatsappEnabled,
        },
      });

      const response: any = await api.bridge({
        method: "post",
        url: `admin/templates/${selected.slug}/test`,
        data: { test_email: testEmail },
      });
      if (response.response) {
        setMessage({ type: "success", text: response.message || "Email enviado" });
      } else {
        setMessage({ type: "error", text: response.message || "Erro no envio" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: "Erro ao enviar email de teste" });
    } finally {
      setTesting(false);
    }
  };

  const getFilteredVariables = (): TemplateVariable[] => {
    const vars = getVariables();
    if (channelTab === "email") {
      return vars.filter((v) => !v.key.includes("_texto"));
    }
    const whatsappExclude = ["{itens_pedido}", "{info_entrega}", "{itens_carrinho}"];
    return vars.filter((v) => !whatsappExclude.includes(v.key));
  };

  const handleVisualChange = (val: string) => {
    if (hasBodyMarkers(emailBody)) {
      setEmailBody((prev) => replaceBodyContent(prev, val));
    } else {
      setEmailBody(val);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const templateIcons: Record<string, string> = {
    register_user: "fa-user-plus",
    recovery_password: "fa-key",
    order_created: "fa-shopping-cart",
    order_complete: "fa-check-circle",
    partner_new_order: "fa-store",
    delivery_status: "fa-truck",
    cart_abandoned: "fa-cart-arrow-down",
  };

  return (
    <Template header={{ template: "admin", position: "solid" }} footer={{ template: "clean" }}>
      <section>
        <div className="container-medium pt-12 pb-8 md:py-12">
          <div className="flex">
            <div className="w-full text-sm text-zinc-500">
              <a href="/admin" className="hover:text-zinc-700">
                Admin
              </a>
              {" > "}
              <a href="/admin/configuracoes" className="hover:text-zinc-700">
                Configuracoes
              </a>
              {" > "}
              Templates
            </div>
          </div>
          <div className="flex items-center mt-10">
            <div className="font-title font-bold text-3xl md:text-4xl flex gap-4 items-center text-zinc-900 w-full">
              <Icon icon="fa-file-alt" />
              Templates de Mensagem
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container-medium pb-12">
          {loading && !selected ? (
            <div className="text-center py-12">
              <Icon icon="fa-spinner" className="animate-spin text-2xl" />
            </div>
          ) : !selected ? (
            /* Lista de templates */
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => (
                <div
                  key={t.id}
                  onClick={() => selectTemplate(t)}
                  className="bg-white border rounded-lg p-5 cursor-pointer hover:border-yellow-500 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                      <Icon icon={templateIcons[t.slug] || "fa-file-alt"} className="text-zinc-600" />
                    </div>
                    <h3 className="font-semibold text-zinc-900">{t.name}</h3>
                  </div>
                  <p className="text-sm text-zinc-500 mb-3">{t.description}</p>
                  <div className="flex gap-2">
                    {t.email_enabled ? (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        <Icon icon="fa-envelope" className="mr-1" />
                        Email
                      </span>
                    ) : (
                      <span className="text-xs bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded line-through">Email</span>
                    )}
                    {t.whatsapp_enabled ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        <Icon icon="fa-whatsapp" type="fab" className="mr-1" />
                        WhatsApp
                      </span>
                    ) : (
                      <span className="text-xs bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded line-through">
                        WhatsApp
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Editor de template */
            <div>
              <button
                onClick={() => {
                  setSelected(null);
                }}
                className="flex items-center gap-2 text-zinc-500 hover:text-zinc-700 mb-6"
              >
                <Icon icon="fa-arrow-left" />
                Voltar
              </button>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Editor principal */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white border rounded-lg">
                    <div className="p-5 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                          <Icon
                            icon={templateIcons[selected.slug] || "fa-file-alt"}
                            className="text-zinc-600"
                          />
                        </div>
                        <div className="flex-1">
                          <h2 className="font-semibold text-lg">{selected.name}</h2>
                          <p className="text-sm text-zinc-500">{selected.description}</p>
                        </div>
                        {/* Restaurar padrao */}
                        {selected.has_default && (
                          <button
                            onClick={resetToDefault}
                            disabled={resetting}
                            className="text-xs text-zinc-400 hover:text-orange-600 border border-zinc-200 hover:border-orange-300 rounded-lg px-3 py-2 transition-colors flex items-center gap-1.5"
                            title="Restaurar template ao padrao original"
                          >
                            <Icon icon="fa-undo" />
                            {resetting ? "Restaurando..." : "Restaurar padrao"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Tabs Email / WhatsApp */}
                    <div className="flex border-b">
                      <button
                        onClick={() => setChannelTab("email")}
                        className={`flex-1 py-3 px-4 font-medium text-sm transition-colors ${
                          channelTab === "email"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-zinc-500 hover:text-zinc-700"
                        }`}
                      >
                        <Icon icon="fa-envelope" className="mr-2" />
                        Email
                      </button>
                      <button
                        onClick={() => setChannelTab("whatsapp")}
                        className={`flex-1 py-3 px-4 font-medium text-sm transition-colors ${
                          channelTab === "whatsapp"
                            ? "border-b-2 border-green-500 text-green-600"
                            : "text-zinc-500 hover:text-zinc-700"
                        }`}
                      >
                        <Icon icon="fa-whatsapp" type="fab" className="mr-2" />
                        WhatsApp
                      </button>
                    </div>

                    <div className="p-5">
                      {channelTab === "email" ? (
                        <div className="space-y-4">
                          {/* Toggle ativo */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Email ativo</span>
                            <div
                              onClick={() => setEmailEnabled(!emailEnabled)}
                              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                emailEnabled ? "bg-blue-500" : "bg-zinc-300"
                              }`}
                            >
                              <div
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                  emailEnabled ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </div>
                          </div>

                          {/* Assunto */}
                          <div>
                            <label className="block text-sm font-medium mb-1">Assunto</label>
                            <Input
                              type="text"
                              value={emailSubject}
                              onChange={(e: any) => setEmailSubject(e.target.value)}
                              placeholder="Assunto do email"
                            />
                          </div>

                          {/* Toggle Visual / Codigo / Preview */}
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium">Corpo do email</label>
                            <div className="flex bg-zinc-100 rounded-lg p-0.5">
                              <button
                                onClick={() => setEditorMode("visual")}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                  editorMode === "visual"
                                    ? "bg-white text-zinc-900 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-700"
                                }`}
                              >
                                <Icon icon="fa-pen" className="mr-1" />
                                Visual
                              </button>
                              <button
                                onClick={() => setEditorMode("code")}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                  editorMode === "code"
                                    ? "bg-white text-zinc-900 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-700"
                                }`}
                              >
                                <Icon icon="fa-code" className="mr-1" />
                                HTML
                              </button>
                              <button
                                onClick={() => setEditorMode("preview")}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                  editorMode === "preview"
                                    ? "bg-white text-zinc-900 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-700"
                                }`}
                              >
                                <Icon icon="fa-eye" className="mr-1" />
                                Preview
                              </button>
                            </div>
                          </div>

                          {/* Editor baseado no modo */}
                          {editorMode === "visual" ? (
                            <div>
                              <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: "#f1f1f1" }}>
                                {/* Header visual do email (nao editavel) */}
                                <div style={{
                                  backgroundColor: "#00a7eb",
                                  padding: "28px 36px",
                                  textAlign: "center",
                                  borderRadius: "3px 3px 0 0",
                                }}>
                                  <img
                                    src="https://api.fiestou.com.br/images/fiestou-logo-email.jpg"
                                    width="100"
                                    alt="Fiestou"
                                    style={{ display: "inline-block" }}
                                  />
                                </div>

                                {/* Area editavel - corpo do email */}
                                <div style={{ backgroundColor: "#fff" }} className="visual-editor-centered">
                                  <style>{`.visual-editor-centered .ql-editor { text-align: center; font-family: 'Helvetica Neue',Helvetica,Roboto,Arial,sans-serif; color: #222; font-size: 16px; } .visual-editor-centered .ql-editor p { margin-bottom: 1rem; }`}</style>
                                  <Editor
                                    value={hasBodyMarkers(emailBody) ? extractBodyContent(emailBody) : emailBody}
                                    onChange={handleVisualChange}
                                    placeholder="Escreva o conteudo do email..."
                                    minHeight={200}
                                  />
                                </div>

                                {/* Footer visual do email (nao editavel) */}
                                <div style={{
                                  textAlign: "center",
                                  padding: "20px 10px",
                                  fontSize: "12px",
                                  color: "#8a8a8a",
                                  fontFamily: "'Helvetica Neue',Helvetica,Roboto,Arial,sans-serif",
                                  lineHeight: "1.5",
                                }}>
                                  <p style={{ margin: "12px 0" }}>Fiestou</p>
                                  <p style={{ margin: "12px 0" }}>Clicou, Marcou, Fiestou</p>
                                  <p style={{ margin: "12px 0" }}>
                                    <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "#8a8a8a" }}>www.fiestou.com.br</a>
                                  </p>
                                  <p style={{ margin: "12px 0", display: "flex", justifyContent: "center", gap: "8px" }}>
                                    <img src="https://api.fiestou.com.br/images/icon-instagram.png" width="20" alt="Instagram" />
                                    <img src="https://api.fiestou.com.br/images/icon-facebook.png" width="20" alt="Facebook" />
                                    <img src="https://api.fiestou.com.br/images/icon-pinterest.png" width="20" alt="Pinterest" />
                                    <img src="https://api.fiestou.com.br/images/icon-tiktok.png" width="20" alt="TikTok" />
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-zinc-400 mt-2">
                                <Icon icon="fa-info-circle" className="mr-1" />
                                Edite o conteudo do corpo acima. Header e footer sao editaveis no modo <strong>HTML</strong>.
                              </p>
                            </div>
                          ) : editorMode === "code" ? (
                            <div>
                              <textarea
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                                rows={20}
                                className="w-full border rounded-lg p-3 text-sm font-mono bg-zinc-900 text-green-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y leading-relaxed"
                                placeholder="<!DOCTYPE html>..."
                                spellCheck={false}
                              />
                              <p className="text-xs text-zinc-400 mt-2">
                                <Icon icon="fa-info-circle" className="mr-1" />
                                HTML completo do email: header, corpo, footer, estilos. Tudo editavel.
                              </p>
                            </div>
                          ) : (
                            /* Preview mode - iframe */
                            <div>
                              <div className="border rounded-lg overflow-hidden bg-zinc-100">
                                <div className="bg-zinc-200 px-3 py-1.5 flex items-center gap-2 border-b">
                                  <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                  </div>
                                  <span className="text-xs text-zinc-500 ml-2">Preview do email</span>
                                </div>
                                <iframe
                                  srcDoc={emailBody}
                                  className="w-full bg-white"
                                  style={{ minHeight: "500px", border: "none" }}
                                  title="Email Preview"
                                  sandbox="allow-same-origin"
                                />
                              </div>
                              <p className="text-xs text-zinc-400 mt-2">
                                <Icon icon="fa-info-circle" className="mr-1" />
                                Variaveis aparecem como texto (ex: {"{nome_cliente}"}). No envio real serao substituidas.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Toggle ativo */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">WhatsApp ativo</span>
                            <div
                              onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                whatsappEnabled ? "bg-green-500" : "bg-zinc-300"
                              }`}
                            >
                              <div
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                  whatsappEnabled ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </div>
                          </div>

                          {/* Editor de texto WhatsApp */}
                          <div>
                            <label className="block text-sm font-medium mb-1">Mensagem</label>
                            <textarea
                              value={whatsappBody}
                              onChange={(e) => setWhatsappBody(e.target.value)}
                              rows={10}
                              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
                              placeholder="Mensagem do WhatsApp..."
                            />
                            <div className="flex gap-4 mt-2 text-xs text-zinc-400">
                              <span>
                                <code className="bg-zinc-100 px-1 rounded">*texto*</code> = negrito
                              </span>
                              <span>
                                <code className="bg-zinc-100 px-1 rounded">_texto_</code> = italico
                              </span>
                              <span>
                                <code className="bg-zinc-100 px-1 rounded">~texto~</code> = riscado
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mensagem de feedback */}
                      {message && (
                        <div
                          className={`mt-4 p-3 rounded-lg text-sm ${
                            message.type === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {message.text}
                        </div>
                      )}

                      {/* Acoes */}
                      <div className="flex gap-3 mt-6">
                        <Button onClick={saveTemplate} loading={saving}>
                          Salvar
                        </Button>
                      </div>

                      {/* Enviar teste */}
                      {channelTab === "email" && (
                        <div className="border-t mt-6 pt-6">
                          <p className="font-medium text-sm mb-3">
                            <Icon icon="fa-paper-plane" className="mr-2 text-zinc-400" />
                            Enviar email de teste
                          </p>
                          <div className="flex gap-3">
                            <Input
                              type="email"
                              placeholder="email@teste.com"
                              value={testEmail}
                              onChange={(e: any) => setTestEmail(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              onClick={sendTest}
                              loading={testing}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Enviar
                            </Button>
                          </div>
                          <p className="text-xs text-zinc-400 mt-2">
                            Salva e envia este template com dados de exemplo para o email informado
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-80 space-y-4">
                  {/* Variaveis disponiveis */}
                  <div className="bg-white border rounded-lg p-5">
                    <h3 className="font-semibold text-sm mb-3">
                      <Icon icon="fa-code" className="mr-2 text-zinc-400" />
                      Variaveis disponiveis
                    </h3>
                    <div className="space-y-1">
                      {getFilteredVariables().map((v: TemplateVariable) => (
                        <button
                          key={v.key}
                          onClick={() => insertVariable(v.key)}
                          className="flex flex-col w-full text-left p-2 rounded hover:bg-yellow-50 transition-colors group"
                        >
                          <code className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-mono inline-block">
                            {v.key}
                          </code>
                          <span className="text-xs text-zinc-500 mt-1">{v.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-400 mt-3 border-t pt-3">
                      Clique para inserir no editor
                    </p>
                  </div>

                  {/* Info sobre o canal */}
                  <div className="bg-zinc-50 border rounded-lg p-4">
                    <p className="text-xs text-zinc-500">
                      {channelTab === "email" ? (
                        <>
                          O template contem o HTML <strong>completo</strong> do email: header, corpo, footer e estilos.
                          Use <strong>Visual</strong> para editar o conteudo, <strong>HTML</strong> para personalizar o
                          layout inteiro, ou <strong>Preview</strong> para visualizar o resultado final.
                        </>
                      ) : (
                        <>
                          Mensagens WhatsApp suportam formatacao basica: *negrito*, _italico_, ~riscado~.
                          Links sao reconhecidos automaticamente.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Template>
  );
}
