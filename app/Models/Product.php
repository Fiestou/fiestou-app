<?php

namespace App\Models;

use Illuminate\Support\Arr;
use App\Models\BaseModel;
use App\Models\Store;
use App\Models\Media;
use App\Models\Category;
use App\Models\Comments;
use Illuminate\Support\Str;
use DB;

class Product extends BaseModel
{
    protected $table = 'product';
    protected $fillable = [
        'id',
        'store',
        'title',
        'slug',
        'sku',
        'code',
        'subtitle',
        'description',
        'gallery',
        'price',
        'priceSale',
        'quantityType',
        'quantity',
        'availability',
        'unavailable',
        'weight',
        'length',
        'width',
        'height',
        'attributes',
        'tags',
        'category',
        'color',
        'combinations',
        'suggestions',
        'fragility',
        'vehicle',
        'freeTax',
        'comercialType',
        'schedulingPeriod',
        'schedulingTax',
        'schedulingDiscount',
        'status',
        'created_at',
        'updated_at'
    ];

    public function medias(){
        return $this->hasMany(Media::class, 'gallery', 'id');
    }

    public function store(){
        return $this->hasOne(Store::class, 'id', 'store')->select("id", "companyName", "slug", "title");
    }

    public function comments(){
        return $this->hasMany(Comment::class, 'product', 'id');
    }

    public static function normalize($products = []){
        if(!empty($products)){
            $products = json_decode(json_encode($products));

            foreach ($products as $key => $product) {

                if(isset($product->gallery) && !!$product->gallery){
                    $gallery = Media::whereIn('id', json_decode($product->gallery, TRUE))->get();

                    foreach ($gallery as $key => $item) {
                        $item->details = json_decode($item->details);
                    }

                    $product->gallery = $gallery;
                }

                if(isset($product->combinations) && !!$product->combinations) {
                    $product->combinations = Product::normalize(Product::whereIn('id', json_decode($product->combinations, TRUE))->get());
                }

                if(isset($product->category) && !!$product->category){
                    $categories = json_decode($product->category, TRUE);
                    $product->category = Category::with(["childs"])
                                                ->whereIn('id', $categories)
                                                ->get();
                }

                if(isset($product->attributes) && !!$product->attributes){
                    $product->attributes = is_string($product->attributes) ? json_decode($product->attributes) : [];
                }
            }

            return $products;
        }

        return [];
    }
}
