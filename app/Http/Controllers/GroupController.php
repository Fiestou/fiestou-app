<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Group;
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
        Log::debug(['ola']);

        $request->validate([
            "name"   => "required",
            "description" => 'required',
            "isFather" => 'required'
        ]);

        $group_father = Group::where(['parent_id' == null]);
        Log::debug([$group_father, 'ola']);
        if ($group_father && $request->get("isFather")){
            return response()->json([
                'response'  => false,
                'message' => 'Não é possivel criar dois grupos gerais.'
            ]);
        }

        $group = new Group();

        if (!$request->get("isFather")){
            $request->validate([
                "parent_id"   => "required",
            ]);

            $group->parent_id = $request->get('parent_id');
        }

        $group->name = $request->get("name");
        $group->description = $request->get("description");

        DB::beginTransaction();

        if ($group->save()){
            $exists_parent = Group::where(['id' == $group->parent_id]);

            if (!$exists_parent){
                DB::rollBack();
                return response()->json([
                    'response'  => false,
                    'message' => 'Parent id não existe.'
                ]);
            }

            if ($exists_parent->id == $group->id){
                DB::rollBack();
                return response()->json([
                    'response'  => false,
                    'message' => 'Parent id não não pode ser igual ao id.'
                ]);
            }

            DB::commit();

            return response()->json([
                'response'  => true,
                'data'      => $group
            ]);
        }else{
            DB::rollBack();

            return response()->json([
                'response'  => false
            ]);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function get($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function list($id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function delete($id)
    {
        //
    }
}
