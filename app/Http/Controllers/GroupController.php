<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\models;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\Log;

class GroupController extends Controller
{

    public function List()
    {
        $groups = Group::active()->with('categories')->where('target_adc', '!=', true)->get();
        $response = [
            'response' => true,
            'data' => $groups
        ];
        
        return response()->json($response);
    }

    public function listGroupsByStore(Request $request)
    {
        $storeId = $request->get('store_id');

        if (!$storeId) {
            return response()->json([
                'response' => false,
                'message' => 'store_id é obrigatório'
            ], 400);
        }
        Log::info('List_groups_teste_agora');

        // Busca todos os produtos da loja
        $products = Product::where('store', $storeId)->get();

        

        // Coleta todos os IDs de categorias dos produtos
        $categoryIds = [];
        foreach ($products as $product) {
            $ids = is_array($product->category) ? $product->category : json_decode($product->category, true);
            if (is_array($ids)) {
                $categoryIds = array_merge($categoryIds, $ids);
            }
        }
        $categoryIds = array_unique($categoryIds);

        // Busca as categorias no banco
        $categories = Category::whereIn('id', $categoryIds)->get();

        // Coleta todos os group_ids das categorias
        $groupIds = $categories->pluck('group_id')->unique()->filter()->values();


        // Busca os grupos no banco
        $groups = Group::whereIn('id', $groupIds)
        ->with(['categories' => function($query) use ($categoryIds) {
            $query->whereIn('id', $categoryIds);
        }])
        ->get();

        Log::info('List_groups_teste_agora', $groups->toArray());
        
        $response = [
            'response' => true,
            'data' => $groups
        ];
        
        return response()->json($response);
    }

    public function ListTargetAdc()
    {
        
        $groups = Group::active()
            ->where('target_adc', true)
            ->with('categories')
            ->get();


        return response()->json([
            'response' => true,
            'data' => $groups
        ]);
    }

    public function ListTargetAdcPublic()
    {
        Log::info('List_target_adc_public');
        $groups = Group::active()
            ->where('target_adc', true)
            ->with('categories')
            ->get();


        return response()->json([
            'response' => true,
            'data' => $groups
        ]);
    }
    
    
    public function Register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'active' => 'required|boolean',
            'segment' => 'boolean',
        ]);

        if ($request->input('segment') == 1) {
            Group::where('segment', 1)
                ->update(['segment' => 0]);
        }

        $group = Group::create($validated);
    
        return response()->json($group);
    }

    public function Update(Request $request, $GroupId)
    {
        $group = Group::findOrFail($GroupId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'active' => 'required|boolean',
            'segment' => 'boolean',
        ]);
        
        if ($request->input('segment') == 1) {
            Group::where('id', '!=', $GroupId)
                ->where('segment', 1)
                ->update(['segment' => 0]);
        }

        $group->update($validated);

        return response()->json($group);
    }
    
    public function Delete($GroupId)
    {
        $group = Group::findOrFail($GroupId);
        $group->delete();

        $response = [
            'response' => true,
            'data' => $GroupId
        ];
        return response()->json($response);
    }
    
    public function GetAllDescendants($GroupId)
    {
        $group = Group::findOrFail($GroupId);

        $response = [
            'response' => true,
            'data' => $GroupId
        ];
        
        return response()->json($response);
    }
    
    public function DeleteGroupElement($GroupId, $ElementId)
    {
        $group = Group::find($GroupId);
        
        if (!$group) {
            return response()->json([
                'response' => 404,
                'message' => 'Grupo não encontrado'
            ], 404);
        }
        
        $element = Category::where('id', $ElementId)->where('group_id', $GroupId)->first();
        
        if (!$element) {
            return response()->json([
                'response' => 404,
                'message' => 'Elemento não encontrado neste grupo'
            ], 404);
        }
        
        try {
            $element->delete();
            
            $response = [
                'response' => 200,
                'data' => $GroupId
            ];
            
            return response()->json($response, 200);
    
        } catch (\Exception $e) {
            return response()->json([
                'response' => 400,
                'message' => 'Erro ao remover o elemento',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
