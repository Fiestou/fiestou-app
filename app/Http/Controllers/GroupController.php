<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Group;
use App\Models\GroupElements;
use App\Models\Elements;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
            "name"        => "required",
            "description" => "required",
            "isFather"    => "required|boolean",
            "elements"    => "nullable|array",
            "elements.*"  => "exists:elements,id"
        ]);

        $group_father = Group::whereNull('parent_id')->first();

        if ($group_father && $request->get("isFather")) {
            return response()->json([
                'response' => false,
                'message'  => 'Não é possível criar dois grupos gerais.'
            ]);
        }

        $group = new Group();
        $group->name = $request->get("name");
        $group->description = $request->get("description");

        DB::beginTransaction();

        try {

            if ($group->save()) {
                if (!$request->get("isFather")) {
                    $request->validate([
                        "parent_id" => "required|exists:group,id",
                    ]);

                    $group->parent_id = $request->get('parent_id');
                    $group->save();
                }

                if (!empty($request->get("elements"))) {
                    $elements = Elements::whereIn('id', $request->get('elements'))->get();

                    foreach ($elements as $element) {
                        GroupElements::create([
                            'id_group'    => $group->id,
                            'id_elements' => $element->id
                        ]);
                    }

                    $group->elements = $elements;
                }

                DB::commit();

                return response()->json([
                    'response' => true,
                    'data'     => $group
                ]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'response' => false,
                'message'  => 'Erro ao salvar o grupo: ' . $e->getMessage()
            ]);
        }

        DB::rollBack();
        return response()->json([
            'response' => false,
            'message'  => 'Erro ao salvar o grupo.'
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

        if ($group->parent_id){
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
                "name"        => "required",
                "description" => "required",
                "parent_id"   => "nullable|exists:group,id",
                "elements"    => "nullable|array",
                "elements.*"  => "exists:elements,id"
            ]);

            $group = Group::with('elements')->find($GroupId);

            if ($request->has("parent_id")) {
                $group->parent_id = $request->get("parent_id");
            }

            $group->name = $request->get("name");
            $group->description = $request->get("description");
            $group->save();

            $elements = [];

            if ($request->has("elements")) {
                $elementsIds = $request->get("elements");

                GroupElements::where('id_group', $GroupId)->delete();

                foreach ($elementsIds as $elementId) {
                    GroupElements::create([
                        'id_group'    => $GroupId,
                        'id_elements' => $elementId
                    ]);

                    $element = Elements::where('id', $elementId)->first();

                    array_push($elements, $element);
                }

                $group->elements = $elements;
            }

            DB::commit();

            return response()->json([
                'response' => true,
                'data'     => [
                    'id'       => $group->id,
                    'name'     => $group->name,
                    'parent_id' => $group->parent_id,
                    'elements' => $elements
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'response' => false,
                'message'  => 'Erro ao atualizar o grupo: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Remove group with id.
     *
     * @param  int  $GroupId
     * @return \Illuminate\Http\Response
     */
    public function List()
    {
        $groups = Group::with('elements')->get();

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
}
