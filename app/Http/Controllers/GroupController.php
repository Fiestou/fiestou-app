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
        $request->validate([
            "name"        => "required",
            "description" => "required",
            "isFather"    => "required|boolean"
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
        $group = Group::where(['id'=> $id])->first();

        if (!$group){
            return response()->json([
                'response' => false,
                'message'  => 'Não foi possivel encontrar o grupo.'
            ]);
        }
        return response()->json([
            'response' => true,
            'data'     => $group
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
        try{
            $request->validate([
                "name"        => "required",
                "description" => "required",
                "parent_id" => "nullable|exists:group,id"
            ]);

            $group = Group::where(['id'=> $id])->first();

            if($request->get("parent_id")) $group->parent_id = $request->get("parent_id");

            $group->name = $request->get("name");
            $group->description = $request->get("description");

            if ($group->save()) {
                DB::commit();

                return response()->json([
                    'response' => true,
                    'data'     => $group
                ]);
            }
        }catch (\Exception $e){
            DB::rollBack();
            return response()->json([
                'response' => false,
                'message'  => 'Erro ao salvar o grupo: ' . $e->getMessage()
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
    {   try{
            $group = Group::where(['id'=> $id])->first();

            $group->is_active = false;

            if ($group->save()){
                return response()->json([
                    'response' => true,
                    'message'     => 'ok'
                ]);
            }
        }catch (\Exception $e){
            return response()->json([
                'response' => true,
                'message'     => 'erro ao deletar o grupo'
            ]);
        }
    }
}
