<?php

namespace App\Http\Controllers;

use DB;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Order;
use App\Models\User;
use App\Models\Store;
use App\Models\Suborder;
use App\Models\Product;
use App\Models\Message;

class OrdersController extends Controller
{
    public function Get(Request $request)
    {

        $request->validate([
            "id" => "required"
        ]);

        $user = auth()->user();

        $order = Order::where(['id' => $request->get('id'), "user" => $user->id])
            ->first();

        if (isset($order->id)) {

            $order->metadata = json_decode($order->metadata);
            $order->listItems = json_decode($order->listItems);
            $order->deliveryAddress = json_decode($order->deliveryAddress);

            $user = User::where(["id" => $order->user])->first();

            if (isset($user->id)) {
                $details = json_decode($user->details, TRUE);
                foreach ($details as $key => $value) {
                    $user->{$key} = $value;
                }
                unset($user->details);
            }

            $order->user = $user;

            $products = [];

            foreach ($order->listItems as $key => $item) {
                array_push($products, $item->product->id);
            }

            $products = Product::with(['store'])
                ->where(['status' => 1])
                ->whereIn('id', $products)
                ->get();

            $notificate = [];

            foreach ($products as $key => $item) {
                if (!isset($notificate[$item->store])) {
                    $store = Store::select(["user"])
                        ->where(["id" => $item->store])
                        ->first();

                    $user = User::select(["name", "email", "details"])
                        ->where(['id' => $store->user])
                        ->first();

                    if (isset($user->email)) {
                        $details = json_decode($user->details, TRUE);
                        if (isset($details['phone'])) {
                            $user->phone = $details['phone'];
                        }
                        unset($user->details);
                    }

                    $notificate[$item->store] = $user;
                }
            }

            $order->notificate = array_values($notificate);

            $products = Product::normalize($products);

            foreach ($products as $key => $product) {
                foreach ($order->listItems as $i => $item) {
                    if ($item->product->id == $product->id) {
                        unset($product->category);
                        unset($product->combinations);
                        unset($product->fragility);
                        unset($product->freeTax);

                        $item->product = $product;
                    }
                }
            }

            return response()->json([
                'response' => true,
                'data' => $order
            ]);
        }

        return response()->json([
            'response' => false
        ]);
    }

    public function List(Request $request)
    {
        $user = auth()->user();

        $orders = Order::with('userDetail')->orderBy('id', 'DESC');

        if ($user->person != "master") {
            $orders = $orders->where(["user" => $user->id]);
        }

        $orders = $orders->get();

        foreach ($orders as $key => $order) {
            $order->deliveryAddress = json_decode($order->deliveryAddress, true);
            $order->listItems = json_decode($order->listItems, true);
            $order->metadata = json_decode($order->metadata, true);
            $order->userName = $order->userDetail->name ?? 'Usuário não encontrado';
            $order->userEmail = $order->userDetail->email ?? 'Email não encontrado';
        
            $storeIds = [];
        
            if (!empty($order->listItems)) {
                foreach ($order->listItems as $item) {
                    if (isset($item['product']['store']['id'])) {
                        $storeIds[] = $item['product']['store']['id'];
                    }
                }
            }
        
            $order->storeId = !empty($storeIds) ? reset($storeIds) : null;
        
            if (!empty($order->storeId)) {
                $storeUserId = Store::where('id', $order->storeId)->value('user');                
                $order->partnerName = User::where('id', $storeUserId)->value('name') ?? 'Parceiro desconhecido';
                $order->partnerEmail = User::where('id', $storeUserId)->value('email') ?? 'Parceiro desconhecido';
            }        
        }     

        return response()->json([
            'response' => true,
            'data' => $orders
        ]);
    }

    public function getOrderById($id)
    {
        $order = Order::with('userDetail')->find($id);

        if (!$order) {
            return response()->json(['message' => 'Pedido não encontrado'], 404);
        }
        
        $listItems = json_decode($order->listItems, true) ?? [];

        $productIds = [];
        foreach ($listItems as $item) {
            if (isset($item['product']['id'])) {
                $productIds[] = $item['product']['id'];
            }
        }
        
        $products = Product::whereIn('id', $productIds)->get();
        $normalizedProducts = Product::normalize($products);
        
        $productsData = [];
        foreach ($listItems as $item) {
            if (isset($item['product']['id'])) {
                $productNormalized = collect($normalizedProducts)->firstWhere('id', $item['product']['id']);
                if ($productNormalized) {
                    $productsData[] = $productNormalized;
                }
            }
        }

        $storeIds = [];
        foreach ($listItems as $item) {
            if (isset($item['product']['store']['id'])) {
                $storeIds[] = $item['product']['store']['id'];
            }
        }

        $partnerName = 'Parceiro desconhecido';
        $partnerEmail = 'Parceiro desconhecido';
        
        if (!empty($storeIds)) {
            $storeId = reset($storeIds);
            $storeUserId = Store::where('id', $storeId)->value('user');
            
            if ($storeUserId) {
                $partner = User::find($storeUserId);
                $partnerName = $partner->name ?? $partnerName;
                $partnerEmail = $partner->email ?? $partnerEmail;
            }
        }

        $metadata = json_decode($order->metadata, true);

        if ($order->deliveryTo === 'reception') {
            $order->deliveryTo = 'Entregar na portaria';
        } elseif ($order->deliveryTo === 'door') {
            $order->deliveryTo = 'Deixar na porta';
        } else {
            $order->deliveryTo = 'Estarei para receber';
        }

        $paymentMethod = $metadata['payment_method'] ?? null;
        $installments = $metadata['installments'] ?? null;
        
        if ($paymentMethod === 'credit_card') {
            $paymentMethod = 'Cartão de crédito';
        } elseif ($paymentMethod === 'pix') {
            $paymentMethod = 'PIX';
        }
        
        $transformedMetadata = [
            'payment_method' => $paymentMethod,
            'installments' => $installments,
            'amount_total' => $metadata['amount_total'] ?? 0,
        ];
        
        $deliveryPrice = $order->deliveryPrice;

        if ($deliveryPrice === null) {
            $deliveryPrice = 'Não informado';
        } elseif ($deliveryPrice == 0) {
            $deliveryPrice = 'Gratuita';
        } elseif ($deliveryPrice > 0) {
            $deliveryPrice = number_format($deliveryPrice, 2, ',', '.');
        }

        return response()->json([
            'id' => $order->id,
            'user' => $order->userDetail,
            'metadata' => $transformedMetadata,
            'total' => $order->total,
            'deliveryStatus' => $order->deliveryStatus,
            'deliveryAddress' => $order->deliveryAddress,
            'deliverySchedule' => $order->deliverySchedule,
            'deliveryTo' => $order->deliveryTo,
            'deliveryPrice' => $deliveryPrice,
            'partnerName' => $partnerName,
            'partnerEmail' => $partnerEmail,
            'storeId' => $storeId ?? null,
            'productsData' => $productsData
        ]); 
    }

