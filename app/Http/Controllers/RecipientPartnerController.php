<?php

namespace App\Http\Controllers;

use App\Models\RecipientPartner;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RecipientPartnerController extends Controller
{
    /**
     * Display a listing of the recipient's partners.
     */
    public function index($recipientId)
    {
        $partners = RecipientPartner::where('recipient_id', $recipientId)->get();
        return response()->json($partners);
    }

    /**
     * Store a newly created partner for a recipient.
     */
    public function store(Request $request, $recipientId)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'document' => 'required|string',
            'birth_date' => 'nullable|date',
            'monthly_income' => 'nullable|integer',
            'professional_occupation' => 'nullable|string',
            'self_declared_legal_representative' => 'boolean',
        ]);

        $partner = RecipientPartner::create(array_merge($validated, [
            'recipient_id' => $recipientId
        ]));

        return response()->json($partner, Response::HTTP_CREATED);
    }

    /**
     * Display the specified partner.
     */
    public function show($id)
    {
        $partner = RecipientPartner::findOrFail($id);
        return response()->json($partner);
    }

    /**
     * Update the specified partner.
     */
    public function update(Request $request, $id)
    {
        $partner = RecipientPartner::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'email' => 'sometimes|email',
            'document' => 'sometimes|string',
            'birth_date' => 'nullable|date',
            'monthly_income' => 'nullable|integer',
            'professional_occupation' => 'nullable|string',
            'self_declared_legal_representative' => 'boolean',
        ]);

        $partner->update($validated);

        return response()->json($partner);
    }

    /**
     * Remove the specified partner.
     */
    public function destroy($id)
    {
        $partner = RecipientPartner::findOrFail($id);
        $partner->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}