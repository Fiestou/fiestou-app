export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/entregador",
      permanent: false,
    },
  };
}

export default function AccessDeliveryRedirect() {
  return null;
}