    public function Store(Request $request)
    {

        $user = auth()->user();

        $store = Store::where(["user" => $user->id])->first();

        $suborders = Suborder::with(["order"])
                            ->where(["store" => $store->id])
                            ->get();

        if ($suborders->isNotEmpty()) {
            $firstStore = $suborders->first()
                                    ->store ?? $store->id;
        } else {
            $firstStore = $store->id;
        }

        return response()->json([
            'response' => true,
            'data' => $suborders,
            'store' => $firstStore
        ]);
    }

    public function Register(Request $request)
    {
        $request->validate([
            "deliveryAddress" => "required",
            "listItems" => "required"
        ]);

        $listItems = $request->get("listItems");

        $user = auth()->user();

        $firstItem = $listItems[0] ?? null;
        $storeId = $firstItem['product']['store']['id'] ?? null;

        $order = new Order;
        $order->user = $user->id;
        $order->store = $storeId;
        $order->platformCommission = $request->get("platformCommission");
        $order->total = $request->get("total");
        $order->deliverySchedule = $request->get("deliverySchedule");
        $order->deliveryAddress = json_encode($request->get("deliveryAddress"));
        $order->deliveryStatus = $request->get("deliveryStatus");
        $order->deliveryTo = $request->get("deliveryTo") ?? "";
        $order->deliveryPrice = $request->get("deliveryPrice") ?? 0;
        $order->listItems = json_encode($listItems);
        $order->status = 0;

        DB::beginTransaction();

        if ($order->save()) {
            Message::RegisterOrder($order);

            $suborders = [];

            foreach ($request->get("listItems") as $key => $item) {
                $index = $item['product']['store']['id'];

                if (!isset($suborders[$index])) {
                    $suborders[$index] = [
                        "listItems" => [],
                        "total" => 0
                    ];
                }

                $suborders[$index]['listItems'][] = $item['product']['id'];
                $suborders[$index]['total'] += $item['total'];
            }

            foreach ($suborders as $key => $suborder) {
                $sub = new Suborder;
                $sub->store = $key;
                $sub->user = $user->id;
                $sub->order = $order->id;
                $sub->total = $suborder['total'];
                $sub->paying = $suborder['total'] - (($order->platformCommission / 100) * $suborder['total']);
                $sub->listItems = json_encode($suborder['listItems']);
                $sub->deliveryStatus = "pending";
                $sub->deliverySchedule = $order->deliverySchedule;
                $sub->deliveryTo = $order->deliveryTo;
                $sub->status = -1;
                $sub->save();
            }
        } else {

            DB::rollback();

            return response()->json([
                'response' => false
            ]);
        }

        DB::commit();

        return response()->json([
            'response' => true,
            'data' => $order
        ]);
    }

    public function Processing(Request $request)
    {

        $request->validate([
            "id" => "required"
        ]);

        $user = auth()->user();
        $order = Order::where(['id' => $request->get('id'), "user" => $user->id])
            ->first();

        if (isset($order->id)) {
            $order->status = -1;

            if ($order->save()) {
                return response()->json([
                    'response' => true
                ]);
            }
        }

        return response()->json([
            'response' => false
        ]);
    }

    public function RegisterMeta(Request $request)
    {

        $request->validate([
            "id" => "required",
            "metadata" => "required"
        ]);

        $user = auth()->user();

        $order = Order::where(['id' => $request->get('id'), "user" => $user->id])
            ->first();

        if (isset($order->id)) {
            $metadata = $request->get('metadata');
            $order->metadata = json_encode($metadata);

            if ($metadata['status'] == 'complete') {
                Message::CompleteOrderMail();
                Message::PartnerNewOrderMail();

                $order->status = 1;
                $order->deliveryStatus = 'processing';
                Suborder::where('order', $order->id)->update(['status' => 1, 'deliveryStatus' => 'processing']);
            } else {
                $order->status = 0;
                $order->deliveryStatus = 'pending';
                Suborder::where('order', $order->id)->update(['status' => 0, 'deliveryStatus' => 'pending']);
            }

            if ($order->save()) {

                return response()->json([
                    'response' => true
                ]);
            }
        }

        return response()->json([
            'response' => false
        ]);
    }
}