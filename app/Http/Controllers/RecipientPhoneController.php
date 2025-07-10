<?php

namespace App\Http\Controllers;

use App\Models\RecipientPhone;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RecipientPhoneController extends Controller
{
    /**
     * Display a listing of the phones for a recipient.
     */
    public function index($recipientId)
    {
        $phones = RecipientPhone::where('recipient_id', $recipientId)->get();
        return response()->json($phones);
    }

    /**
     * Store a newly created phone for a recipient.
     */
    public function store(Request $request, $recipientId)
    {
        $validated = $request->validate([
            'type' => 'required|in:Recipient,Partner',
            'partner_document' => 'nullable|string',
            'area_code' => 'required|string',
            'number' => 'required|string',
        ]);

        $phone = RecipientPhone::create(array_merge($validated, [
            'recipient_id' => $recipientId
        ]));

        return response()->json($phone, Response::HTTP_CREATED);
    }

    /**
     * Display the specified phone.
     */
    public function show($id)
    {
        $phone = RecipientPhone::findOrFail($id);
        return response()->json($phone);
    }

    /**
     * Update the specified phone.
     */
    public function update(Request $request, $id)
    {
        $phone = RecipientPhone::findOrFail($id);

        $validated = $request->validate([
            'type' => 'sometimes|in:Recipient,Partner',
            'partner_document' => 'nullable|string',
            'area_code' => 'sometimes|string',
            'number' => 'sometimes|string',
        ]);

        $phone->update($validated);

        return response()->json($phone);
    }

    /**
     * Remove the specified phone.
     */
    public function destroy($id)
    {
        $phone = RecipientPhone::findOrFail($id);
        $phone->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
