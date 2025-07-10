<?php

namespace App\Http\Controllers;

use App\Models\RecipientConfig;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RecipientConfigController extends Controller
{
    /**
     * Display the recipient's configuration.
     */
    public function show($recipientId)
    {
        $config = RecipientConfig::where('recipient_id', $recipientId)->firstOrFail();
        return response()->json($config);
    }

    /**
     * Update the recipient's configuration.
     */
    public function update(Request $request, $recipientId)
    {
        $config = RecipientConfig::where('recipient_id', $recipientId)->firstOrFail();

        $validated = $request->validate([
            'transfer_enabled' => 'boolean',
            'transfer_interval' => 'string',
            'transfer_day' => 'integer',
            'anticipation_enabled' => 'boolean',
            'anticipation_type' => 'nullable|in:full,1025',
            'anticipation_volume_percentage' => 'nullable|string',
            'anticipation_days' => 'nullable|string',
            'anticipation_delay' => 'nullable|string',
        ]);

        $config->update($validated);

        return response()->json($config);
    }
}
