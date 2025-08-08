<?php

namespace App\Http\Controllers;

use DB;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Withdraw;
use App\Models\User;
use App\Models\Store;
use App\Models\Suborder;

class WithdrawController extends Controller
{
    public function Get(Request $request)
    {

        $request->validate([
            'slug' => 'required',
        ]);

        $withdraw = Withdraw::where(['code' => $request->get("slug")])->first();

        $store  = Store::where(['id' => $withdraw->store])->first();
        $user   = User::where(['id' => $store->user])->first();

        $user->store = $store;
        $user->details = json_decode($user->details);

        unset($user->details->profile);
        unset($user->details->bankAccounts);
        unset($user->store->openClose);

        $withdraw->bankAccount = !!$withdraw->bankAccount ? json_decode($withdraw->bankAccount) : [];

        return response()->json([
            'response'  => true,
            'data'      => [
                    "partner" => $user,
                    "withdraw" => $withdraw
                ]
        ]);
    }


    public function listSplitWithdraws(Request $request, $storeId)
    {
        try {
            $withdraws = DB::table('withdraws')
                ->where('store', $storeId)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $withdraws
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar os saques.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function Register(Request $request)
    {

        $request->validate([
            'bankAccount'   => 'required',
            'value'         => 'required',
            'code'          => 'required'
        ]);

        $user = auth()->user();
        $store = Store::where(["user" => $user->id])
                      ->first();

        $payments   = Suborder::where(['store' => $store->id, 'status' => 1])->sum('total');
        $withdraw   = Withdraw::where(['store' => $store->id, 'status' => 1])->sum('value');

        $cash = $payments - $withdraw;

        if (!!Withdraw::where(['status' => 0])->count()) {
            return response()->json([
                'response'  => false,
                'message'   => "recent_request"
            ]);
        } elseif ($cash < 10) {
            return response()->json([
                'response'  => false,
                'message'   => "no_min_cash"
            ]);
        } elseif ($cash < $request->get('value')) {
            return response()->json([
                'response'  => false,
                'message'   => "no_cash"
            ]);
        } else {

            $withdraw = new Withdraw();
            $withdraw->store = $store->id;
            $withdraw->code = $request->get('code');
            $withdraw->bankAccount = $request->get('bankAccount');
            $withdraw->value = $request->get('value');
            $withdraw->status = 0;

            DB::beginTransaction();

            if (!$withdraw->save()) {
                DB::rollback();

                return response()->json([
                    'response'  => false
                ]);
            }

            DB::commit();

            return response()->json([
                'response'  => true,
                'data'      => $withdraw
            ]);
        }
    }

    public function Update(Request $request)
    {

        $request->validate([
            'code' => 'required',
            'status' => 'required'
        ]);

        $withdraw = Withdraw::where(['code' => $request->get("code")])->first();
        $withdraw->status = $request->get("status");

        if ($request->has("bankAccount")) {
            $withdraw->bankAccount = json_encode($request->get("bankAccount"));
        }

        $withdraw->save();

        return response()->json([
            'response'  => true,
            'data'      => $withdraw
        ]);
    }

    public function List(Request $request)
    {

        $user = auth()->user();

        if ($user->person == "master") {
            $withdraw = Withdraw::orderBy('id', 'desc')->get();
        } else {

            $store = Store::where(["user" => $user->id])
                          ->first();

            if (!isset($store->id)) {
                return response()->json([
                    'response'  => false
                ]);
            }

            $withdraw = Withdraw::where(["store" => $store->id])
                                ->orderBy('id', 'desc')
                                ->get();
        }

        foreach ($withdraw as $key => $with) {
            $with->bankAccount = json_decode($with->bankAccount);
        }

        return response()->json([
            'response'  => true,
            'data'      => $withdraw,
        ]);
    }
}
