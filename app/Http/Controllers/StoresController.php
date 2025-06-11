<?php

namespace App\Http\Controllers;

use App\Models\Element;
use App\Models\Group;
use DB;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Store;
use App\Models\Suborder;
use App\Models\User;
use App\Models\Media;
use App\Models\Customer;
use App\Models\Withdraw;
use App\Models\Category;
use App\Models\CategoryRel;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class StoresController extends Controller
{
    public function Balance(Request $request){

        $user = auth()->user();
        $store = Store::where(["user" => $user->id])->first();
        
        if (!$store) {
            $balance = [
                'cash' => 0,
                'payments' => 0,
                'promises' => 0,
                'orders' => 0
            ];
            return response()->json([
                'response'  => true,
                'data'      => $balance
            ]);
        }

        $payments   = Suborder::where(['store' => $store->id, 'status' => 1])->sum('paying') ?? 0;
        $withdraw   = Withdraw::where(['store' => $store->id, 'status' => 1])->sum('value') ?? 0;

        $cash       = $payments - $withdraw;
        $orders     = Suborder::where(['store' => $store->id])->count() ?? 0;
        $promises   = Suborder::where(['store' => $store->id])
                            ->where(function($query){
                                $query->where('status', 0)
                                      ->orWhere('status', 2);
                            })->sum('paying') ?? 0;

        $balance = [
            'cash' => $cash ?? 0,
            'payments' => $payments ?? 0,
            'promises' => $promises ?? 0,
            'orders' => $orders ?? 0
        ];

        return response()->json([
            'response'  => true,
            'data'      => $balance
        ]);
    }

    public function Form(Request $request){

        $user = auth()->user();
        $store = Store::where(["user" => $user->id])
            ->first();

        $groups = Group::where('active', 1)->get();

        $segmentGroup = Group::where('segment', 1)
                             ->first();
        $segmentGroupId = null;

        if ($segmentGroup) {
            $segmentGroupId = $segmentGroup->id;

            $elements = Element::where('group_id', $segmentGroupId)->get();

            $elementsForSelect = [];
            
            foreach ($elements as $element) {
                $elementsForSelect[] = [
                    'id' => $element->id,
                    'name' => $element->name,
                    'icon' => $element->icon,
                ];
            }
            
            \Log::info('Elementos do Grupo com Segmento 1:', $elementsForSelect);
        } else {
            $elementsForSelect = [];
            \Log::warning('Nenhum grupo com segmento 1 encontrado.');
        }

        if (isset($store->id)) {
            $cover = !!$store->cover ? Media::where(['id' => $store->cover])->first() : [];
            if (isset($cover->id)) {
                $cover->details = json_decode($cover->details);
                $store->cover = $cover;
            }

            $profile = !!$store->profile ? Media::where(['id' => $store->profile])->first() : [];
            if (isset($profile->id)) {
                $profile->details = json_decode($profile->details);
                $store->profile = $profile;
            }

            $store->openClose = json_decode($store->openClose);
            $store->metadata = json_decode($store->metadata);
            
            return response()->json([
                'response' => true,
                'data' => $store,
                'groups' => $groups,
                'elements' => $elementsForSelect,
            ]);
        }

        return response()->json([
            'response' => false
        ], 500);
    }

    public function Get(Request $request){

        $request->validate([
            'slug' => 'required'
        ]);

        $store = Store::where("slug", $request->get('slug'))
                      ->where("status", 1)
                      ->first();

        if(isset($store->id)){

            $products = Product::with(["store"])
                               ->where('store', $store->id);

            $cover = !!$store->cover ? Media::where(['id' => $store->cover])->first() : [];
            if(isset($cover->id)){
                $cover->details = json_decode($cover->details);
                $store->cover   = $cover;
            }

            $profile = !!$store->profile ? Media::where(['id' => $store->profile])->first() : [];
            if(isset($profile->id)){
                $profile->details = json_decode($profile->details);
                $store->profile   = $profile;
            }

            $store->products    = Product::normalize($products->get(), false);
            $store->openClose   = json_decode($store->openClose);
            $store->metadata    = json_decode($store->metadata);

            return response()->json([
                'response'  => true,
                'data'      => $store
            ]);
        }

        return response()->json([
            'response'  => false
        ], 500);
    }

    public function List(Request $request){

        $stores = Store::orderBy('id', 'DESC')
                       ->where('status', 1)
                       ->get();

        foreach ($stores as $key => $store) {

            $profile = !!$store->profile ? Media::where(['id' => $store->profile])->first() : [];
            if(isset($profile->id)){
                $profile->details = json_decode($profile->details);
                $store->profile   = $profile;
            }

            $store->metadata    = json_decode($store->metadata);
        }

        return response()->json([
            'response'  => true,
            'data'      => $stores
        ]);
    }

    public function Customers(Request $request){

        $request->validate([
            'store' => 'required'
        ]);

        $user = auth()->user();

        $store = Store::where(["user" => $user->id, "id" => $request->get("store")])
                      ->first();

        if(isset($store->id)){

            $users = Suborder::where(['store' => $store->id])
                             ->groupBy('user')
                             ->pluck('user')
                             ->toArray();

            $customers = User::whereIn('id', $users);

            if($request->has('id')){
                $customers = $customers->where(['id' => $request->get('id')])->first();
                $customers->DetailsUp();
            }
            else{
                $customers = $customers->get();
            }

            return response()->json([
                'response'  => true,
                'data'      => $customers
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function Register(Request $request){

        $user   = auth()->user();
        $store  = Store::where(["user" => $user->id])
                       ->first();

        if(isset($store->id)){
            $store = Store::where('id', $store->id)
                          ->first();

            $cover      = $store->cover;
            $profile    = $store->profile;

            if($request->has('cover') && !!$request->get('cover')){
                $cover = $request->get('cover');
                $cover = $cover['id'];
            }

            if($request->has('profile') && !!$request->get('profile')){
                $profile = $request->get('profile');
                $profile = $profile['id'];
            }

            $store->RequestToThis($request);

            $store->cover       = $cover;
            $store->profile     = $profile;
            $store->openClose   = json_encode($request->get('openClose'));
            $store->metadata    = json_encode($request->get('metadata'));

            DB::beginTransaction();

            if(!$store->save()){
                DB::rollback();
            }

            DB::commit();

            $store->cover   = !!$store->$cover      ? Media::TakeImage($store->cover)   : NULL;
            $store->profile = !!$store->$profile    ? Media::TakeImage($store->profile) : NULL;

            return response()->json([
                'response'  => true,
                'request'   => [$cover, $profile],
                'data'      => $store
            ]);
        }

        return response()->json([
            'response'  => false
        ], 500);
    }

    public function CompleteRegister(Request $request)
    {
        Log::info('Inicio do método CompleteRegister. Dados da requisição:', $request->all());

        $validated = $request->validate([
            'email' => 'required|email',
            'document' => 'required',
            'companyName' => 'required'
        ], [
            'email.required' => 'O email é obrigatório',
            'document.required' => 'O documento (CPF/CNPJ) é obrigatório',
            'companyName.required' => 'O nome da empresa é obrigatório'
        ]);
    
        DB::beginTransaction();
        try {
            $user = User::where("email", $validated['email'])->firstOrFail();

            if (!$user) {
                Log::error('Usuário não encontrado');
                return response()->json(['response' => false, 'message' => 'Usuário não encontrado.'], 404);
            }

            $store = Store::where(["user" => $user->id])->first();
            
            if(!$store){
                $store = new Store();
                $store->user = $user->id;
                $store->status = 0;
                Log::info('Nova loja criada');
            }
            
            if($request->has("document")){
                $store->document = $request->get("document");
            }

            if($request->has("companyName")){
                $store->title = $request->get("companyName");
                $store->slug = Str::slug(strip_tags($request->get("companyName")));
                $store->companyName = $request->get("companyName");
            }
            
            $user->RequestToThis($request);
            $user->person = "partner";
            $user->save();

            $store->RequestToThis($request);
            $store->hasDelivery = $request->get("hasDelivery", false);

            if(!$store->save()) {
                throw new \Exception("Falha ao salvar a loja");
            }
            
            $groups = Group::where('active', 1)->get();
            $segmentGroup = Group::where('segment', 1)->first();
            $elementsForSelect = [];

            if ($segmentGroup) {
                $elements = Element::where('group_id', $segmentGroup->id)->get();
                
                foreach ($elements as $element) {
                    $elementsForSelect[] = [
                        'id' => $element->id,
                        'name' => $element->name,
                        'icon' => $element->icon,
                    ];
                }
            }
            
            DB::commit();
            
            return response()->json([
                'response' => true,
                'data' => $store,
                'groups' => $groups,
                'elements' => $elementsForSelect
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Erro completo: " . $e->getMessage());
            return response()->json([
                'response' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function Products(Request $request){

        $user   = auth()->user();
        $store  = Store::where(["user" => $user->id])
                       ->first();

        $log = [];
        $metadata = [];
        $products = Product::where('status', '<>', 0)
                            ->where('store', $store->id)
                            ->with(["store"]);

        if($request->has('search') && $request->get('search')){
            $busca = $request->get('search');
            $products = $products->where(function ($query) use ($busca) {
                $busca = is_array($busca) ? $busca : [$busca];
                foreach($busca as $term){
                    $query->orWhere('tags', "like", '%'.$term.'%');
                    $query->orWhere('title', "like", '%'.$term.'%');
                    $query->orWhere('subtitle', "like", '%'.$term.'%');
                    $query->orWhere('description', "like", '%'.$term.'%');
                }
            });
        }

        if($request->has('limit') && $request->get('limit')){
            $products = $products->limit($request->get('limit'));
        }

        if($request->has('colors') && $request->get('colors')){
            $colors = (is_array($request->get('colors'))) ? $request->get('colors') : [$request->get('colors')];
            $products = $products->where(function ($query) use ($colors) {
                foreach ($colors as $key => $color) {
                    $query->orWhere('color', "like", '%'.$color.'%');
                }
            });
        }

        if($request->has('range') && $request->get('range')){
            $products = $products->where('price', '<=', $request->get('range'));
        }

        if($request->has('categories') && $request->input('categories')){
            $categories = (is_array($request->input('categories'))) ? $request->input('categories') : [$request->input('categories')];
            $categories = Category::whereIn('slug', $categories)->pluck('id')->toArray();

            $whereIn    = CategoryRel::whereIn('category', $categories)->pluck('product')->toArray();
            $products   = $products->whereIn('id', $whereIn);
        }

        if($request->has('order') && !!$request->get('order')){
            $products = $products->orderBy('created_at', $request->get('order') == "asc" ? "asc" : "desc");
        }
        else{
            $products = $products->orderBy('title', 'asc')
                                ->orderBy('description', 'asc')
                                ->orderBy('tags', 'asc');
        }

        $limit  = $request->get("limit", 25);
        $page   = $request->get("page", 0);

        $products = $products->paginate($limit, ['*'], 'page', $page);

        $items = $products->items();
        $total = $products->total();

        $metadata = [
            'pages' => ceil($total / $limit),
            "total" => $products->total()
        ];

        return response()->json([
            'response'  => true,
            'data'      => Product::normalize($items, false),
            'metadata'  => $metadata
        ]);
    }
}
