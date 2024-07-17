<?php

namespace App\Models;

use Illuminate\Support\Arr;
use App\Models\BaseModel;
use Illuminate\Support\Str;
use DB;

class Store extends BaseModel
{
    protected $table = 'store';
    protected $fillable = [
        "id",
        "user",
        "title",
        "slug",
        "companyName",
        "document",
        "description",
        "cover",
        "profile",
        "openClose",
        "segment",
        "hasDelivery",
        "meta",
        "zipCode",
        "street",
        "number",
        "neighborhood",
        "complement",
        "city",
        "state",
        "country",
        "status",
        "created_at",
        "updated_at"
    ];

    public static function normalize($stores = []){
        if(!empty($stores)){
            foreach ($stores as $key => $store) {
                if($store->profile){
                    $profile = Media::where('id', $store->profile)->first();

                    if($profile){
                        $profile->details = isset($profile->details) && !!$profile->details ? json_decode($profile->details) : [];
                    }

                    $store->profile = $profile;
                }

                if($store->cover){
                    $cover = Media::where('id', $store->cover)->first();

                    if($cover){
                        $cover->details = isset($cover->details) && !!$cover->details ? json_decode($cover->details) : [];
                    }

                    $store->cover = $cover;
                }

                $store->openClose   = !!$store->openClose   ? json_decode($store->openClose)    : [];
                $store->metadata    = !!$store->metadata    ? json_decode($store->metadata)     : [];
            }

            return $stores;
        }

        return [];
    }
}
