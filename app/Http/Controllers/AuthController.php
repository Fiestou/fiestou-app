<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ValidateUser;
use App\Mail\RegisterUser;
use Illuminate\Support\Facades\Redirect;
use Carbon\Carbon;
use JWTAuth;
use Auth;
use Hash;

use App\Models\User;
use App\Models\Store;

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

        $email  = strtolower(trim($request->email));
        $user   = User::where([
                            'email'     => $email,
                            'status'    => 1
                        ])
                        ->first();

        if(isset($user->id))
        {
            $store = Store::where("user", $user->id)
                          ->first();

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

    public function ValidateUser(Request $request){

        $this->validate($request, [
            'email' => 'required',
        ]);

        $user = User::where([ 'email' => $request->email ])->first();

        if(isset($user->id)){
            if(!!$request->status){
                // Mail::to($request->email)->queue((new RegisterUser(['user' => $user]))->onQueue('default'));
            }

            $user->status = $request->status;
        }

        if($user->save())
        {
            return response()->json([
                'response'  => true,
                'actor'     => $user
            ], 201);
        }

        return response()->json([
            'response'  => false
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

        return redirect()->away(env('APP_URL').'/acesso');
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

            if($user->save())
            {
                Mail::to($user->email)
                    ->queue(
                        (new ResetPassword([
                                'actor' => $user,
                                'token' => $token
                            ]))
                            ->onQueue('default')
                    );

                return response()->json([
                    'response' => true,
                    'token' => $token
                ]);
            }

            return response()->json([
                'response'      => false,
                'message'       => 'error_on_save_remember_token'
            ]);

        }

        return response()->json([
            'response'      => false,
            'message'       => 'actor_not_found'
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
