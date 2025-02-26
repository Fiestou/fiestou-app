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
     * Show the form for creating a new resource.
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

        if (empty($request->get("elements"))) {
            return response()->json([
                'response' => false,
                'message'  => 'É preciso informar pelo menos um elemento para salvar o grupo.'
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

                $elements = Elements::whereIn('id', $request->get('elements'))->get();

                foreach ($elements as $element) {
                    GroupElements::create([
                        'id_group'    => $group->id,
                        'id_elements' => $element->id
                    ]);
                }

                $group->elements = $elements;

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
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function Get($id)
    {
        $group = Group::with('elements.element')->find($id);

        if (!$group) {
            return response()->json([
                'response' => false,
                'message'  => 'Não foi possivel encontrar o grupo.'
            ]);
        }

        $elements = $group->elements->map(function ($groupElement) {
            return $groupElement->element;
        });

        return response()->json([
            'response' => true,
            'data'     => [
                'id'       => $group->id,
                'name'     => $group->name,
                'parent_id' => $group->parent_id,
                'elements' => $elements
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function Update(Request $request, $id)
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

            $group = Group::with('elements.element')->find($id);

            if ($request->has("parent_id")) {
                $group->parent_id = $request->get("parent_id");
            }

            $group->name = $request->get("name");
            $group->description = $request->get("description");
            $group->save();

            if ($request->has("elements")) {
                $elements = $request->get("elements");

                GroupElements::where('id_group', $id)->delete();

                foreach ($elements as $elementId) {
                    GroupElements::create([
                        'id_group'    => $id,
                        'id_elements' => $elementId
                    ]);
                }
            }

            $elements = $group->elements->map(function ($groupElement) {
                return $groupElement->element;
            });

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
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function List()
    {
        return response()->json([
            'response' => true,
            'data'     => Group::all()
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function Delete($id)
    {
        try {
            $group = Group::where(['id' => $id])->first();

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
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function GetAllDescendants($id)
    {
        try {
            return response()->json([
                'response' => true,
                'data'     =>  Group::getAllDescendants($id, 1)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'response' => true,
                'message'     => 'Erro ao pegar de descendentes' . $e->getMessage()
            ]);
        }
    }
}
