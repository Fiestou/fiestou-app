<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\models;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Element;

class GroupController extends Controller
{

    public function List()
    {
        Log::info('Iniciando o método List() para buscar grupos e elementos.');

        // Busca os grupos ativos e carrega os elementos relacionados
        $groups = Group::active()->with('elements')->get();

        // Logando a quantidade de grupos encontrados
        Log::info('Total de grupos encontrados: ' . $groups->count());

        // Logando o fim do processamento
        Log::info('Processamento dos grupos e elementos concluído.');

        // Monta a resposta no formato especificado
        $response = [
            'response' => true,
            'data' => $groups
        ];

        // Retorna os grupos com os elementos
        return response()->json($response);
    }
    // Método para registrar um novo grupo
    public function Register(Request $request)
    {
        Log::info('Este é um teste de log.');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'active' => 'required|boolean',
            "segment" => "nullable|boolean",
        ]);

        $group = Group::create($validated);

        return response()->json($group, 201); // Retorna o grupo criado com status 201
    }

    // Método para atualizar um grupo existente
    public function Update(Request $request, $GroupId)
    {
        $group = Group::findOrFail($GroupId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'active' => 'required|boolean',
            "segment" => "nullable|boolean",
        ]);

        $group->update($validated);

        return response()->json($group);
    }

    // Método para deletar um grupo
    public function Delete($GroupId)
    {
        $group = Group::findOrFail($GroupId);
        $group->delete();

        $response = [
            'response' => true,
            'data' => $GroupId
        ];
        return response()->json($response);// Retorna uma resposta vazia com status 204
    }

    // Método para obter todos os descendentes de um grupo
    // Este método só é válido se você tiver algum tipo de hierarquia de grupos
    public function GetAllDescendants($GroupId)
    {
        // Aqui você precisará de lógica para buscar os descendentes
        // O código será dependente da sua estrutura de dados

        $group = Group::findOrFail($GroupId);

        $response = [
            'response' => true,
            'data' => $GroupId
        ];
        // Exemplo de resposta sem lógica de descendentes, apenas retorna o grupo
        return response()->json($response);
    }

    // Método para deletar um elemento de um grupo (se aplicável)
    // Caso você tenha um relacionamento de elementos dentro do grupo
    public function DeleteGroupElement($GroupId, $ElementId)
    {
        // Encontrar o grupo pelo ID
        $group = Group::find($GroupId);
    
        // Se o grupo não existir, retorna erro
        if (!$group) {
            return response()->json([
                'response' => 404,
                'message' => 'Grupo não encontrado'
            ], 404);
        }
    
        // Encontrar o elemento pelo ID e pelo ID do grupo
        $element = Element::where('id', $ElementId)->where('group_id', $GroupId)->first();
    
        // Se o elemento não for encontrado dentro do grupo, retorna erro
        if (!$element) {
            return response()->json([
                'response' => 404,
                'message' => 'Elemento não encontrado neste grupo'
            ], 404);
        }
    
        // Caso o elemento seja encontrado, podemos removê-lo
        try {
            $element->delete();
    
            // Retornar a resposta com a estrutura solicitada
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
