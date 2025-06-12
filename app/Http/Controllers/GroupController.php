<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\models;
use Illuminate\Http\Request;

use App\Models\Category;
use Illuminate\Support\Facades\Log;

class GroupController extends Controller
{

    public function List()
    {
         Log::info('List_groups_teste');
        $groups = Group::active()->with('categories')->where('target_adc', '!=', true)->get();
        Log::info('List_groups', $groups->toArray());
        $response = [
            'response' => true,
            'data' => $groups
        ];
        
        return response()->json($response);
    }

    public function ListTargetAdc()
    {
        Log::info('List_target_adc');
        $groups = Group::active()
            ->where('target_adc', true)
            ->with('categories')
            ->get();

        Log::info('tropa',$groups->toArray());

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
