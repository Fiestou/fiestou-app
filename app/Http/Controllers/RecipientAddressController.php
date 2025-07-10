<?php

namespace App\Http\Controllers;

use App\Models\RecipientAddress;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RecipientAddressController extends Controller
{
    /**
     * Display a listing of the addresses for a recipient.
     */
    public function index($recipientId)
    {
        $addresses = RecipientAddress::where('recipient_id', $recipientId)->get();
        return response()->json($addresses);
    }

    /**
     * Store a newly created address.
     */
    public function store(Request $request, $recipientId)
    {
        $validated = $request->validate([
            'type' => 'required|in:Recipient,Partner',
            'partner_document' => 'nullable|string',
            'street' => 'required|string',
            'complementary' => 'nullable|string',
            'street_number' => 'required|string',
            'neighborhood' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'zip_code' => 'required|string',
            'reference_point' => 'nullable|string',
        ]);

        $address = RecipientAddress::create(array_merge($validated, [
            'recipient_id' => $recipientId
        ]));

        return response()->json($address, Response::HTTP_CREATED);
    }

    /**
     * Display the specified address.
     */
    public function show($id)
    {
        $address = RecipientAddress::findOrFail($id);
        return response()->json($address);
    }

    /**
     * Update the specified address.
     */
    public function update(Request $request, $id)
    {
        $address = RecipientAddress::findOrFail($id);

        $validated = $request->validate([
            'type' => 'sometimes|in:Recipient,Partner',
            'partner_document' => 'nullable|string',
            'street' => 'sometimes|string',
            'complementary' => 'nullable|string',
            'street_number' => 'sometimes|string',
            'neighborhood' => 'sometimes|string',
            'city' => 'sometimes|string',
            'state' => 'sometimes|string',
            'zip_code' => 'sometimes|string',
            'reference_point' => 'nullable|string',
        ]);

        $address->update($validated);

        return response()->json($address);
    }

    /**
     * Remove the specified address.
     */
    public function destroy($id)
    {
        $address = RecipientAddress::findOrFail($id);
        $address->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}