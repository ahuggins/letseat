<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExtensionTokenController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tokens = $request->user()
            ->tokens()
            ->where('name', 'like', 'chrome-extension:%')
            ->orderByDesc('id')
            ->get(['id', 'name', 'abilities', 'last_used_at', 'created_at'])
            ->map(fn ($token) => [
                'id' => $token->id,
                'name' => $token->name,
                'abilities' => $token->abilities,
                'last_used_at' => $token->last_used_at,
                'created_at' => $token->created_at,
            ])
            ->values();

        return response()->json([
            'tokens' => $tokens,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:80'],
        ]);

        $label = trim((string) ($validated['name'] ?? ''));
        $label = $label !== '' ? $label : now()->format('Y-m-d H:i');

        $tokenName = 'chrome-extension:'.$label;

        $token = $request->user()->createToken($tokenName, [
            'extension:me',
            'recipe:preview',
            'recipe:import',
        ]);

        return response()->json([
            'token' => $token->plainTextToken,
            'name' => $tokenName,
            'message' => 'Copy this token now. You will not be able to see it again.',
        ], 201);
    }

    public function destroy(Request $request, int $tokenId): JsonResponse
    {
        $deleted = $request->user()->tokens()->where('id', $tokenId)->delete();

        if (! $deleted) {
            return response()->json([
                'message' => 'Token not found.',
            ], 404);
        }

        return response()->json([
            'revoked' => true,
        ]);
    }
}
