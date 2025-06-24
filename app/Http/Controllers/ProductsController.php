<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Store;
use App\Models\Media;
use App\Models\Category;
use App\Models\CategoryRel;
use App\Models\Comment;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ProductsController extends Controller
{
    public function Form(Request $request)
    {

        if ($request->has('id')) {

            $user = auth()->user();
            $store = Store::where(["user" => $user->id])
                ->first();

            if (!isset($store->id)) {
                return response()->json([
                    'response'  => false
                ], 500);
            }

            $product = Product::where('id', (int) $request->get('id'))
                ->where('store', $store->id)
                ->first();

            if (isset($product->id)) {
                return response()->json([
                    'response'  => true,
                    'data'      => Product::normalize([$product])[0]
                ]);
            }
        }
        Log::info('Form request without ID', ['request' => $request->all()]);
        return response()->json([
            'response'  => true,
            'data'      => []
        ]);
    }

    public function List(Request $request)
    {
        Log::info('Listing products', ['request' => $request->all()]);

        $log = [];
        $metadata = [];
        $products = Product::where(['status' => 1])
            ->with(["store"]);

        if ($request->has('store') && $request->get('store')) {
            $store = Store::where(["id" => $request->get('store')])->first();
            $products = isset($store->id) ? $products->where('store', $store->id) : $products;
        }

        if ($request->has('whereIn')) {
            $whereIn = $request->get('whereIn');
            $products = $products->where(function ($query) use ($whereIn) {
                $query->whereIn('id', $whereIn);
            });
        }

        if ($request->has('categories') && $request->get('categories')) {
            $categories = (array) $request->get('categories');
            $products = $products->where(function ($query) use ($categories) {
                foreach ($categories as $categoryId) {
                    $query->orWhereRaw('JSON_CONTAINS(category, ?)', [json_encode([(int)$categoryId])]);
                }
            });
        }

        if ($request->has('ignore')) {
            $slugs      = (is_array($request->get('ignore'))) ? $request->get('ignore') : [$request->get('ignore')];
            $products   = $products->whereNotIn('slug', $slugs);
        }

        if ($request->has('colors') && $request->get('colors')) {
            $colors = (is_array($request->get('colors'))) ? $request->get('colors') : [$request->get('colors')];
            $products = $products->where(function ($query) use ($colors) {
                foreach ($colors as $key => $color) {
                    if ($key === 0) {
                        $query->where('color', '=', $color);
                    } else {
                        $query->orWhere('color', '=', $color);
                    }
                }
            });
        }

        if ($request->has('busca') && $request->get('busca')) {
            $termo = $request->get('busca');
            $termo = is_array($termo) ? implode(" ", $termo) : $termo;

            $busca = explode(" ", handleSearchTerms($termo));

            $products = $products->where(function ($query) use ($busca) {
                foreach ($busca as $term) {
                    $query->where(function ($q) use ($term) {
                        $q->orWhere('title', 'like', '%' . $term . '%')
                            ->orWhere('subtitle', 'like', '%' . $term . '%')
                            ->orWhere('tags', 'like', '%' . $term . '%')
                            ->orWhere('color', 'like', '%' . $term . '%');
                    });
                }
            });
        }

        if ($request->has('tags') && $request->get('tags')) {
            $tags = (is_array($request->get('tags'))) ? $request->get('tags') : [$request->get('tags')];
            $products = $products->where(function ($query) use ($tags) {
                foreach ($tags as $key => $tag) {
                    $query->orWhere('tags', "like", '%' . $tag . '%');
                }
            });
        }

        if ($request->has('range') && $request->get('range')) {
            $products = $products->where('price', '<=', $request->get('range'));
        }


        $count = $products;
        $metadata['count'] = $count->count();

        if ($request->has('limit') && $request->get('limit')) {
            $products = $products->limit($request->get('limit'));
        }

        if ($request->has('offset') && $request->get('offset')) {
            $products = $products->offset($request->get('offset'));
        }

        if ($request->has('ordem') && !!$request->get('ordem')) {
            $products = $products->orderBy('created_at', $request->get('ordem') == "asc" ? "asc" : "desc");
        } else {
            $products = $products->orderBy('title', 'asc')
                ->orderBy('description', 'asc')
                ->orderBy('tags', 'asc');
        }
        Log::info('Produtos filtrados do banco', ['produtos' => $products->get()]);
        return response()->json([
            'response'  => true,
            'data'      => Product::normalize($products->get(), false),
            'metadata'  => $metadata,
            'log'       => $log
        ]);
    }

    public function Get(Request $request)
    {

        Log::info('log aqui no content', ['request' => $request->all()]);


        $product = Product::with(["store", "comments.user"])
            ->where('status', 1);

        if ($request->has('id')) {
            $product  = $product->where('id', $request->get('id'));
        }

        $product = $product->first();
        
        Log::info('Product retrieved', ['product' => $product]);
        Log::info('Normalized product', ['product' => Product::normalize([$product])[0]]);


        if (isset($product->id)) {
            return response()->json([
                'response'  => true,
                'data'      => Product::normalize([$product])[0]
            ]);
        }

        return response()->json([
            'response'  => false,
            'message' => $request->all()
        ]);
    }

    public function Remove(Request $request)
    {

        $request->validate([
            "id" => "required"
        ]);

        $product = Product::where(['status' => 1]);

        if ($request->has('id')) {
            $product  = $product->where('id', $request->get('id'));
        }

        $product = $product->first();

        if (isset($product->id)) {
            $product->status = 0;
            $product->save();

            return response()->json([
                'response'  => true,
                'data'      => $product->id
            ]);
        }

        return response()->json([
            'response'  => false,
            'message' => $request->all()
        ]);
    }

    public function Register(Request $request)
    {
        Log::info('Registering product', ['request' => $request->all()]);

        $request->validate([
            'unavailableDates'   => 'nullable|array',
            'unavailableDates.*' => 'nullable|date_format:Y-m-d',
        ]);
        
        $user = auth()->user();
        $store = Store::where(["user" => $user->id])
            ->first();

        $product = new Product;

        if ($request->has('id') && isset($store->id)) {
            $product = Product::where('id', (int) $request->get('id'))
                ->where('store', $store->id)
                ->first();
        }

        foreach ($request->all() as $key => $value) {
            if (!in_array($key, ['gallery', 'attributes', 'combinations', 'category'])) {
                $product->{$key} = $request->get($key);
            }
        }

        if ($request->has('unavailableDates')) {
            $product->unavailableDates = $request->get('unavailableDates');
        } else {
            $product->unavailableDates = null;
        }

        if ($request->has('title')) {
            $product->slug = Str::slug($request->get('title'));
        }

        if ($request->has('attributes')) {
            $product->attributes = json_encode($request->get('attributes') ?? []);
        }

        if ($request->has('combinations') && !empty($request->get('combinations'))) {
            $combinations = array_map(function ($item) {
                return $item['id'];
            }, $request->get('combinations'));
            $product->combinations = json_encode(array_values($combinations));
        }

        if ($request->has('freeTax')) {
            $product->freeTax = floatFormat($request->get('freeTax'));
        }

        if ($request->has('price')) {
            $product->price = floatFormat($request->get('price'));
        }

        if ($request->has('priceSale')) {
            $product->priceSale = floatFormat($request->get('priceSale'));
        }

        $product->status    = 1;
        $product->store     = $store->id;
        $product->category  = json_encode([]);

        DB::beginTransaction();


        // Salva o campo category como JSON, se for array
        if ($request->has('category')) {
            $product->category = json_encode((array) $request->category);
        } else {
            $product->category = json_encode([]);
        }

        $product->store = $store->id;
        $product->status = 1;

        Log::info('Product data before save', ['product' => $product->toArray()]);
        $product->save();

        DB::commit();

        return response()->json([
            'response'  => true,
            'data'    => $product
        ]);
    }

    public function GetGallery(Request $request, $id)
    {

        $user = auth()->user();

        $store = Store::where(["user" => $user->id])
            ->first();

        $product = Product::with(["store", "comments.user"])
            ->where(['id' => $id, "store" => $store->id])
            ->first();

        $gallery = [];

        if (isset($product->id)) {

            if (isset($product->gallery) && !!$product->gallery) {
                $medias = Media::whereIn('id', json_decode($product->gallery, TRUE))->get();

                foreach ($medias as $key => $item) {
                    $item->details = json_decode($item->details);
                }

                $gallery = $medias;
            }
        }

        return response()->json([
            'response'  => true,
            'product'   => $product,
            'data'      => $gallery
        ]);
    }

    public function RemoveGallery(Request $request)
    {

        $request->validate([
            "id"        => "required",
            "medias"    => "required"
        ]);

        $user   = auth()->user();
        $store  = Store::where(["user" => $user->id])
            ->first();

        $feedback   = [];
        $removed    = [];

        $medias = Media::whereIn('id', $request->get('medias'))
            ->where('user_id', $user->id)
            ->get();

        foreach ($medias as $media) {

            $has_error = false;

            foreach ($media->RemoveMedia() as $md) {
                if ($md != true) {
                    $has_error = true;
                    array_merge($feedback, $md);
                }
            }

            if (!$has_error) {
                $removed[] = $media->id;
            }
        }

        Media::whereIn('id', $removed)
            ->delete();

        $product = Product::where('id', $request->get('id'))
            ->where('store', $store->id)
            ->first();

        $gallery = json_decode($product->gallery, TRUE);

        $filteredGallery = array_values(array_filter($gallery, function ($id) use ($removed) {
            return !in_array($id, $removed);
        }));

        $product->gallery = json_encode($filteredGallery);
        $product->save();

        return response()->json([
            'response'  => true,
            'feedback'  => $feedback,
            'gallery'   => $filteredGallery,
            'data'      => $removed
        ]);
    }

    public function UploadGallery(Request $request)
    {

        $request->validate([
            'medias'    => 'required|array',
            'medias.*'  => 'required|file|mimes:jpeg,jpg,JPG,JPEG,webp,png,gif|max:6000'
        ]);

        $user   = auth()->user();
        $store  = Store::where(["user" => $user->id])
            ->first();

        $files  = $request->file('medias');

        $medias = Media::MakeUpload($files, "/products/" . $store->id . "/" . date('d-m-Y'), $store->id);

        if ($request->has('product') && !!$request->get('product')) {
            $product = Product::where('id', $request->get('product'))
                ->where('store', $store->id)
                ->first();
        } else {
            $product = new Product;
            $product->title     = "Rascunho #" . rand(0, 3000);
            $product->slug      = Str::slug($product->title);
            $product->store     = $store->id;
            $product->status    = -1;
            $product->category  = json_encode([]);
            $product->gallery   = json_encode([]);
        }

        $gallery = !!$product->gallery ? json_decode($product->gallery, TRUE) : [];

        foreach ($medias as $media) {
            $gallery[] = $media->id;
            $media->details = json_decode($media->details);
        }

        $product->gallery = json_encode($gallery);
        $product->save();

        return response()->json([
            'response'  => true,
            'data'      => [
                "product"   => $product->id,
                "medias"    => $medias
            ]
        ]);
    }
}
