<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Models\Recipient;
use Illuminate\Support\Facades\Log;
use App\Models\RecipientAddress;
use App\Models\RecipientPhone;

class SplitPaymentController extends Controller
{
    public function showCode($storeId)
    {
        $recipient = Recipient::where('store_id', $storeId)->firstOrFail();
        return response()->json(['code' => $recipient->code]);
    }

    public function showRecipient($storeId)
    {
        Log::info('estou aqui asdasdas');
        $recipient = Recipient::where('store_id', $storeId)
            ->with(['addresses', 'phones', 'config', 'partners'])
            ->first();
        Log::info('Recipient details', ['recipient' => $recipient]);

        if (!$recipient) {
            return response()->json([
                'message' => 'Recipient não encontrado para essa loja.',
                'recipient' => null
            ], 404);
        }

        return response()->json([
            'recipient' => $recipient
        ]);
    }
    public function updateRecipient(Request $request, $id)
    {
        Log::info('Atualizando recebedor', ['id' => $id, 'request' => $request->all()]);

        try {
            $recipient = Recipient::with(['addresses', 'phones'])->findOrFail($id);

            // Preenche todos os campos que vierem no request e forem fillable
            $recipient->fill($request->all());

            if ($recipient->isDirty()) {
                $recipient->save();
            }

            // Atualiza o endereço se tiver ID válido
            if (!empty($request->address['id'])) {
                $address = RecipientAddress::where('id', $request->address['id'])
                    ->where('recipient_id', $recipient->id)
                    ->first();

                if ($address) {
                    $address->fill($request->address);
                    if ($address->isDirty()) {
                        $address->save();
                    }
                }
            }

            // Atualiza o telefone se tiver ID válido
            if (!empty($request->phone['id'])) {
                $phone = RecipientPhone::where('id', $request->phone['id'])
                    ->where('recipient_id', $recipient->id)
                    ->first();

                if ($phone) {
                    $phone->fill($request->phone);
                    if ($phone->isDirty()) {
                        $phone->save();
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Dados atualizados com sucesso!',
                'recipient' => $recipient->fresh(['addresses', 'phones']),
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao atualizar recebedor', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar os dados.',
            ], 500);
        }
    }

    public function criarPedido(Request $request)
    {
        $orderId = $request->order_id;
        $split = $this->getSplitForOrder($orderId);

        $data = [
            "items" => [
                [
                    "amount" => $request->amount,
                    "description" => $request->description,
                    "quantity" => 1,
                    "code" => "item-01"
                ]
            ],
            "payments" => [
                [
                    "payment_method" => "credit_card",
                    "credit_card" => [
                        "installments" => 1,
                        "statement_descriptor" => "MinhaLoja",
                        "card" => [
                            "number" => $request->card_number,
                            "exp_month" => $request->card_exp_month,
                            "exp_year" => $request->card_exp_year,
                            "cvv" => $request->card_cvv,
                            "holder_name" => $request->card_holder
                        ]
                    ],
                    "split" => $split
                ]
            ]
        ];

        $response = Http::withToken(env('PAGARME_SECRET_KEY'))
            ->post(env('PAGARME_API_URL') . '/orders', $data);

        return response()->json($response->json(), $response->status());
    }

    public function cadastrarRecebedorPF($storeId)
    {
        $recipients = Recipient::with(['phones', 'addresses'])
            ->where('store_id', $storeId)
            ->whereNull('code') // só os que ainda não têm "code"
            ->get();

        if ($recipients->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Nenhum recebedor válido encontrado.'], 404);
        }

        $results = [];

        foreach ($recipients as $recipient) {
            if (
                !$recipient->name || !$recipient->email || !$recipient->document ||
                !$recipient->birth_date || !$recipient->monthly_income || !$recipient->professional_occupation
            ) {
                $results[] = [
                    'recipient_id' => $recipient->id,
                    'status' => 'erro',
                    'mensagem' => 'Dados pessoais incompletos.'
                ];
                continue;
            }

            if ($recipient->phones->isEmpty() || !$recipient->phones[0]->area_code || !$recipient->phones[0]->number) {
                $results[] = [
                    'recipient_id' => $recipient->id,
                    'status' => 'erro',
                    'mensagem' => 'Telefone não preenchido.'
                ];
                continue;
            }

            if ($recipient->addresses->isEmpty() || !$recipient->addresses[0]->street || !$recipient->addresses[0]->zip_code) {
                $results[] = [
                    'recipient_id' => $recipient->id,
                    'status' => 'erro',
                    'mensagem' => 'Endereço não preenchido.'
                ];
                continue;
            }

            $bankAccount = Withdraw::where('store', $recipient->store_id)
                ->orderByDesc('id')
                ->first()?->bankAccount;

            if (!$bankAccount) {
                $results[] = [
                    'recipient_id' => $recipient->id,
                    'status' => 'erro',
                    'mensagem' => 'Dados bancários não encontrados.'
                ];
                continue;
            }

            $bankData = json_decode($bankAccount, true);

            $data = [
                'code' => uniqid('rc_'),
                'register_information' => [
                    'phone_numbers' => [
                        [
                            'ddd' => $recipient->phones[0]->area_code,
                            'number' => $recipient->phones[0]->number,
                            'type' => 'mobile'
                        ]
                    ],
                    'address' => [
                        'street' => $recipient->addresses[0]->street,
                        'complementary' => $recipient->addresses[0]->complementary,
                        'street_number' => $recipient->addresses[0]->street_number,
                        'neighborhood' => $recipient->addresses[0]->neighborhood,
                        'city' => $recipient->addresses[0]->city,
                        'state' => $recipient->addresses[0]->state,
                        'zip_code' => $recipient->addresses[0]->zip_code,
                        'reference_point' => $recipient->addresses[0]->reference_point,
                    ],
                    'name' => $recipient->name,
                    'email' => $recipient->email,
                    'document' => $recipient->document,
                    'type' => 'individual',
                    'mother_name' => 'Não informado',
                    'birthdate' => $recipient->birth_date,
                    'monthly_income' => $recipient->monthly_income,
                    'professional_occupation' => $recipient->professional_occupation,
                ],
                'default_bank_account' => [
                    'holder_name' => $bankData['title'] ?? $recipient->name,
                    'holder_type' => 'individual',
                    'holder_document' => $recipient->document,
                    'bank' => $bankData['bank'],
                    'branch_number' => $bankData['agence'] ?? $bankData['branch_number'] ?? '0001',
                    'branch_check_digit' => $bankData['branch_digit'] ?? '0',
                    'account_number' => $bankData['accountNumber'] ?? $bankData['account_number'],
                    'account_check_digit' => $bankData['account_digit'] ?? '0',
                    'type' => 'checking',
                ],
                'transfer_settings' => [
                    'transfer_enabled' => true,
                    'transfer_interval' => 'monthly',
                    'transfer_day' => 15
                ],
                'automatic_anticipation_settings' => [
                    'enabled' => true,
                    'type' => 'full',
                    'volume_percentage' => 50
                ]
            ];

            $response = Http::withToken(env('PAGARME_SECRET_KEY'))
                ->post(env('PAGARME_API') . '/recipients', $data);

            if ($response->failed()) {
                $results[] = [
                    'recipient_id' => $recipient->id,
                    'status' => 'erro',
                    'mensagem' => 'Erro na criação via API',
                    'erro_api' => $response->json()
                ];
                continue;
            }

            $recipientApi = $response->json();
            $recipient->update(['code' => $recipientApi['code']]);

            $results[] = [
                'recipient_id' => $recipient->id,
                'status' => 'sucesso',
                'pagarme_id' => $recipientApi['id'],
                'code' => $recipientApi['code']
            ];
        }

        return response()->json([
            'success' => true,
            'processados' => count($results),
            'resultados' => $results
        ]);
    }

    
    public function getSplitForOrder(int $orderId): array
    {
        $order = Order::with('store.owner.recipient', 'store.owner.recipient.config', 'store.owner.recipient.partners')->findOrFail($orderId);

        $split = [];

        $split[] = [
            'recipient_id' => env('PAGAR_ME_RECEBEDOR_PADRAO'),
            'amount' => intval(($order->total * ($order->platformCommission / 100)) * 100),
            'liable' => true,
            'charge_processing_fee' => true
        ];

        // Agrupar itens por loja
        $listItems = json_decode($order->listItems);
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
        $recipients = Recipient::with('partners')->whereIn('store_id', $storeIds)->get();

        foreach ($recipients as $recipient) {
            $group = $groupedTotals->firstWhere('store_id', $recipient->store_id);

            if (!$group) {
                continue;
            }

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
