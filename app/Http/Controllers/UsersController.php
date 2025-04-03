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
use App\Models\Message;

class UsersController extends Controller
{
    public function GetUser(Request $request){

        if(!$request->has('ref')){
            $user = auth()->user();
            $user = User::where([ 'id' => $user->id ]);
        }
        else{
            $user = User::where([ 'id' => $request->get('ref') ])
                        ->orWhere([ 'email' => $request->get('ref') ])
                        ->orWhere([ 'hash' => $request->get('ref') ]);
        }

        if($request->has('person')){
            $user = $user->where('person', $request->get('person'));
        }

        $user = $user->first();

        $user->DetailsUp();

        return response()->json([
            'response'  => true,
            'data'      => $user
        ]);
    }

    public function ListUser(Request $request){

        $users = new User;

        if($request->has('person')){
            $users = $users->where('person', $request->get('person'));
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

        $user->RequestToThis($request->all());
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

        $m_user = User::where([ 'email' => $request->email ])->first();

        if(!$m_user){
            $user = new User;

            $user->name = $request->name;
            $user->hash = md5($request->email);
            $user->email = $request->email;
            $user->login = $request->email;
            $user->type = "user";
            $user->person = $request->person;
            $user->password = bcrypt( $request->password );
            $user->remember = bcrypt( $request->password );
            $user->status   = 1;
        }

        try{
            if($user->save()){
                Message::RegisterUser( $user);
            }
         }
         catch(\Exception $e){
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
        $auth = auth()->user();

        if($auth->person == "master"){

            if(!$request->get('id')){
                return response()->json([
                    'response'  => false,
                    'message' => 'id required'
                ], 422);
            }

            $user = User::where([ 'id' => $request->get('id') ])->first();
        }
        else{
            $user = User::where([ 'id' => $auth->id ])->first();
        }

        if(isset($user->id)){

            if($request->has('origin') && $request->get('origin') == "complete"){
                $request->request->remove('origin');
                $user->status = 1;
            }

            $request->merge([
                'phone' => preg_replace('/\D/', '', $request->get('phone')),
                'cep'   => preg_replace('/\D/', '', $request->get('cep')),
            ]);
            
            $validator = \Validator::make($request->all(), [
                'phone' => ['nullable', 'regex:/^\d{10,11}$/'],
                'cep'   => ['nullable', 'regex:/^\d{8}$/'],
                'email' => ['nullable', 'email'],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'response' => false,
                    'message'  => 'Validation error',
                    'errors'   => $validator->errors(),
                ], 422);
            }

            $request->merge([
                'phone'   => preg_replace('/\D/', '', $request->get('phone')),
                'cep'     => preg_replace('/\D/', '', $request->get('cep')),
            ]);

            $user->RequestToThis($request->all());
            $user->RequestToDetails($request->all());

            $user->hash = md5($user->email);

            if($request->has('name'))
                $user->name = $request->get('name');

            if($request->has('date'))
                $user->date = $request->get('date');

            if($request->has('email'))
                $user->email = $request->get('email');

            if($request->has('login'))
                $user->login = $request->get('email');

            if($request->has('person'))
                $user->person = $request->get('person');

            if($request->has('status'))
                $user->status = $request->get('status');

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
                'data' => $user
            ]);
        }

        return response()->json([
            'response'  => false,
            'message'   => 'error user update'
        ], 500);
    }

    public function Complete(Request $request)
    {
        $auth = auth()->user();

        $user = User::where([ 'id' => $auth->id ])->first();

        if(isset($user->id)){

            $details = [];

            $user->hash = md5($user->email);

            if($request->has('name'))
                $user->name = $request->get('name');

            if($request->has('date'))
                $user->date = $request->get('date');

            if($request->has('email'))
                $user->email = $request->get('email');

            if($request->has('login'))
                $user->login = $request->get('email');

            if($request->has('person'))
                $user->person = $request->get('person');

            if($request->has('phone'))
                $details = $request->get('phone');

            try{

                $user->status = 1;
                $user->details = json_encode($details);

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

            $details['id'] = $user->id;
            $details['hash'] = $user->hash ?? md5($user->email);
            $details['name'] = $user->name;
            $details['email'] = $user->email;
            $details['type'] = $user->type;
            $details['person'] = $user->person;
            $details['status'] = $user->status;

            return response()->json([
                'response'  => true,
                'user'      => $details
            ]);
        }

        return response()->json([
            'response'  => false,
            'message'   => 'error user update'
        ], 500);
    }
}
