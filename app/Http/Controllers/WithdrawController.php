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
    public function Get(Request $request){}

    public function Register(Request $request){

        $request->validate([
            'bankAccount' => 'required',
            'value' => 'required',
            'code' => 'required'
        ]);

        $user = auth()->user();

        $store = Store::where(["user" => $user->id])
                      ->first();

        $payments   = Suborder::where(['store' => $store->id, 'status' => 1])->sum('total');
        $withdraw   = Withdraw::where(['store' => $store->id, 'status' => 1])->sum('value');

        $cash = $payments - $withdraw;

        if(!!Withdraw::where(['status' => 0])->count()){
            return response()->json([
                'response'  => false,
                'message'   => "recent_request"
            ]);
        }
        else if($cash < 10){
            return response()->json([
                'response'  => false,
                'message'   => "no_min_cash"
            ]);
        }
        else if($cash < $request->get('value')){
            return response()->json([
                'response'  => false,
                'message'   => "no_cash"
            ]);
        }
        else{

            $withdraw = new Withdraw;
            $withdraw->store = $store->id;
            $withdraw->code = $request->get('code');
            $withdraw->bankAccount = $request->get('bankAccount');
            $withdraw->value = $request->get('value');
            $withdraw->status = 0;

            DB::beginTransaction();

            if(!$withdraw->save()){
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

    public function List(Request $request){

        $user = auth()->user();

        if($user->person == "master"){
            $withdraw = Withdraw::orderBy('id', 'desc')->get();
        }
        else{

            $store = Store::where(["user" => $user->id])
                          ->first();

            if(!isset($store->id)){
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
