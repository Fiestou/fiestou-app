<?php

namespace App\Models;

use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\BaseModel;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $table = 'user';
    protected $fillable = [
        'id',
        'hash',
        'name',
        'login',
        'email',
        'password',
        'remember',
        'type',
        'person',
        'status',
        'date',
        'updated_at',
        'created_at'
    ];

    public function DetailsUp(){

        if(!isset($this->details)){
            $this->details = empty($this->details) ? json_encode([]) : $this->details;
        }

        $user = !!$this->details ? json_decode($this->details, TRUE) : [];

        if($user){
            foreach ($user as $key => $value){
                if($key != "id"){
                    if(is_string($value) || is_numeric($value) || is_bool($value)){
                        $this->{$key} = trim($value);
                    }
                    else{
                        $this->{$key} = $value;
                    }
                }
            }
        }

        unset($this->details);

        return $this;
    }

    public function RequestToThis($request){

        if(is_array($request)){
            $request = json_decode(json_encode($request));
        }

        foreach ($this->fillable as $key){
            if(isset($request->{$key}) && $key != "id"){

                if(is_string($request->{$key}) || is_numeric($request->{$key})){
                    $this->{$key} = trim($request->{$key});
                }

                if(is_array($request->{$key})){
                    $this->{$key} = json_encode($request->{$key});
                }
            }
        }

        return $this;
    }

    public function RequestToDetails($request){

        $content = [];

        if(!!$request){

            foreach ($request as $key => $value){
                if(!in_array($key, $this->fillable) && $key != "id"){
                    $content[$key] = $value;
                }
            }
        }

        $this->details = json_encode($content);

        return $this->details;
    }

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }
}







