<?php

namespace App\Http\Controllers;

use DB;
use Image;
use Auth;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Content;
use App\Models\Order;
use App\Models\Store;
use App\Models\Product;
use App\Models\Suborder;
use App\Models\Category;
use App\Models\Media;

class CronController extends Controller
{
    public function NormalizeFileData(){
        $medias = Media::get();
        $log = [];

        foreach($medias as $key => $media){

            $log[$media->id] = true;

            $media->type    = ($media->extension == 'pdf') ? 'file' : 'image';
            $dim            = ($media->extension == 'pdf') ? '' : 'xl-';

            if($media->base_url){

                $disk = Storage::disk('s3');
                $public = '';
            }
            else{

                $disk = Storage::disk('public');
                $public = 'public/';
            }

            $file_path = $public.$media->path.'/'.$dim.$media->file_name;

            if($disk->exists($file_path)){
                $log[$media->id]    = $disk->size($file_path);
                $media->file_size   = $disk->size($file_path);
            }

            DB::beginTransaction();
            if(!$media->save()){
                DB::rollback();
            }
            DB::commit();
        }

        echo "<pre>";
        print_r($log);
        echo "</pre>";
    }

    public function MigrateCategories(){
        $contents = Content::where(["type" => "category"])
                           ->get();

        foreach ($contents as $key => $content) {
            $detail = json_decode($content->content, TRUE);

            $category = new Category;

            $handle = Category::where(["slug" => $content->slug])->first();

            if(isset($handle->id)) $category = $handle;

            $category->title    = $content->title;
            $category->slug     = $content->slug;
            $category->feature  = $content->featured;

            if(isset($detail['image']) && isset($detail['image'][0])){
                $category->image = $detail['image'][0]['id'];
            }

            $category->status = 1;
            $category->save();
        }

        foreach ($contents as $key => $content) {
            $parent = Category::where(["slug" => $content->slug])->first();
            $childs = Content::where(["parent_id" => $content->id, "type" => "category"])
                             ->get();

            foreach ($childs as $key => $child) {
                $handle = Category::where(["slug" => $child->slug])->first();
                $handle->parent = $parent->id;
                $handle->save();
            }
        }

        foreach ($contents as $key => $content) {
            $detail = json_decode($content->content, TRUE);

            if(isset($detail['closest']) && !!$detail['closest']){
                $closests = Content::whereIn("id", $detail['closest'])
                                   ->get();
                $ids = [];

                foreach ($closests as $key => $closest) {
                    $rel = Category::where(["slug" => $closest->slug])->first();
                    $ids[] = $rel->id;
                }

                $handle = Category::where(["slug" => $content->slug])->first();
                if($handle->id){
                    $handle->closest = json_encode($ids);
                    $handle->save();
                }
            }
        }
    }

    public function MigrateOrders(){
        $contents = Content::where(["type" => "order"])
                           ->get();

        foreach ($contents as $key => $item) {
            $detail = json_decode($item->content, TRUE);

            $order  = new Order;

            $handle = Order::where(["hash" => $item->slug])->first();

            if(isset($handle->id)) $order = $handle;

            $order->user = $item->user_id;
            $order->hash = $item->slug;
            $order->deliveryStatus = isset($detail['deliveryStatus']) ? $detail['deliveryStatus'] : "pending";
            $order->deliverySchedule = isset($detail['deliverySchedule']) ? $detail['deliverySchedule'] : NULL;
            $order->deliveryAddress =  isset($detail['address']) ? json_encode($detail['address']) : NULL;
            $order->total = $detail['totalOrder'];
            $order->platformCommission = $detail['platformCommission'];
            $order->listItems = json_encode($detail['listItems']);
            $order->metadata = json_encode($detail['metadata']);
            $order->status = $item->status;
            $order->created_at = $item->created_at;
            $order->updated_at = $item->updated_at;
            $order->save();

            if($order->save()){

                Suborder::where('order', $order->id)->delete();

                $suborders = [];
                $listItems = json_decode($order->listItems, TRUE);

                foreach ($listItems as $key => $item) {
                    $index = $item['product']['store']['id'];

                    if (!isset($suborders[$index])) {
                        $suborders[$index] = [
                            "listItems"     => [],
                            "total"    => 0
                        ];
                    }

                    $suborders[$index]['listItems'][] = $item['product']['id'];
                    $suborders[$index]['total'] += $item['total'];
                }

                foreach ($suborders as $key => $suborder) {
                    $sub = new Suborder;
                    $sub->store     = $key;
                    $sub->user      = $order->user;
                    $sub->order     = $order->id;
                    $sub->total     = $suborder['total'];
                    $sub->listItems = json_encode($suborder['listItems']);
                    $sub->deliveryStatus        = $order->deliveryStatus;
                    $sub->deliverySchedule      = $order->deliverySchedule;
                    $sub->status = $order->status;
                    $sub->created_at = $order->created_at;
                    $sub->updated_at = $order->updated_at;
                    $sub->save();
                }
            }
        }
    }

