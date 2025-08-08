<?php

namespace App\Http\Controllers;
use App\Models\Element;
use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ValidateUser;
use App\Mail\RegisterUser;
use App\Models\Category;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use JWTAuth;
use Auth;
use Hash;

use App\Models\User;
use App\Models\Message;
use App\Models\Store;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
  public function Login(Request $request)
{
    $request->validate([
        'email'         => 'required|email',
        'password'      => 'required'
    ]);
    Log::info('Login - Realizado com sucesso');
    $email  = strtolower(trim($request->email));
    $user   = User::where([
                        'email'     => $email,
                        'status'    => 1
                    ])
                    ->first();

                    
    Log::info('Login - Usuário encontrado', ['user' => $user]);


    if(isset($user->id))
    {
        $store = Store::where("user", $user->id)->first();

        if ($user->person === 'partner') {
            $store = Store::where("user", $user->id)->first();
            if (!$store) {  
                return response()->json([
                    'response' => false,
                    'message' => 'loja não encontrada'
                ], 404);
            }
        }

    $credentials = request(['email', 'password']);
    
    if(!$token = auth()->attempt($credentials))
    {
        return response()->json([
            'response'  => false,
            'message'   => 'email_or_password_invalid',
        ]);
    }

    $details = !!$user->details ? json_decode($user->details, TRUE) : [];

    if(!!$user->details){

        $details['id'] = $user->id;
        $details['hash'] = $user->hash ?? md5($user->email);
        $details['name'] = $user->name;
        $details['email'] = $user->email;
        $details['type'] = $user->type;
        $details['person'] = $user->person;
        $details['status'] = $user->status;

        $user = $details;
    }

    Log::info('Login - Usuário retornado', ['user' => $user]);

    return response()->json([
        'response'      => true,
        'token'         => $token,
        'user'          => $user,
        'store'         => isset($store->id) ? $store->id : NULL
    ]);
    }

    return response()->json([
        'response'  => false,
        'message'   => 'email_or_password_invalid'
    ]);
}

    public function ExternalAuth(Request $request){

        $request->validate([
            'email' => 'required|email'
        ]);

        $auth_hash = date("Y-m-d|H:i:s");

        $email  = strtolower(trim($request->get('email')));

        if(!User::where([ 'email' => $email ])->count()){
            $user = new User;

            $user->name = $request->has('name') ? $request->get('name') : "";
            $user->hash = md5($email);
            $user->email    = $email;
            $user->login    = $email;
            $user->type     = "user";
            $user->person   = "client";
            $user->password = bcrypt($auth_hash);
            $user->details  = json_encode([]);
            $user->status   = 0;

            if($user->save()){
                Message::RegisterUser($user);
            }
        }

        $user = User::where(['email' => $email])->first();

        if(isset($user->id))
        {
            $user->remember = $user->password;
            $user->password = bcrypt($auth_hash);
            $user->save();

            $credentials = [
                'email'     => $request->get('email'),
                'password'  => $auth_hash
            ];

            if(!$token = auth()->attempt($credentials))
            {
                return response()->json([
                    'response'  => false,
                    'message'   => 'email_or_password_invalid',
                ]);
            }

            $store = Store::where("user", $user->id)
                          ->first();

            $details = !!$user->details ? json_decode($user->details, TRUE) : [];

            $details['id']      = $user->id;
            $details['hash']    = $user->hash ?? md5($user->email);
            $details['name']    = $user->name;
            $details['email']   = $user->email;
            $details['type']    = $user->type;
            $details['person']  = $user->person;
            $details['status']  = $user->status;

            $user = $details;

            return response()->json([
                'response'  => true,
                'token'     => $token,
                'user'      => $user,
                'store'     => isset($store->id) ? $store->id : NULL
            ]);
        }

        return response()->json([
            'response'  => false,
            'message'   => 'email_or_password_invalid'
        ]);
    }
    
    public function GetPreRegisterData(string $hash) {
        
        $user = User::where('hash', $hash)->first();

        if (!$user) {
            return response()->json(['response' => false, 'message' => 'Hash inválido'], 404);
        }
        
        $segmentGroup = Group::where('segment', '1')->first();
        $elementsForSelect = [];
    
        if ($segmentGroup) {
            $elements = Category::where('group_id', $segmentGroup->id)->get();
            foreach ($elements as $element) {
                $elementsForSelect[] = [
                    'id' => $element->id,
                    'name' => $element->name,
                    'icon' => $element->icon,
                ];
            }
        } else {
            Log::warning('Nenhum grupo com segmento 1 encontrado.');
        }
        Log::info('GetPreRegisterDataElements', ['user' => $elementsForSelect]);

        return response()->json([
            'response' => true,
            'categories' => $elementsForSelect,
            'preUser' => $user->only(['email','name','details']), // Renomeei para preUser para clareza
        ]);
    }

    public function ValidateUser(Request $request){

        $this->validate($request, [
            'email' => 'required',
        ]);

        $user = User::where(['email' => $request->get('email')])->first();

        if (isset($user->id)) {
            if ($request->has('status')) {
                $user->status = $request->get('status');
            }

            try {
                if ($user->save()) {
                    DB::table('store')
                      ->where('user', $user->id)
                      ->update(['status' => $user->status]);

                    return response()->json([
                        'response' => true,
                        'data' => $user
                    ], 200);
                }
            } catch (\Exception $e) {
                return response()->json([
                    'response' => false,
                    'message' => 'Erro ao salvar usuário',
                    'errors' => $e->getMessage()
                ], 500);
            }
        }

        return response()->json([
            'response' => false
        ], 422);
    }

    public function ActiveUser(Request $request){

        $this->validate($request, [
            'token' => 'required',
        ]);

        $user = User::where([ 'hash' => $request->token ])->first();

        if(isset($user->id)){
            $user->status = 1;
            $user->save();
        }

        return redirect()->away(env('CLIENT_URL').'/acesso');
    }

    public function CheckIn(Request $request)
    {
        $request->validate([
            'ref' => 'required'
        ]);

        $user = User::where([ 'email' => $request->ref ])->orWhere(['hash' => $request->ref])->first();

        if(isset($user->id)){

            $user->details = $user->details ? json_decode($user->details, true) : [];

            return response()->json([
                'response'  => true,
                'user' => [
                    'hash' => $user->hash,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => isset($user->details["phone"]) ? $user->details["phone"] : "",
                    'person' => $user->person,
                    'status' => $user->status
                ],
                'redirect' => '/login',
            ], 200);
        }
        else{

            return response()->json([
                'response'  => true,
                'redirect' => '/cadastre-se',
            ], 200);
        }
    }

    public function Recovery(Request $request)
    {
        $this->validate($request, [
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        if($user)
        {
            $token = md5(Carbon::now()->timestamp);

            $details = $user->details ? json_decode($user->details, TRUE) : [];
            $details['remember_token'] = $token;
            $user->details = json_encode($details);
            $user->status = 1;

            if($user->save()){
                return Message::RecoveryUser($user, $token);
            }

            return response()->json([
                'response'      => false,
                'message'       => 'error_on_save_remember_token'
            ]);

        }

        return response()->json([
            'response'      => true,
            'message'       => 'actor_not_found'
        ]);
    }

    public function Redefine(Request $request){

        $request->validate([
            'email'     => 'required|email',
            'token'     => 'required',
            'password'  => 'required',
            'repeat'    => 'required|same:password'
        ], [
            'repeat.same' => 'error_repeat',
        ]);

        $user = User::where('email', $request->get("email"))->first();

        if($user)
        {
            $details = $user->details ? json_decode($user->details, TRUE) : [];

            if($details['remember_token'] == $request->get("token")){
                unset($details['remember_token']);

                $password = bcrypt($request->get("password"));
                $user->password = $password;
                $user->remember = $password;
                $user->details = json_encode($details);

                if($user->save()){

                    return response()->json([
                        'response' => true
                    ]);
                }
            }
        }

        return response()->json([
            'response'      => false,
            'message'       => 'error'
        ]);
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function Me()
    {
        return response()->json(auth()->user());
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function Logout()
    {
        auth()->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function Refresh()
    {
        return $this->respondWithToken(auth()->refresh());
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function RespondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60
        ]);
    }
}
