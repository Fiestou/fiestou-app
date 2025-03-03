<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Elements;
use App\Models\Group;
use App\Models\GroupElements;
use App\Models\ElementsRel;
use Dom\Element;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ElementsController extends Controller
{
    /**
     * Show the form for creating a new resource.
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
                "childElements.*"=> "exists:elements,id"
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
     * Display the specified resource.
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
     * Display a listing of the resource.
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
     * Update the specified resource in storage.
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
                "childElements.*"=> "exists:elements,id"
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
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function Delete($id)
    {
        //
    }

    public function GetAllDescendants($ElementId)
    {
        try {
            return response()->json([
                'response' => true,
                'data'     =>  Elements::getElementDescendants($ElementId, 1)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'response' => true,
                'message'     => 'Erro ao pegar de descendentes' . $e->getMessage()
            ]);
        }
    }
}