    public function MigrateStores(){
        $contents = Content::where(["type" => "store"])
                           ->get();

        foreach ($contents as $key => $item) {
            $detail = json_decode($item->content, TRUE);

            $store = new Store;

            $handle = Store::where(["slug" => $item->slug])->first();

            if(isset($handle->id)) $store = $handle;

            $store->user = $item->user_id;
            $store->title = $item->title;
            $store->slug = $item->slug;
            $store->companyName = $item->title;
            $store->document = isset($detail["cnpj"]) ? $detail["cnpj"] : NULL;
            $store->description = isset($detail["description"]) ? $detail["description"] : NULL;
            $store->cover = isset($detail["cover"]['id']) ? $detail["cover"]['id'] : NULL;
            $store->profile = isset($detail["profile"]['id']) ? $detail["profile"]['id'] : NULL;
            $store->openClose = isset($detail["openClose"]) ? json_encode($detail["openClose"]) : json_encode([]);
            $store->segment = isset($detail["segment"]) ? $detail["segment"] : NULL;
            $store->hasDelivery = isset($detail["hasDelivery"]) ? $detail["hasDelivery"] : NULL;
            $store->zipCode = isset($detail["zipCode"]) ? $detail["zipCode"] : NULL;
            $store->street = isset($detail["street"]) ? $detail["street"] : NULL;
            $store->number = isset($detail["number"]) ? $detail["number"] : NULL;
            $store->neighborhood = isset($detail["neighborhood"]) ? $detail["neighborhood"] : NULL;
            $store->complement = isset($detail["complement"]) ? $detail["complement"] : NULL;
            $store->city = isset($detail["city"]) ? $detail["city"] : NULL;
            $store->state = isset($detail["state"]) ? $detail["state"] : NULL;
            $store->country = isset($detail["country"]) ? $detail["country"] : NULL;
            $store->status = $item->status;
            $store->created_at = $item->created_at;
            $store->updated_at = $item->updated_at;

            $store->status = 1;
            $store->save();
        }
    }

