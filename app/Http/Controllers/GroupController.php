<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Group;
use App\Models\GroupElements;
use App\Models\Elements;
use Illuminate\Support\Facades\DB;

class GroupController extends Controller
{
    /**
     * Create a new group.
     *
     * @return \Illuminate\Http\Response
     */
    public function Register(Request $request)
    {
        $request->validate([
            "name" => "required",
            "description" => "nullable|string",
            "isFather" => "required|boolean",
            "elements" => "nullable|array",
            "elements.*" => "exists:elements,id",
            "segment" => "nullable|boolean"
        ]);

        $group_father = Group::whereNull('parent_id')->where('active', 1)->first();

        if ($group_father && $request->get("isFather")) {
            return response()->json([
                'response' => false,
                'message' => 'Não é possível criar dois grupos gerais.'
            ]);
        }

        DB::beginTransaction();

        try {
            $group = new Group();
            $group->name = $request->name;
            $group->description = $request->description;
            $group->segment = $request->segment ?? false;
            
            if ($group->segment) {
                Group::where('segment', true)->update(['segment' => false]);
            }
            
            if (!$request->isFather) {
                $request->validate(["parent_id" => "required|exists:group,id"]);
                $group->parent_id = $request->parent_id;
            }

            if ($group->save()) {
                if (!empty($request->elements)) {
                    $elements = Elements::whereIn('id', $request->elements)->get();
                    foreach ($elements as $element) {
                        GroupElements::create([
                            'id_group' => $group->id,
                            'id_elements' => $element->id
                        ]);
                    }
                    $group->elements = $elements;
                }

                DB::commit();
                return response()->json([
                    'response' => true,
                    'data' => $group->load('elements')
                ]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'response' => false,
                'message' => 'Erro ao salvar o grupo: ' . $e->getMessage()
            ]);
        }

        DB::rollBack();
        return response()->json([
            'response' => false,
            'message' => 'Erro ao salvar o grupo.'
        ]);
    }

    /**
     * Get group with id.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function Get($GroupId)
    {
        $group = Group::with('elements')->find($GroupId);

        if (!$group) {
            return response()->json([
                'response' => false,
                'message'  => 'Não foi possivel encontrar o grupo.'
            ]);
        }

        $parent = null;

        if ($group->parent_id) {
            $parent = Group::where('id', $group->parent_id)->get();
            $group->parent = $parent;

            unset($group->parent_id);
        }

        return response()->json([
            'response' => true,
            'data'     => $group
        ]);
    }

    /**
     * Update the group with id.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $GroupId
     * @return \Illuminate\Http\Response
     */
    public function Update(Request $request, $GroupId)
    {
        DB::beginTransaction();

        try {
            $request->validate([
                "name" => "required",
                "description" => "nullable|string",
                "parent_id" => "nullable|exists:group,id",
                "elements" => "nullable|array",
                "elements.*" => "exists:elements,id",
                "segment" => "nullable|boolean",
            ]);

            // Log dos dados recebidos para debug
            \Log::info('Recebido request completo para Update:', [
                'all' => $request->all(),
                'content' => json_decode($request->getContent(), true),
                'segment_value' => $request->input('segment'),
                'segment_exists' => $request->has('segment'),
            ]);

            $group = Group::with('elements')->findOrFail($GroupId);
            
            // Valores indo na requisição
            $jsonData = json_decode($request->getContent(), true);
            $segmentValue = false;
            
            if (isset($jsonData['segment'])) {
                // Conversão para booleano
                $segmentValue = filter_var($jsonData['segment'], FILTER_VALIDATE_BOOLEAN);
                \Log::info('Segment encontrado no JSON:', ['raw' => $jsonData['segment'], 'converted' => $segmentValue]);
            }
            
            if ($segmentValue) {
                \Log::info('Atualizando outros grupos para segment=false');
                DB::table('group')
                    ->where('id', '!=', $GroupId)
                    ->where('segment', true)
                    ->update(['segment' => false]);
            }
            
            $updateFields = [
                'name' => $request->input('name'),
                'description' => $request->input('description'),
                'segment' => $segmentValue
            ];
            
            if ($request->has('parent_id')) {
                $updateFields['parent_id'] = $request->input('parent_id');
            }
            
            // Log antes da atualização
            \Log::info('Campos a serem atualizados:', $updateFields);
            
            $updated = DB::table('group')
                ->where('id', $GroupId)
                ->update($updateFields);
            
            \Log::info('Resultado da atualização:', ['updated' => $updated]);
            
            $group = Group::with('elements')->findOrFail($GroupId);
            
            if ($request->has("elements")) {
                $group->elements()->sync($request->elements);
            }

            DB::commit();

            return response()->json([
                'response' => true,
                'data' => $group
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erro ao atualizar grupo: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'response' => false,
                'message' => 'Erro ao atualizar o grupo: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * List groups.
     *
     * @param  int  $GroupId
     * @return \Illuminate\Http\Response
     */
    public function List()
    {
        $groups = Group::active()
            ->with('elements')
            ->get();

        foreach($groups as $group){
            if ($group->elements){
                foreach ($group->elements as $element){
                    $element->setAttribute('descendants', Elements::getElementDescendants($element->id, 1));
                }
            }
        }

        return response()->json([
            'response' => true,
            'data'     => $groups
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $GroupId
     * @return \Illuminate\Http\Response
     */
    public function Delete($GroupId)
    {
        try {
            $group = Group::where(['id' => $GroupId])->first();

            $group->active = false;

            if ($group->save()) {
                return response()->json([
                    'response' => true,
                    'message'     => 'ok'
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'response' => true,
                'message'     => 'Erro ao deletar o grupo' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get all descendents of the group.
     *
     * @param  int  $GroupId
     * @return \Illuminate\Http\Response
     */
    public function GetAllDescendants($GroupId)
    {
        try {
            return response()->json([
                'response' => true,
                'data'     =>  Group::getAllDescendants($GroupId, 1)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'response' => true,
                'message'     => 'Erro ao pegar de descendentes' . $e->getMessage()
            ]);
        }
    }

    /**
     * Delete relationship grupo and element.
     *
     * @param  int  $GroupId
     * @return \Illuminate\Http\Response
     */
    public function DeleteGroupElement($GroupId, $ElementId)
    {
        try {
            GroupElements::where('id_group', $GroupId)->where('id_elements', $ElementId)->delete();
            Elements::where('id', $ElementId)->delete();

            return response()->json([
                'response' => true,
                'data'     => 'OK'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'response' => true,
                'message'     => 'Erro ao deletar: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Delete relationship grupo and element.
     *
     * @param  int  $GroupId
     * @return \Illuminate\Http\Response
     */
    public function GetChildGroupWithElements($GroupId)
    {
        try {
            $groupChild = Group::with('elements')->where('parent_id', $GroupId)->first();

            return response()->json([
                'response' => true,
                'data'     => $groupChild
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'response' => true,
                'message'     => 'Erro ao pegar de descendentes' . $e->getMessage()
            ]);
        }
    }
}
