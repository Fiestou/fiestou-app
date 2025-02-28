<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Elements;
use App\Models\Group;
use App\Models\GroupElements;
use Illuminate\Support\Facades\DB;

class ElementsController extends Controller
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
            "group_id"    => "required|exists:group,id",
            "elements"    => "nullable|array",
            "elements.*"  => "exists:elements,id"
        ]);


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

        if (!$element){
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
    public function Update(Request $request, $id)
    {
        //
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
}