    public function MigrateProducts(){
        $contents = Content::where(["type" => "product"])
                           ->get();

        foreach ($contents as $key => $item) {
            $detail = json_decode($item->content, TRUE);

            $product = new Product;

            $handle = Product::where(["slug" => $item->slug])->first();

            if(isset($handle->id)) $product = $handle;

            if(isset($detail['gallery']) && !!is_array($detail['gallery'])){
                $gallery = [];

                foreach ($detail['gallery'] as $key => $img) {
                    $gallery[] = $img['id'];
                }

                $product->gallery = json_encode($gallery);
            }

            if(isset($detail['color'])){
                $product->color = is_array($detail['color']) ? implode('|', $detail['color']) : $detail['color'] ?? NULL;
            }

            $product->price = isset($detail['details']['price']) ? $detail['details']['price'] : NULL;
            $product->priceSale = isset($detail['details']['priceSale']) ? $detail['details']['priceSale'] : NULL;
            $product->sku = isset($detail['details']['sku']) ? $detail['details']['sku'] : NULL;
            $product->code = isset($detail['details']['code']) ? $detail['details']['code'] : NULL;
            $product->quantity = isset($detail['details']['quantity']) ? $detail['details']['quantity'] : NULL;

            $product->description = isset($detail['description']) ? $detail['description'] : NULL;
            $product->tags = isset($detail['tags']) ? $detail['tags'] : NULL;
            $product->comercialType = isset($detail['comercialType']) ? $detail['comercialType'] : NULL;
            $product->schedulingTax = isset($detail['schedulingTax']) ? $detail['schedulingTax'] : NULL;
            $product->schedulingDiscount = isset($detail['schedulingDiscount']) ? $detail['schedulingDiscount'] : NULL;
            $product->freeTax = isset($detail['freeTax']) ? $detail['freeTax'] : NULL;
            $product->vehicle = isset($detail['vehicle']) ? $detail['vehicle'] : NULL;
            $product->fragility = isset($detail['fragility']) ? $detail['fragility'] : NULL;

            $product->title = $item->title;
            $product->slug = $item->slug;
            $product->subtitle = isset($detail['subtitle']) ? $detail['subtitle'] : NULL;
            $product->quantityType = isset($detail['quantityType']) ? $detail['quantityType'] : NULL;
            $product->availability = isset($detail['availability']) ? $detail['availability'] : NULL;
            $product->unavailable = isset($detail['unavailable']) ? $detail['unavailable'] : NULL;
            $product->weight = isset($detail['weight']) ? $detail['weight'] : NULL;
            $product->length = isset($detail['length']) ? $detail['length'] : NULL;
            $product->width = isset($detail['width']) ? $detail['width'] : NULL;
            $product->height = isset($detail['height']) ? $detail['height'] : NULL;

            $product->attributes = isset($detail['attributes']) ? json_encode($detail['attributes']) : NULL;

            $product->schedulingPeriod = isset($detail['schedulingPeriod']) ? (int) $detail['schedulingPeriod'] : NULL;
            $product->status = $item->status;
            $product->created_at = $item->created_at;
            $product->updated_at = $item->updated_at;

            $store = Content::where(["id" => $item->parent_id, "type" => "store"])->first();
            $store = Store::where(["slug" => $store->slug])->first();

            $product->store = $store->id;

            $product->status = 1;
            $product->save();
        }
    }

    public function MigrateData(){
        $this->MigrateStores();
        $this->MigrateProducts();
        $this->MigrateCategories();
        // $this->MigrateOrders();
    }

    public function recursiveContent($details = []) {

        foreach ($details as $key => $item) {
            if($item){
                foreach ($item as $indx => $value) {

                    if(is_array($value) && isset($value[0]) && getType($value[0]) == "object" && isset($value[0]->file_name)){

                        $medias = [];

                        foreach($value as $media){
                            $medias[] = $media->id;
                        }

                        $details[$key]->{$indx} = ["medias" => $medias];
                    }
                    elseif(is_array($value)){
                        $details[$key]->{$indx} = $this->recursiveContent($value);
                    }
                }
            }
        }

        return $details;
    }

    public function NormalizeMediaContent(){

        $content = Content::get();

        foreach ($content as $value) {

            $details = json_decode($value->content);

            if($details){

                foreach ($details as $key => $detail) {
                    if(is_array($detail) && isset($detail[0]) && getType($detail[0]) == "object" && isset($detail[0]->file_name)){

                        $medias = [];

                        foreach($detail as $media){
                            $medias[] = $media->id;
                        }

                        $details->{$key} = ["medias" => $medias];
                    }
                    elseif(is_array($detail)){
                        $details->{$key} = $this->recursiveContent($detail);
                    }
                }
            }

            $value->content = json_encode($details);
            $value->save();
        }
    }
}
