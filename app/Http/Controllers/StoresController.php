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
use App\Models\Category;
use App\Models\User;
use App\Models\Media;
use App\Models\Customer;
use App\Models\Withdraw;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Models\Recipient;
use App\Models\RecipientAddress;
use App\Models\RecipientPhone;

class StoresController extends Controller
{
    public function Balance(Request $request)
    {

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
                            ->where(function ($query) {
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

    public function Form(Request $request)
    {

        $user = auth()->user();
        $store = Store::where(["user" => $user->id])
            ->first();

        $groups = Group::where('active', 1)->get();

        $segmentGroup = Group::where('segment', 1)
                             ->first();
        $segmentGroupId = null;

        if ($segmentGroup) {
            $segmentGroupId = $segmentGroup->id;

            $elements = Category::where('group_id', $segmentGroupId)->get();

            $elementsForSelect = [];

            foreach ($elements as $element) {
                $elementsForSelect[] = [
                    'id' => $element->id,
                    'name' => $element->name,
                    'icon' => $element->icon,
                ];
            }

        } else {
            $elementsForSelect = [];
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

    public function Get(Request $request)
    {

        $request->validate([
            'slug' => 'required'
        ]);


        $store = Store::where("slug", $request->get('slug'))
                      ->where("status", 1)
                      ->first();

        if (isset($store->id)) {

            $products = Product::with(["store"])
                               ->where('store', $store->id);

            $cover = !!$store->cover ? Media::where(['id' => $store->cover])->first() : [];
            if (isset($cover->id)) {
                $cover->details = json_decode($cover->details);
                $store->cover   = $cover;
            }

            $profile = !!$store->profile ? Media::where(['id' => $store->profile])->first() : [];
            if (isset($profile->id)) {
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

    public function List(Request $request)
    {

        $stores = Store::orderBy('id', 'DESC')
                       ->where('status', 1)
                       ->get();

        foreach ($stores as $key => $store) {

            $profile = !!$store->profile ? Media::where(['id' => $store->profile])->first() : [];
            if (isset($profile->id)) {
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

    public function Customers(Request $request)
    {

        $request->validate([
            'store' => 'required|exists:stores,id',
            'id' => 'nullable|integer|exists:users,id'
        ]);

        $user = auth()->user();

        $store = Store::where(["user" => $user->id, "id" => $request->get("store")])
                      ->first();

        if (isset($store->id)) {

            $users = Suborder::where('store', $store->id)
                 ->distinct()
                 ->pluck('user');

            $customers = User::whereIn('id', $users);

            if ($request->has('id')) {
                $customers = $customers->where('id', $request->get('id'))->first();

                if (!$customers) {
                    return response()->json([
                        'response' => false,
                        'message' => 'Cliente não encontrado para esta loja.'
                    ], 404);
                }

                $customers->DetailsUp();
            }
        }

        return response()->json([
            'response' => true,
            'data' => collect($customers)->map(function ($user) {
                return $user->makeHidden(['password', 'remember_token', 'api_token']);
            }),
        ]);
    }

    public function Register(Request $request)
    {

        $user   = auth()->user();
        $store  = Store::where(["user" => $user->id])
                       ->first();

        if (isset($store->id)) {
            $store = Store::where('id', $store->id)
                          ->first();

            $cover      = $store->cover;
            $profile    = $store->profile;

            if ($request->has('cover') && !!$request->get('cover')) {
                $cover = $request->get('cover');
                $cover = $cover['id'];
            }

            if ($request->has('profile') && !!$request->get('profile')) {
                $profile = $request->get('profile');
                $profile = $profile['id'];
            }

            $store->RequestToThis($request);

            $store->cover       = $cover;
            $store->profile     = $profile;
            $store->openClose   = json_encode($request->get('openClose'));
            $store->metadata    = json_encode($request->get('metadata'));

            DB::beginTransaction();

            if (!$store->save()) {
                DB::rollback();
            }

            DB::commit();

            $store->cover   = !!$store->$cover ? Media::TakeImage($store->cover) : null;
            $store->profile = !!$store->$profile ? Media::TakeImage($store->profile) : null;

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
            'companyName' => 'required',
        ], [
            'email.required' => 'O email é obrigatório',
            'document.required' => 'O documento (CPF/CNPJ) é obrigatório',
            'companyName.required' => 'O nome da empresa é obrigatório',
            'birth_date.required' => 'A data de nascimento é obrigatória',
            'phone.required' => 'O telefone é obrigatório',
        ]);

        DB::beginTransaction();

        try {
            $user = User::where("email", $validated['email'])->firstOrFail();

            $store = Store::where(["user" => $user->id])->first();

            if (!$store) {
                $store = new Store();
                $store->user = $user->id;
                $store->status = 0;
                Log::info('Nova loja criada');
            }

            $store->document = $request->get("document");
            $store->title = $request->get("companyName");
            $store->slug = Str::slug(strip_tags($request->get("companyName")));
            $store->companyName = $request->get("companyName");

            $user->RequestToThis($request);
            $user->person = "partner";
            $user->save();

            $store->RequestToThis($request);
            $store->hasDelivery = $request->get("hasDelivery", false);

            if (!$store->save()) {
                throw new \Exception("Falha ao salvar a loja");
            }

            $birthDate = null;
            if ($request->filled('birth_date')) {
                try {
                    $birthDate = Carbon::createFromFormat('d/m/Y', $request->birth_date)->format('Y-m-d');
                } catch (\Exception $e) {
                    Log::error("Erro ao converter data de nascimento: " . $e->getMessage());
                    // opcionalmente, você pode lançar uma exceção ou retornar erro de validação aqui
                }
            }

            // ✅ Criação do Recipient local
            $recipient = new Recipient();
            $recipient->store_id = $store->id;
            $recipient->partner_id = null;
            $recipient->type_enum = 'PF';
            $recipient->email = $user->email;
            $recipient->document = $request->get('document');
            $recipient->type = 'individual';
            $recipient->name = $user->name;
            $recipient->company_name = $user->companyName;
            $recipient->birth_date = $birthDate;
            $recipient->save();

            

            // ✅ Criação do RecipientAddress
            $address = new RecipientAddress();
            $address->recipient_id = $recipient->id;
            $address->city = $request->get('city');
            $address->state = $request->get('state');
            $address->save();



            $fullPhone = preg_replace('/\D/', '', $request->get('phone')); 

            $areaCode = substr($fullPhone, 0, 2);
            $number = substr($fullPhone, 2);

            $phone = new RecipientPhone();
            $phone->recipient_id = $recipient->id;
            $phone->area_code = $areaCode;
            $phone->number = $number;
            $phone->type = 'Recipient';
            $phone->save();

            // Dados adicionais para o frontend
            $groups = Group::where('active', 1)->get();
            $segmentGroup = Group::where('segment', 1)->first();
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

    public function Products(Request $request)
    {

        $user   = auth()->user();
        $store  = Store::where(["user" => $user->id])
                       ->first();

        $log = [];
        $metadata = [];
        $products = Product::where('status', '<>', 0)
                            ->where('store', $store->id)
                            ->with(["store"]);

        if ($request->has('search') && $request->get('search')) {
            $busca = $request->get('search');
            $products = $products->where(function ($query) use ($busca) {
                $busca = is_array($busca) ? $busca : [$busca];
                foreach ($busca as $term) {
                    $query->orWhere('tags', "like", '%'.$term.'%');
                    $query->orWhere('title', "like", '%'.$term.'%');
                    $query->orWhere('subtitle', "like", '%'.$term.'%');
                    $query->orWhere('description', "like", '%'.$term.'%');
                }
            });
        }

        if ($request->has('limit') && $request->get('limit')) {
            $products = $products->limit($request->get('limit'));
        }

        if ($request->has('colors') && $request->get('colors')) {
            $colors = (is_array($request->get('colors'))) ? $request->get('colors') : [$request->get('colors')];
            $products = $products->where(function ($query) use ($colors) {
                foreach ($colors as $key => $color) {
                    $query->orWhere('color', "like", '%'.$color.'%');
                }
            });
        }

        if ($request->has('range') && $request->get('range')) {
            $products = $products->where('price', '<=', $request->get('range'));
        }



        if ($request->has('order') && !!$request->get('order')) {
            $products = $products->orderBy('created_at', $request->get('order') == "asc" ? "asc" : "desc");
        } else {
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
