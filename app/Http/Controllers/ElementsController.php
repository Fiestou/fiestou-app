<?php

namespace App\Http\Controllers;

use App\Models\Element;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ElementsController extends Controller
{

    public function register(Request $request)
    {

        $request->validate([
            'name' => 'required|string|max:255|unique:elements,name',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'group_id' => 'required|exists:group,id',
            'active' => 'required|boolean',
            'element_related_id' => 'nullable|array',
        ]);
        log::info('elemento enviado.',request()->all());

        $element = Categorie::create([
            'name' => $request->name,
            'description' => $request->description,
            'icon' => $request->icon,
            'group_id' => $request->group_id,
            'active' => $request->active,
            'element_related_id' => $request->element_related_id, 
        ]);
        Log::info('deu certo !.', $element->toArray());

        $response = [
            'response' => 200,
            'data' => $element
        ];
        return response()->json($response);
    }
    // Método para criar um novo elemento
    public function store(Request $request, $GroupId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'active' => 'required|boolean',
        ]);

        // Criando o elemento e associando ao grupo
        $element = Category::create([
            'name' => $request->name,
            'description' => $request->description,
            'icon' => $request->icon,
            'group_id' => $GroupId,
            'active' => $request->active,
        ]);

        return response()->json($element, 201); // Retorna o elemento criado com status 201
    }

    // Método para atualizar um elemento específico
    public function update(Request $request, $GroupId, $ElementId)
    {
        $element = Category::where('group_id', $GroupId)->findOrFail($ElementId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'active' => 'required|boolean',
            'element_related_id' => 'nullable|array',	
        ]);

        $element->update($validated);

        $response = [
            'response' => true,
            'data' => $element
        ];

        return response()->json($response);
    }

    // Método para excluir um elemento específico
    public function destroy($GroupId, $ElementId)
    {
        $element = Category::where('group_id', $GroupId)->findOrFail($ElementId);

        $element->delete();

        return response()->json(null, 204); // Retorna resposta vazia com status 204
    }

    // Método para listar todos os elementos de um grupo
    public function index($GroupId)
    {
        $element = Category::where('group_id', $GroupId)->get();

        return response()->json($element);
    }

    // Método para listar todos os descendentes de um elemento
    public function descendants($ElementId)
    {
        $element = Category::findOrFail($ElementId);
        $descendants = $element->descendants;

        return response()->json($descendants);
    }
}
