import Head from 'next/head';

export default function MetaTermsOfService() {
  return (
    <>
      <Head>
        <title>Termos de Serviço | Fiestou</title>
        <meta name="description" content="Termos de Serviço da Fiestou." />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://www.fiestou.com.br/meta/terms-of-service" />
      </Head>
      <main style={{maxWidth: 860, margin: '0 auto', padding: '40px 20px 64px', fontFamily: 'Arial, sans-serif', color: '#111827'}}>
        <h1 style={{fontSize: 32, marginBottom: 12}}>Termos de Serviço</h1>
        <p style={{color: '#6b7280'}}>Fiestou Tecnologia Ltda.</p>
        <p>Ao acessar e utilizar a plataforma Fiestou, o usuário concorda com estes Termos de Serviço.</p>
        <h2 style={{fontSize: 20, marginTop: 32}}>1. Uso da plataforma</h2>
        <p>A Fiestou conecta clientes e parceiros para divulgação, contratação, pagamento e operação de produtos, serviços e locações relacionados a festas e eventos.</p>
        <h2 style={{fontSize: 20, marginTop: 32}}>2. Responsabilidades</h2>
        <p>Cada usuário deve fornecer informações verdadeiras, manter seus acessos protegidos e utilizar a plataforma de forma lícita.</p>
        <h2 style={{fontSize: 20, marginTop: 32}}>3. Pedidos e pagamentos</h2>
        <p>Pedidos, pagamentos, cancelamentos e regras específicas podem depender do produto, parceiro, prazo e políticas aplicáveis no momento da contratação.</p>
        <h2 style={{fontSize: 20, marginTop: 32}}>4. Propriedade intelectual</h2>
        <p>Marca, identidade visual, conteúdo institucional e tecnologia da Fiestou não podem ser reproduzidos sem autorização.</p>
        <h2 style={{fontSize: 20, marginTop: 32}}>5. Contato</h2>
        <p>Dúvidas podem ser enviadas para <a href="mailto:fiestoudev@gmail.com">fiestoudev@gmail.com</a>.</p>
      </main>
    </>
  );
}
