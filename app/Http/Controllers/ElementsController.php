<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Elements;
use App\Models\GroupElements;
use App\Models\Group;
use App\Models\ElementsRel;
use Illuminate\Support\Facades\DB;

class ElementsController extends Controller
{
    /**
     * Register element
     *
     * @return \Illuminate\Http\Response
     */
    public function Register(Request $request)
    {
        try {
            DB::beginTransaction();

            $request->validate([
                "name"           => "required",
                "description"    => "required",
                "id_group"       => "required|exists:group,id",
                "childElements"  => "nullable|array",
                "childElements.*" => "exists:elements,id"
            ]);

            $element = new Elements();

            if (!$element) {
                DB::rollBack();
                return response()->json([
                    'response' => false,
                    'message'  => 'Elemento não encontrado.'
                ]);
            }

            $element->name = $request->get("name");
            $element->description = $request->get("description");

            if (!$element->save()) {
                DB::rollBack();
                return response()->json([
                    'response' => false,
                    'message'  => 'Erro ao salvar o elemento.'
                ]);
            }

            GroupElements::where('id_group', $request->get("id_group"))
                ->where('id_elements', $element->id)
                ->delete();

            GroupElements::Create([
                'id_elements' => $element->id,
                'id_group'  => $request->get("id_group")
            ]);

            if ($request->has("childElements")) {
                $childElements = $request->get("childElements");

                ElementsRel::where('parent_id', $element->id)->delete();

                foreach ($childElements as $childElementId) {
                    ElementsRel::create([
                        'parent_id' => $element->id,
                        'child_id'  => $childElementId
                    ]);
                }
            }

            DB::commit();

            $descendents = Elements::getElementDescendants($element->id, 1);
            $element->descendents = $descendents;

            return response()->json([
                'response' => true,
                'data'     => $element
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'response' => false,
                'message'  => 'Erro ao atualizar o elemento: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get element by id.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function Get($ElementId)
    {
        $element = Elements::where(['id' => $ElementId])->first();

        if (!$element) {
            return response()->json([
                'response' => false,
                'message'  => 'Não foi possivel encontrar o elemento.'
            ]);
        }

        $descendents = Elements::getElementDescendants($ElementId, 1);

        $element->descendents = $descendents;

        return response()->json([
            'response' => true,
            'data'     => $element
        ]);
    }

    /**
     * List all element.
     *
     * @return \Illuminate\Http\Response
     */
    public function List()
    {
        return response()->json([
            'response' => true,
            'data'     => Elements::all()
        ]);
    }

    /**
     * Update element by id.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function Update(Request $request, $ElementId)
    {
        try {
            DB::beginTransaction();

            $request->validate([
                "name"           => "required",
                "description"    => "required",
                "childElements"  => "nullable|array",
                "childElements.*" => "exists:elements,id"
            ]);

            $element = Elements::find($ElementId);

            if (!$element) {
                DB::rollBack();
                return response()->json([
                    'response' => false,
                    'message'  => 'Elemento não encontrado.'
                ]);
            }

            $element->name = $request->get("name");
            $element->description = $request->get("description");

            if (!$element->save()) {
                DB::rollBack();
                return response()->json([
                    'response' => false,
                    'message'  => 'Erro ao salvar o elemento.'
                ]);
            }

            if ($request->has("childElements")) {
                $childElements = $request->get("childElements");

                ElementsRel::where('parent_id', $ElementId)->delete();

                foreach ($childElements as $childElementId) {
                    if ($ElementId != $childElementId) {
                        ElementsRel::create([
                            'parent_id' => $ElementId,
                            'child_id'  => $childElementId
                        ]);
                    }
                }
            }

            DB::commit();

            $descendents = Elements::getElementDescendants($ElementId, 1);
            $element->descendents = $descendents;

            return response()->json([
                'response' => true,
                'data'     => $element
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'response' => false,
                'message'  => 'Erro ao atualizar o elemento: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Delete element by id.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function Delete($ElementId)
    {
        try {
            $element = Elements::where(['id' => $ElementId])->first();

            $element->active = false;

            ElementsRel::where('parent_id', $ElementId)->delete();

            if ($element->save()) {
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
     * Get all Descendants by parent id
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */

    public function GetAllDescendants($ElementId)
    {

        $descendants = Elements::getElementDescendants($ElementId, 1);

        foreach ($descendants as $descendant) {
            $groupElement = GroupElements::where('id_elements', $descendant->id)->first();

            $group = Group::where('id', $groupElement->id_group)->first();

            $descendant->group = $group;
        };

        try {
            return response()->json([
                'response' => true,
                'data'     =>  $descendants
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'response' => true,
                'message'     => 'Erro ao pegar de descendentes' . $e->getMessage()
            ]);
        }
    }
}
