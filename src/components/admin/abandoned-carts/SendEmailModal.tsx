import { useState, useEffect, useMemo } from "react";
import { AbandonedCart, AbandonedCartDetail } from "@/src/hooks/useAbandonedCarts";
import { moneyFormat } from "@/src/helper";
import Icon from "@/src/icons/fontAwesome/FIcon";

interface Props {
  cart: AbandonedCart;
  cartDetail: AbandonedCartDetail | null;
  onClose: () => void;
  onSend: (subject: string, message: string) => Promise<{ success: boolean; error?: string }>;
}

type EditorMode = "visual" | "code" | "preview";

interface CartItem {
  product: {
    id: number;
    title: string;
    slug: string;
    price: number;
    gallery: Array<{ path?: string; url?: string }>;
    store: {
      id: number;
      companyName: string;
      slug: string;
    };
  };
  quantity: number;
  total: number;
  details?: {
    dateStart?: string;
  };
}

interface EmailContent {
  titulo: string;
  saudacao: string;
  mensagem: string;
  textoBotao: string;
  mensagemAjuda: string;
}

function generateEmailHtml(cart: AbandonedCart, items: CartItem[], content: EmailContent): string {
  const itemsHtml = items.map((item) => {
    const firstImage = item.product.gallery?.[0];
    const imageUrl = firstImage?.url
      ? firstImage.url
      : firstImage?.path
        ? `https://api.fiestou.com.br/storage/${firstImage.path}`
        : "https://api.fiestou.com.br/images/placeholder-product.png";

    const productUrl = `https://www.fiestou.com.br/produto/${item.product.slug}`;
    const dateFormatted = item.details?.dateStart
      ? new Date(item.details.dateStart).toLocaleDateString("pt-BR")
      : null;

    return `
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid #e5e5e5;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="80" style="vertical-align: top;">
              <a href="${productUrl}" style="text-decoration: none;">
                <img src="${imageUrl}" alt="${item.product.title}" width="80" height="80" style="border-radius: 8px; object-fit: cover; border: 1px solid #e5e5e5;" />
              </a>
            </td>
            <td style="padding-left: 16px; vertical-align: top;">
              <a href="${productUrl}" style="color: #222; text-decoration: none; font-weight: 600; font-size: 15px; display: block; margin-bottom: 4px;">
                ${item.product.title}
              </a>
              <span style="color: #666; font-size: 13px; display: block;">
                ${item.product.store.companyName}
              </span>
              ${dateFormatted ? `<span style="color: #666; font-size: 13px; display: block; margin-top: 4px;">Data: ${dateFormatted}</span>` : ""}
              <span style="color: #666; font-size: 13px; display: block; margin-top: 4px;">
                Qtd: ${item.quantity} x R$ ${moneyFormat(item.product.price)}
              </span>
            </td>
            <td width="100" style="text-align: right; vertical-align: top;">
              <span style="font-weight: 700; color: #222; font-size: 16px;">
                R$ ${moneyFormat(item.total)}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f1f1; font-family: 'Helvetica Neue',Helvetica,Roboto,Arial,sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f1f1f1;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff;">
          <tr>
            <td style="background-color: #00a7eb; padding: 28px 36px; text-align: center; border-radius: 3px 3px 0 0;">
              <img src="https://api.fiestou.com.br/images/fiestou-logo-email.jpg" width="100" alt="Fiestou" style="display: inline-block;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 36px; text-align: center;">
              <h1 style="color: #222; margin: 0 0 24px 0; font-size: 22px; font-weight: 700;">${content.titulo}</h1>
              <p style="color: #222; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">${content.saudacao.replace('{nome}', `<strong>${cart.user_name}</strong>`)}</p>
              <p style="color: #222; font-size: 16px; line-height: 1.6; margin: 0 0 28px 0;">${content.mensagem}</p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9f9f9; border-radius: 8px; overflow: hidden; margin-bottom: 28px;">
                <tr>
                  <td style="background-color: #00a7eb; padding: 12px 16px;">
                    <span style="color: #ffffff; font-weight: 600; font-size: 14px;">Itens no seu carrinho</span>
                  </td>
                </tr>
                ${itemsHtml}
                <tr>
                  <td style="padding: 16px; background-color: #f0f0f0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-size: 16px; color: #222;"><strong>Total do carrinho:</strong></td>
                        <td style="text-align: right;"><span style="font-size: 20px; font-weight: 700; color: #00a7eb;">R$ ${moneyFormat(cart.total)}</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 10px 0 28px 0;">
                    <a href="https://www.fiestou.com.br/carrinho" style="display: inline-block; background-color: #00a7eb; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 700; font-size: 16px;">${content.textoBotao}</a>
                  </td>
                </tr>
              </table>
              <p style="color: #8a8a8a; font-size: 14px; line-height: 1.6; margin: 0;">${content.mensagemAjuda}</p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 20px 10px; font-size: 12px; color: #8a8a8a; line-height: 1.5; background-color: #f1f1f1;">
              <p style="margin: 12px 0;">Fiestou</p>
              <p style="margin: 12px 0;">Clicou, Marcou, Fiestou</p>
              <p style="margin: 12px 0;"><a href="https://www.fiestou.com.br" style="color: #8a8a8a;">www.fiestou.com.br</a></p>
              <p style="margin: 12px 0;">
                <a href="https://instagram.com/fiestou.oficial" style="display: inline-block; margin: 0 4px;"><img src="https://api.fiestou.com.br/images/icon-instagram.png" width="20" alt="Instagram" /></a>
                <a href="https://facebook.com/fiestou" style="display: inline-block; margin: 0 4px;"><img src="https://api.fiestou.com.br/images/icon-facebook.png" width="20" alt="Facebook" /></a>
                <a href="https://pinterest.com/fiestou" style="display: inline-block; margin: 0 4px;"><img src="https://api.fiestou.com.br/images/icon-pinterest.png" width="20" alt="Pinterest" /></a>
                <a href="https://tiktok.com/@fiestou" style="display: inline-block; margin: 0 4px;"><img src="https://api.fiestou.com.br/images/icon-tiktok.png" width="20" alt="TikTok" /></a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default function SendEmailModal({ cart, cartDetail, onClose, onSend }: Props) {
  const [subject, setSubject] = useState("Seus itens estão esperando no carrinho!");
  const [editorMode, setEditorMode] = useState<EditorMode>("visual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [htmlCode, setHtmlCode] = useState("");

  const [content, setContent] = useState<EmailContent>({
    titulo: "Esqueceu algo no carrinho?",
    saudacao: "Olá {nome},",
    mensagem: "Notamos que você deixou alguns itens esperando no seu carrinho. Eles ainda estão disponíveis e prontos para fazer a sua festa ser incrível!",
    textoBotao: "Finalizar minha compra",
    mensagemAjuda: "Precisa de ajuda? Responda este email ou entre em contato pelo WhatsApp.",
  });

  const items = useMemo(() => {
    return (cartDetail?.items || []) as CartItem[];
  }, [cartDetail?.items]);

  useEffect(() => {
    const html = generateEmailHtml(cart, items, content);
    setHtmlCode(html);
  }, [cart.id, cart.user_name, cart.total, items, content]);

  const handleContentChange = (field: keyof EmailContent, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalHtml = editorMode === "code" ? htmlCode : generateEmailHtml(cart, items, content);
    const result = await onSend(subject, finalHtml);

    setLoading(false);
    if (!result.success) {
      setError(result.error || "Erro ao enviar email");
    }
  };

  const getImageUrl = (item: CartItem) => {
    const firstImage = item.product.gallery?.[0];
    return firstImage?.url
      ? firstImage.url
      : firstImage?.path
        ? `https://api.fiestou.com.br/storage/${firstImage.path}`
        : "https://api.fiestou.com.br/images/placeholder-product.png";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="p-5 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Enviar Email Personalizado</h2>
              <p className="text-sm text-zinc-500 mt-1">
                Para: {cart.user_name} ({cart.user_email})
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg">
              <Icon icon="fa-times" className="text-zinc-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Assunto</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-zinc-700">Corpo do email</label>
                <div className="flex bg-zinc-100 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setEditorMode("visual")}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${editorMode === "visual" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                  >
                    <Icon icon="fa-pen" className="mr-1" />
                    Visual
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("code")}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${editorMode === "code" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                  >
                    <Icon icon="fa-code" className="mr-1" />
                    HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("preview")}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${editorMode === "preview" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                  >
                    <Icon icon="fa-eye" className="mr-1" />
                    Preview
                  </button>
                </div>
              </div>

              {editorMode === "visual" ? (
                <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: "#f1f1f1" }}>
                  <div className="bg-zinc-200 px-3 py-1.5 flex items-center gap-2 border-b">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs text-zinc-500 ml-2">Editor Visual - clique nos textos para editar</span>
                  </div>

                  <div style={{ padding: "20px 0", display: "flex", justifyContent: "center" }}>
                    <div style={{ maxWidth: 600, width: "100%", backgroundColor: "#fff" }}>
                      {/* Header */}
                      <div style={{ backgroundColor: "#00a7eb", padding: "28px 36px", textAlign: "center", borderRadius: "3px 3px 0 0" }}>
                        <img src="https://api.fiestou.com.br/images/fiestou-logo-email.jpg" width={100} alt="Fiestou" />
                      </div>

                      {/* Content */}
                      <div style={{ padding: "32px 36px", textAlign: "center" }}>
                        <input
                          type="text"
                          value={content.titulo}
                          onChange={(e) => handleContentChange("titulo", e.target.value)}
                          className="w-full text-center bg-transparent border-b-2 border-dashed border-blue-300 focus:border-blue-500 outline-none"
                          style={{ color: "#222", margin: "0 0 24px 0", fontSize: 22, fontWeight: 700 }}
                        />

                        <input
                          type="text"
                          value={content.saudacao}
                          onChange={(e) => handleContentChange("saudacao", e.target.value)}
                          className="w-full text-center bg-transparent border-b-2 border-dashed border-blue-300 focus:border-blue-500 outline-none"
                          style={{ color: "#222", fontSize: 16, lineHeight: 1.6, margin: "0 0 20px 0" }}
                          placeholder="Use {nome} para o nome do cliente"
                        />
                        <p className="text-xs text-blue-500 mb-4">Use {"{nome}"} para inserir o nome do cliente</p>

                        <textarea
                          value={content.mensagem}
                          onChange={(e) => handleContentChange("mensagem", e.target.value)}
                          className="w-full text-center bg-transparent border-2 border-dashed border-blue-300 focus:border-blue-500 outline-none rounded-lg p-2 resize-none"
                          style={{ color: "#222", fontSize: 16, lineHeight: 1.6, marginBottom: 28 }}
                          rows={3}
                        />

                        {/* Items */}
                        <div style={{ backgroundColor: "#f9f9f9", borderRadius: 8, overflow: "hidden", marginBottom: 28 }}>
                          <div style={{ backgroundColor: "#00a7eb", padding: "12px 16px" }}>
                            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Itens no seu carrinho</span>
                          </div>

                          {items.map((item, idx) => (
                            <div key={idx} style={{ padding: 16, borderBottom: "1px solid #e5e5e5", display: "flex", alignItems: "flex-start", gap: 16 }}>
                              <img
                                src={getImageUrl(item)}
                                alt={item.product.title}
                                width={80}
                                height={80}
                                style={{ borderRadius: 8, objectFit: "cover", border: "1px solid #e5e5e5" }}
                              />
                              <div style={{ flex: 1, textAlign: "left" }}>
                                <div style={{ color: "#222", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.product.title}</div>
                                <div style={{ color: "#666", fontSize: 13 }}>{item.product.store.companyName}</div>
                                {item.details?.dateStart && (
                                  <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
                                    Data: {new Date(item.details.dateStart).toLocaleDateString("pt-BR")}
                                  </div>
                                )}
                                <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
                                  Qtd: {item.quantity} x R$ {moneyFormat(item.product.price)}
                                </div>
                              </div>
                              <div style={{ fontWeight: 700, color: "#222", fontSize: 16 }}>R$ {moneyFormat(item.total)}</div>
                            </div>
                          ))}

                          <div style={{ padding: 16, backgroundColor: "#f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong style={{ color: "#222" }}>Total do carrinho:</strong>
                            <span style={{ fontSize: 20, fontWeight: 700, color: "#00a7eb" }}>R$ {moneyFormat(cart.total)}</span>
                          </div>
                        </div>

                        {/* Button */}
                        <div style={{ padding: "10px 0 28px 0" }}>
                          <input
                            type="text"
                            value={content.textoBotao}
                            onChange={(e) => handleContentChange("textoBotao", e.target.value)}
                            className="text-center bg-transparent border-b-2 border-dashed border-white focus:border-yellow-200 outline-none"
                            style={{
                              display: "inline-block",
                              backgroundColor: "#00a7eb",
                              color: "#fff",
                              padding: "14px 40px",
                              borderRadius: 6,
                              fontWeight: 700,
                              fontSize: 16,
                            }}
                          />
                        </div>

                        <input
                          type="text"
                          value={content.mensagemAjuda}
                          onChange={(e) => handleContentChange("mensagemAjuda", e.target.value)}
                          className="w-full text-center bg-transparent border-b-2 border-dashed border-blue-300 focus:border-blue-500 outline-none"
                          style={{ color: "#8a8a8a", fontSize: 14, lineHeight: 1.6 }}
                        />
                      </div>

                      {/* Footer */}
                      <div style={{ textAlign: "center", padding: "20px 10px", fontSize: 12, color: "#8a8a8a", lineHeight: 1.5, backgroundColor: "#f1f1f1" }}>
                        <p style={{ margin: "12px 0" }}>Fiestou</p>
                        <p style={{ margin: "12px 0" }}>Clicou, Marcou, Fiestou</p>
                        <p style={{ margin: "12px 0" }}>www.fiestou.com.br</p>
                        <p style={{ margin: "12px 0", display: "flex", justifyContent: "center", gap: 8 }}>
                          <img src="https://api.fiestou.com.br/images/icon-instagram.png" width={20} alt="Instagram" />
                          <img src="https://api.fiestou.com.br/images/icon-facebook.png" width={20} alt="Facebook" />
                          <img src="https://api.fiestou.com.br/images/icon-pinterest.png" width={20} alt="Pinterest" />
                          <img src="https://api.fiestou.com.br/images/icon-tiktok.png" width={20} alt="TikTok" />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : editorMode === "code" ? (
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  rows={18}
                  className="w-full border rounded-lg p-3 text-sm font-mono bg-zinc-900 text-green-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y leading-relaxed"
                  spellCheck={false}
                />
              ) : (
                <div className="border rounded-lg overflow-hidden bg-zinc-100">
                  <div className="bg-zinc-200 px-3 py-1.5 flex items-center gap-2 border-b">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs text-zinc-500 ml-2">Preview do Email</span>
                  </div>
                  <iframe
                    srcDoc={htmlCode}
                    className="w-full bg-white"
                    style={{ minHeight: "500px", border: "none" }}
                    title="Email Preview"
                  />
                </div>
              )}
            </div>

            <div className="bg-zinc-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-zinc-700 mb-3">
                <Icon icon="fa-shopping-cart" className="mr-2 text-zinc-400" />
                Resumo do carrinho:
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                <div>
                  <span className="text-zinc-500">Itens:</span> <span className="font-medium">{cart.items_count}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Total:</span> <span className="font-medium">R$ {moneyFormat(cart.total)}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Abandonado:</span> <span className="font-medium">{cart.hours_abandoned}h</span>
                </div>
              </div>
              {cart.notified_at && (
                <p className="mt-3 text-xs text-amber-600">
                  <Icon icon="fa-exclamation-triangle" className="mr-1" />
                  Cliente já notificado em: {cart.notified_at}
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                <Icon icon="fa-exclamation-circle" className="mr-2" />
                {error}
              </div>
            )}
          </div>

          <div className="p-5 border-t flex justify-end gap-3 bg-zinc-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-600 hover:bg-zinc-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Icon icon="fa-spinner" className="animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Icon icon="fa-paper-plane" />
                  Enviar Email
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
