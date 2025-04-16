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
        ]);

        $group->update($validated);

        return response()->json($group);
    }

    // Método para deletar um grupo
    public function Delete($GroupId)
    {
        $group = Group::findOrFail($GroupId);
        $group->delete();

        return response()->json(null, 204); // Retorna uma resposta vazia com status 204
    }

    // Método para obter todos os descendentes de um grupo
    // Este método só é válido se você tiver algum tipo de hierarquia de grupos
    public function GetAllDescendants($GroupId)
    {
        // Aqui você precisará de lógica para buscar os descendentes
        // O código será dependente da sua estrutura de dados

        $group = Group::findOrFail($GroupId);

        // Exemplo de resposta sem lógica de descendentes, apenas retorna o grupo
        return response()->json($group);
    }

    // Método para deletar um elemento de um grupo (se aplicável)
    // Caso você tenha um relacionamento de elementos dentro do grupo
    public function DeleteGroupElement($GroupId, $ElementId)
    {
        // Se não houver elementos dentro do grupo, essa rota pode ser removida
        return response()->json(['message' => 'Não aplicável para este modelo de grupo'], 400);
    }
}
