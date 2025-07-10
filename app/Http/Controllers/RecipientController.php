<?php

namespace App\Http\Controllers;

use App\Models\Recipient;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class RecipientController extends Controller
{
    /**
     * Display a listing of the recipients.
     */
    public function index()
    {
        $recipients = Recipient::all();
        return response()->json($recipients);
    }

    /**
     * Store a newly created recipient.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'partner_id' => 'required|uuid',
            'code' => 'required|string',
            'type_enum' => 'required|in:PF,PJ',
            'email' => 'required|email',
            'document' => 'required|string',
            'type' => 'required|string',
            'company_name' => 'nullable|string',
            'trading_name' => 'nullable|string',
            'annual_revenue' => 'nullable|integer',
            'name' => 'required|string',
            'birth_date' => 'nullable|date',
            'monthly_income' => 'nullable|integer',
            'professional_occupation' => 'nullable|string'
        ]);

        $recipient = Recipient::create(array_merge($validated, [
            'id' => Str::uuid()
        ]));

        return response()->json($recipient, Response::HTTP_CREATED);
    }

    /**
     * Display the specified recipient.
     */
    public function show(string $id)
    {
        $recipient = Recipient::findOrFail($id);
        return response()->json($recipient);
    }

    /**
     * Update the specified recipient.
     */
    public function update(Request $request, string $id)
    {
        $recipient = Recipient::findOrFail($id);

        $validated = $request->validate([
            'partner_id' => 'sometimes|uuid',
            'code' => 'sometimes|string',
            'type_enum' => 'sometimes|in:PF,PJ',
            'email' => 'sometimes|email',
            'document' => 'sometimes|string',
            'type' => 'sometimes|string',
            'company_name' => 'nullable|string',
            'trading_name' => 'nullable|string',
            'annual_revenue' => 'nullable|integer',
            'name' => 'sometimes|string',
            'birth_date' => 'nullable|date',
            'monthly_income' => 'nullable|integer',
            'professional_occupation' => 'nullable|string'
        ]);

        $recipient->update($validated);

        return response()->json($recipient);
    }

    /**
     * Remove the specified recipient.
     */
    public function destroy(string $id)
    {
        $recipient = Recipient::findOrFail($id);
        $recipient->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}