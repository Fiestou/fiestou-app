import Payment from "@/src/services/payment";
import { loadStripe } from "@stripe/stripe-js";

export default function Stripe() {
  const submitOrder = async (e: any) => {
    e.preventDefault();

    // console.log("submitOrder");

    const payment = new Payment();
    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );

    const checkoutSession: any = await payment.createSession({
      deliveryStatus: "",
      deliverySchedule: "",
      total: 0,
      status: -1,
      platformCommission: 0,
      listItems: [
        {
          product: {
            store: 1,
          },
          attributes: [],
          quantity: 1,
          total: 1,
        },
      ],
    });

    // console.log(checkoutSession);

    return true;

    if (!!checkoutSession?.session?.id) {
      const result = await stripe?.redirectToCheckout({
        sessionId: checkoutSession?.session.id,
      });

      // if (result?.error) {
      //   alert(result.error.message);
      // }
    }
  };

  return (
    <>
      <button
        onClick={(e) => submitOrder(e)}
        className="p-4 rounded font-semibold text-zinc-900 bg-yellow-300 w-full"
      >
        Carregar Stripe
      </button>
    </>
  );
}
