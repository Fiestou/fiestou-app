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

        $response = $client->post(env('PAGAR_ME_BASE_URL').'recipients', [
            'headers' => [
                'accept' => 'application/json',
                'content-type' => 'application/json',
                'authorization' => 'Basic ' . base64_encode(env('PAGAR_ME_PUBLIC_KEY') . ':'),
            ],
            'json' => [
                'name' => 'Nome do Recebedor',
                'email' => 'email@example.com',
                // outros dados exigidos pela Pagar.me
            ]
        ]);

        return json_decode($response->getBody(), true);
    }

    // Este método cria o objeto de Split com as configurações corretas conforme o pedido (Order).
    public function getSplitForOrder(int $orderId): array
    {
        $order = \App\Models\Order::with('store.owner.recipient', 'store.owner.recipient.config', 'store.owner.recipient.partners')->findOrFail($orderId);

        $split = [];

        // Adicionar o Pedro como o primeiro recebedor do Split
        // Ele é o responsável pela transação e pelas taxas
        // Na documentação da Paga.me exige que a transação não contenha centavos. Então esta multiplicação por 100 faz isso. O mesmo serve para Total e para a Comissão
        // O valor do pedro é o valor Total do pedido, multiplicado pelo percentual de comissão do pedido multiplicado por 100 para remover os centavos
        $split[] = [
            'recipient_id' => env('PAGAR_ME_RECEBEDOR_PADRAO'),// Recebedor PEDRO pego do Painel da Pagar.Me.
            'amount' => intval(($order->total * ($order->platformCommission/100)) * 100),
            'liable' => true,
            'charge_processing_fee' => true
        ];

        // Obtemos a lista de itens do pedido (Order)
        $listItems = json_decode($order->listItems);

        // Agrupar por store.id e somar total por grupo
        $groupedTotals = collect($listItems)
            ->groupBy('product.store.id')
            ->map(function ($items, $storeId) {
                return [
                    'store_id' => (int) $storeId,
                    'store' => $items->first()->product->store,
                    'total' => collect($items)->sum('total'),
                ];
            })
            ->values();

        $storeIds = $groupedTotals->pluck('store_id');
        $recipients = Recipient::whereIn('store_id', $storeIds)->get();

        // Cada recipiente será percorrido para obter-se o recipient_id e o seu valor total acumulado do pedido multiplicado por 100 para remover os centavos
        foreach ($recipient as $recipients)
        {
            $group = $groupedTotals->firstWhere('store_id', $recipient->store_id);

            $qtd = $storeRecipient->partners->count() + 1;
            $share = intval(floor($storeAmount / $qtd));

            // Empresa
            $split[] = [
                'recipient_id' => $recipient->code,
                'amount' => intval($group['total'] * 100),
                'liable' => false,
                'charge_processing_fee' => false
            ];
        }

        return $split;
    }
}
