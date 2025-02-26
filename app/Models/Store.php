<?php

namespace App\Models;

use App\Models\BaseModel;
use App\Models\User;
use App\Models\Media;

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
        "metadata",
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

    public function user()
    {
        return $this->belongsTo(User::class, 'user', 'id');
    }

    public static function normalize($stores = [])
    {
        if (!empty($stores)) {
            foreach ($stores as $store) {
                if ($store->profile) {
                    $profile = Media::find($store->profile);
                    if ($profile) {
                        $profile->details = json_decode($profile->details ?? '[]');
                    }
                    $store->profile = $profile;
                }

                if ($store->cover) {
                    $cover = Media::find($store->cover);
                    if ($cover) {
                        $cover->details = json_decode($cover->details ?? '[]');
                    }
                    $store->cover = $cover;
                }

                $store->openClose = json_decode($store->openClose ?? '[]');
                $store->metadata = json_decode($store->metadata ?? '[]');
            }

            return $stores;
        }

        return [];
    }
}