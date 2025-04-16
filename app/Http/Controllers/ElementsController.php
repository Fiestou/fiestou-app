<?php

namespace App\Http\Controllers;

use App\Models\Element;

// Ensure the Element model exists in the App\Models directory
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
class ElementsController extends Controller
{
    // Método para registrar um novo elemento com validação adicional
    public function register(Request $request)
    {
        Log::info('Register method called', ['request' => $request->all()]);

        $request->validate([
            'name' => 'required|string|max:255|unique:elements,name',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'group_id' => 'required|exists:group,id',
            'active' => 'required|boolean',
            'element_related_id' => 'nullable|exists:elements,id',
        ]);

        Log::info('Validation passed', ['validated_data' => $request->all()]);

        $element = Element::create([
            'name' => $request->name,
            'description' => $request->description,
            'icon' => $request->icon,
            'group_id' => $request->group_id,
            'active' => $request->active,
            'element_related_id' => $request->element_related_id, // Adicionando elemento relacionado
        ]);

        Log::info('Element created successfully', ['element' => $element]);

        return response()->json($element, 201);
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
        $element = Element::create([
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
        $element = Element::where('group_id', $GroupId)->findOrFail($ElementId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'active' => 'required|boolean',
        ]);

        $element->update($validated);

        return response()->json($element);
    }

    // Método para excluir um elemento específico
    public function destroy($GroupId, $ElementId)
    {
        $element = Element::where('group_id', $GroupId)->findOrFail($ElementId);

        $element->delete();

        return response()->json(null, 204); // Retorna resposta vazia com status 204
    }

    // Método para listar todos os elementos de um grupo
    public function index($GroupId)
    {
        $element = Element::where('group_id', $GroupId)->get();

        return response()->json($element);
    }

    // Método para listar todos os descendentes de um elemento
    public function descendants($ElementId)
    {
        $element = Element::findOrFail($ElementId);
        $descendants = $element->descendants;

        return response()->json($descendants);
    }
}
