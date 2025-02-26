<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BaseModel extends Model
{
    public function RequestToThis($request){
        if($this->fillable){
            foreach ($this->fillable as $key){
                if(isset($request->{$key}) && $key != "id"){
                    if(is_array($request->get($key))){
                        $this->{$key} = json_encode($request->get($key));
                    }
                    else{
                        $this->{$key} = trim($request->get($key));
                    }
                }
            }
        }

        return $this;
    }
}







