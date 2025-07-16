<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SplitPayment extends Controller
{

    
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
    
    public function createRecipient()
    {
        $client = new Client();

        $response = $client->post(env('BASEURLPAGARME').'recipients', [
            'headers' => [
                'accept' => 'application/json',
                'content-type' => 'application/json',
                'authorization' => 'Basic ' . base64_encode(env('PAGARME_API_KEY') . ':'),
            ],
            'json' => [
                'name' => 'Nome do Recebedor',
                'email' => 'email@example.com',
                // outros dados exigidos pela Pagar.me
            ]
        ]);

        return json_decode($response->getBody(), true);
    }

    public function getSplitForOrder(int $orderId): array
    {
        $order = \App\Models\Order::with('store.owner.recipient', 'store.owner.recipient.config', 'store.owner.recipient.partners')->findOrFail($orderId);

        $total = $order->total * 100; // centavos
        $platform = $order->platformCommission * 100;

        $split = [];

        // Parte da plataforma ( AQUI LUCAS PODE COLOCAR OQUE FOR MELHOR VALOR FIXO OU DINAMICO  )
        $split[] = [
            'recipient_id' => config('services.pagarme.platform_recipient_id'), // ou fixo
            'amount' => intval($platform),
            'liable' => true,
            'charge_processing_fee' => true
        ];

        $storeRecipient = $order->store->owner->recipient;
        $storeAmount = $total - $platform;

        if ($storeRecipient->type_enum === 'PJ' && $storeRecipient->partners->count() > 0) {
            $qtd = $storeRecipient->partners->count() + 1;
            $share = intval(floor($storeAmount / $qtd));

            // Empresa
            $split[] = [
                'recipient_id' => $storeRecipient->pagarme_recipient_id,
                'amount' => $share,
                'liable' => true,
                'charge_processing_fee' => true
            ];

            // Sócios
            foreach ($storeRecipient->partners as $partner) {
                $split[] = [
                    'recipient_id' => $partner->pagarme_recipient_id,
                    'amount' => $share,
                    'liable' => false,
                    'charge_processing_fee' => false
                ];
            }
            $rest = $storeAmount - ($share * $qtd);
            if ($rest > 0) {
                $split[1]['amount'] += $rest;
            }
        } else {
            $split[] = [
                'recipient_id' => $storeRecipient->pagarme_recipient_id,
                'amount' => intval($storeAmount),
                'liable' => true,
                'charge_processing_fee' => true
            ];
        }

        return $split;
    }
}
