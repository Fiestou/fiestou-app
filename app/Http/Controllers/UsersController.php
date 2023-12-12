<?php

namespace App\Http\Controllers;

use DB;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ContentRel;
use Illuminate\Support\Facades\Mail;
use App\Mail\RegisterUser;
use App\Models\User;
use Illuminate\Support\Str;

class UsersController extends Controller
{
    public function GetUser(Request $request){

        if(!$request->has('ref')){
            $user = auth()->user();
            $user = User::where([ 'id' => $user->id ])
                        ->first();
        }
        else{
            $user = User::where([ 'id' => $request->get('ref') ])
                        ->orWhere([ 'email' => $request->get('ref') ])
                        ->orWhere([ 'hash' => $request->get('ref') ])
                        ->first();
        }

        $user->DetailsUp();

        return response()->json([
            'response'  => true,
            'data'      => $user
        ]);
    }

    public function ListUser(Request $request){

        $users = new User;

        if($request->has('filter')){
            foreach($request->filter as $flt){
                $users = $users->where($flt['key'], $flt['compare'], $flt['value']);
            }
        }

        $users = $users->get();

        foreach($users as $user){
            $user->DetailsUp();
        }

        return response()->json([
            'response'  => true,
            'data'      => $users
        ]);
    }

    public function SetRelationship(Request $request){

        $request->validate([
            'user' => 'required',
            'stores' => 'required'
        ]);

        $stores = is_array($request->get('stores')) ? $request->get('stores') : [$request->get('stores')];

        foreach ($stores as $key => $store) {

            $relationship = ContentRel::where('main_content_id', (int) $request->get('user'))
                                        ->where('secondary_content_id', (int) $store)
                                        ->where('type', 'store_client')
                                        ->first();

            if(!isset($relationship->id)){

                DB::beginTransaction();

                $relationship = new ContentRel;
                $relationship->main_content_id = (int) $request->get('user');
                $relationship->secondary_content_id = (int) $store;
                $relationship->type = "user_store";

                if(!$relationship->save()){
                    DB::rollback();
                }

                DB::commit();
            }
        }

        return response()->json([
            'response'  => true
        ]);
    }

    public function GetRelationship(Request $request){
        $request->validate([
            'key' => 'required',
            'value' => 'required',
            'type' => 'required'
        ]);

        $ids = ContentRel::where($request->get('key'), (int) $request->get('value'))
                                    ->where('type', $request->get('type'))
                                    ->pluck($request->get('key') == 'main_content_id' ? 'secondary_content_id' : 'main_content_id')
                                    ->toArray();

        $relationship = User::whereIn('id', $ids)
                            ->get();

        $users = [];

        foreach ($relationship as $key => $user) {
            $handle = [
                'name' => $user->name,
                'email' => $user->email,
                'date' => $user->date
            ];

            $users[] = array_merge($handle, json_decode($user->details, TRUE));
        }

        return response()->json([
            'response'  => true,
            'data' => $users
        ]);
    }

    public function PreRegister(Request $request){

        $request->validate([
            'email'     => "required|email",
            'person'    => "required"
        ]);

        $hash = $request->has('hash') ? $request->get('hash') : md5($request->get('email'));

        $user = User::where([ 'email' => $request->get('email') ])
                    ->orWhere(['hash' =>  $hash])
                    ->first();

        if(!isset($user->id)){
            $user = new User();
            $user->hash = $hash;
        }

        $user->RequestToThis($request);
        $user->RequestToDetails($request->all());

        $user->email    = $request->get('email');
        $user->name     = $request->has('name') ? $request->get('name') : $user->name ?? "";
        $user->login    = $request->has('email') ? $request->get('email') : $user->email ?? "";
        $user->type     = "user";
        $user->person   = $request->get('person');
        $user->status   = 0;

        if(!$user->save()){
            return response()->json([
                'response'  => false,
                'message'   => 'Erro ao salvar usuário'
            ], 500);
        }

        return response()->json([
            'response'  => true,
            'hash' => $user->hash,
        ]);
    }

    public function Register(Request $request)
    {
        $request->validate([
            'name'          => "required",
            'email'         => "required|email",
            'person'        => "required",
            'password'      => 'min:6|required_with:re_password|same:re_password',
            're_password'   => 'min:6'
        ]);

        $request = json_decode(json_encode($request->all()));

        unset($request->re_password);

        $user = new User;

        $m_user = User::where([ 'email' => $request->email ])->first();

        if(!isset($m_user->id)){
            $user->RequestToThis($request);
            $user->RequestToDetails($request);

            $user->name = $request->name;
            $user->hash = md5($request->email);
            $user->date = $request->date;
            $user->email = $request->email;
            $user->login = $request->email;
            $user->type = "user";
            $user->person = $request->person;
            $user->password = bcrypt( $request->password );
            $user->status   = 0;
        }

        try{

            $user->save();

        }catch(\Exception $e){
            return response()->json([
                'response'  => false,
                'message'   => 'Erro ao salvar usuário',
                'errors'    => $e->getMessage()
            ], 500);
        }

        return response()->json([
            'response'  => true,
            'user' => $user
        ]);
    }

    public function Update(Request $request)
    {
        $request->validate([
            'id' => "required"
        ]);

        $auth = auth()->user();

        $user = User::where([ 'id' => $request->get('id') ])->first();

        if((isset($user->id) && $auth->id == $user->id) || (isset($user->id) && $auth->person == "master")){
            $user->RequestToThis($request);
            $user->RequestToDetails($request->all());

            $user->hash = md5($user->email);
            $user->name = $request->has('name') ? $request->get('name') : $user->name;
            $user->date = $request->has('date') ? $request->get('date') : $user->date;
            $user->email = $request->has('email') ? $request->get('email') : $user->email;
            $user->login = $request->has('login') ? $request->get('email') : $user->email;
            $user->person = $request->has('person') ? $request->get('person') : $user->person;
            $user->status = $request->has('status') ? $request->get('status') : 1;

            try{
                $user->save();
            }
            catch(\Exception $e){
                return response()->json([
                    'response'  => false,
                    'message'   => 'Erro ao salvar usuário',
                    'errors'    => $e->getMessage()
                ], 500);
            }

            $user = User::where([ 'id' => $user->id ])->first();

            $user->DetailsUp();

            return response()->json([
                'response'  => true,
            ]);
        }

        return response()->json([
            'response'  => false,
            'message'   => 'Erro ao salvar usuário <--'
        ], 500);
    }

}
