import Head from 'next/head';

export default function MetaPrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Política de Privacidade | Fiestou</title>
        <meta name="description" content="Política de Privacidade da Fiestou." />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://www.fiestou.com.br/meta/privacy-policy" />
      </Head>
      <main style={{maxWidth: 860, margin: '0 auto', padding: '40px 20px 64px', fontFamily: 'Arial, sans-serif', color: '#111827'}}>
        <h1 style={{fontSize: 32, marginBottom: 12}}>Política de Privacidade</h1>
        <p style={{color: '#6b7280'}}>Fiestou Tecnologia Ltda.</p>
        <p>Esta Política de Privacidade explica como a Fiestou coleta, utiliza, armazena e protege os dados pessoais de clientes, parceiros e visitantes da plataforma.</p>
        <h2 style={{fontSize: 20, marginTop: 32}}>1. Dados que podemos coletar</h2>
        <ul>
          <li>Nome completo, e-mail, telefone e endereço.</li>
          <li>Dados necessários para cadastro, compra, atendimento e entrega.</li>
          <li>Informações de navegação, dispositivo, IP e uso da plataforma.</li>
          <li>Dados de pagamento processados por parceiros autorizados.</li>
        </ul>
        <h2 style={{fontSize: 20, marginTop: 32}}>2. Como usamos os dados</h2>
        <ul>
          <li>Para criar e manter a conta do usuário.</li>
          <li>Para processar pedidos, pagamentos, entregas e suporte.</li>
          <li>Para prevenir fraude, abuso e falhas operacionais.</li>
          <li>Para melhorar a experiência na plataforma e cumprir obrigações legais.</li>
        </ul>
        <h2 style={{fontSize: 20, marginTop: 32}}>3. Compartilhamento</h2>
        <p>A Fiestou pode compartilhar dados com parceiros essenciais para a operação, como provedores de pagamento, logística, hospedagem, analytics, atendimento e cumprimento de obrigações legais.</p>
        <h2 style={{fontSize: 20, marginTop: 32}}>4. Cookies e tecnologias similares</h2>
        <p>Usamos cookies e tecnologias similares para segurança, funcionamento da plataforma, medição de uso e melhoria de experiência.</p>
        <h2 style={{fontSize: 20, marginTop: 32}}>5. Armazenamento e segurança</h2>
        <p>Adotamos medidas técnicas e administrativas razoáveis para proteger os dados pessoais contra acesso não autorizado, perda, alteração ou uso indevido.</p>
        <h2 style={{fontSize: 20, marginTop: 32}}>6. Direitos do titular</h2>
        <p>O titular pode solicitar acesso, correção, atualização ou exclusão de dados, observadas as hipóteses legais de retenção obrigatória.</p>
        <h2 style={{fontSize: 20, marginTop: 32}}>7. Exclusão de dados</h2>
        <p>Solicitações de exclusão podem ser feitas em <a href="https://www.fiestou.com.br/exclusao-de-dados">https://www.fiestou.com.br/exclusao-de-dados</a>.</p>
        <h2 style={{fontSize: 20, marginTop: 32}}>8. Contato</h2>
        <p>Para dúvidas sobre privacidade e proteção de dados, entre em contato pelo e-mail <a href="mailto:fiestoudev@gmail.com">fiestoudev@gmail.com</a>.</p>
      </main>
    </>
  );
}
