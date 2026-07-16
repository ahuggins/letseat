<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\PantryShare;
use App\Models\PrivateNoteShare;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $noteShares = $request->user()
            ->noteSharesGiven()
            ->with('viewer:id,name,email')
            ->orderBy('created_at')
            ->get()
            ->map(fn ($share) => [
                'id' => $share->id,
                'viewer_id' => $share->viewer_user_id,
                'viewer_name' => $share->viewer?->name,
                'viewer_email' => $share->viewer?->email,
                'status' => $share->status,
                'accepted_at' => $share->accepted_at,
                'created_at' => $share->created_at,
            ]);

        $noteIncomingInvites = $request->user()
            ->noteSharesReceived()
            ->with('owner:id,name,email')
            ->where('status', PrivateNoteShare::STATUS_PENDING)
            ->orderBy('created_at')
            ->get()
            ->map(fn ($share) => [
                'id' => $share->id,
                'owner_id' => $share->owner_user_id,
                'owner_name' => $share->owner?->name,
                'owner_email' => $share->owner?->email,
                'created_at' => $share->created_at,
            ]);

        $noteSharesReceived = $request->user()
            ->noteSharesReceived()
            ->with('owner:id,name,email')
            ->where('status', PrivateNoteShare::STATUS_ACCEPTED)
            ->orderBy('created_at')
            ->get()
            ->map(fn ($share) => [
                'id' => $share->id,
                'owner_id' => $share->owner_user_id,
                'owner_name' => $share->owner?->name,
                'owner_email' => $share->owner?->email,
                'accepted_at' => $share->accepted_at,
                'created_at' => $share->created_at,
            ]);

        $pantryShares = $request->user()
            ->pantrySharesGiven()
            ->with('viewer:id,name,email')
            ->get()
            ->map(fn ($share) => [
                'id' => $share->id,
                'viewer_id' => $share->viewer_id,
                'viewer_name' => $share->viewer?->name,
                'viewer_email' => $share->viewer?->email,
                'status' => $share->status,
                'accepted_at' => $share->accepted_at,
                'created_at' => $share->created_at,
            ]);

        $pantryIncomingInvites = $request->user()
            ->pantrySharesReceived()
            ->with('owner:id,name,email')
            ->where('status', PantryShare::STATUS_PENDING)
            ->get()
            ->map(fn ($share) => [
                'id' => $share->id,
                'owner_id' => $share->owner_user_id,
                'owner_name' => $share->owner?->name,
                'owner_email' => $share->owner?->email,
                'created_at' => $share->created_at,
            ]);

        $pantrySharesReceived = $request->user()
            ->pantrySharesReceived()
            ->with('owner:id,name,email')
            ->where('status', PantryShare::STATUS_ACCEPTED)
            ->get()
            ->map(fn ($share) => [
                'id' => $share->id,
                'owner_id' => $share->owner_user_id,
                'owner_name' => $share->owner?->name,
                'owner_email' => $share->owner?->email,
                'accepted_at' => $share->accepted_at,
                'created_at' => $share->created_at,
            ]);

        $extensionTokens = $request->user()
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

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'noteShares' => $noteShares,
            'noteIncomingInvites' => $noteIncomingInvites,
            'noteSharesReceived' => $noteSharesReceived,
            'pantryShares' => $pantryShares,
            'pantryIncomingInvites' => $pantryIncomingInvites,
            'pantrySharesReceived' => $pantrySharesReceived,
            'extensionTokens' => $extensionTokens,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    public function storeNoteShare(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $viewer = User::query()->where('email', $validated['email'])->first();

        if (! $viewer) {
            return Redirect::route('profile.edit')->withErrors([
                'email' => 'No user found with that email address.',
            ], 'storeNoteShare');
        }

        if ((int) $viewer->id === (int) $request->user()->id) {
            return Redirect::route('profile.edit')->withErrors([
                'email' => 'You already have access to your own notes.',
            ], 'storeNoteShare');
        }

        $existingShare = PrivateNoteShare::query()
            ->where('owner_user_id', $request->user()->id)
            ->where('viewer_user_id', $viewer->id)
            ->first();

        if ($existingShare && $existingShare->status === PrivateNoteShare::STATUS_ACCEPTED) {
            return Redirect::route('profile.edit');
        }

        $reverseShare = PrivateNoteShare::query()
            ->where('owner_user_id', $viewer->id)
            ->where('viewer_user_id', $request->user()->id)
            ->first();

        if ($reverseShare && $reverseShare->status === PrivateNoteShare::STATUS_ACCEPTED) {
            return Redirect::route('profile.edit');
        }

        if ($reverseShare && $reverseShare->status === PrivateNoteShare::STATUS_PENDING) {
            return Redirect::route('profile.edit')->withErrors([
                'email' => 'This user already invited you to share notes. Accept their invite below.',
            ], 'storeNoteShare');
        }

        PrivateNoteShare::updateOrCreate([
            'owner_user_id' => $request->user()->id,
            'viewer_user_id' => $viewer->id,
        ], [
            'status' => PrivateNoteShare::STATUS_PENDING,
            'accepted_at' => null,
        ]);

        return Redirect::route('profile.edit');
    }

    public function destroyNoteShare(Request $request, User $viewer): RedirectResponse
    {
        PrivateNoteShare::query()
            ->where('owner_user_id', $request->user()->id)
            ->where('viewer_user_id', $viewer->id)
            ->delete();

        return Redirect::route('profile.edit');
    }

    public function acceptNoteShare(Request $request, User $owner): RedirectResponse
    {
        PrivateNoteShare::query()
            ->where('owner_user_id', $owner->id)
            ->where('viewer_user_id', $request->user()->id)
            ->where('status', PrivateNoteShare::STATUS_PENDING)
            ->update([
                'status' => PrivateNoteShare::STATUS_ACCEPTED,
                'accepted_at' => now(),
            ]);

        return Redirect::route('profile.edit');
    }

    public function declineNoteShare(Request $request, User $owner): RedirectResponse
    {
        PrivateNoteShare::query()
            ->where('owner_user_id', $owner->id)
            ->where('viewer_user_id', $request->user()->id)
            ->where('status', PrivateNoteShare::STATUS_PENDING)
            ->delete();

        return Redirect::route('profile.edit');
    }

    public function leaveNoteShare(Request $request, User $owner): RedirectResponse
    {
        PrivateNoteShare::query()
            ->where('owner_user_id', $owner->id)
            ->where('viewer_user_id', $request->user()->id)
            ->where('status', PrivateNoteShare::STATUS_ACCEPTED)
            ->delete();

        return Redirect::route('profile.edit');
    }

    public function storePantryShare(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $viewer = User::query()->where('email', $validated['email'])->first();

        if (! $viewer) {
            return Redirect::route('profile.edit')->withErrors([
                'email' => 'No user found with that email address.',
            ], 'storePantryShare');
        }

        if ((int) $viewer->id === (int) $request->user()->id) {
            return Redirect::route('profile.edit')->withErrors([
                'email' => 'You already have access to your own pantry.',
            ], 'storePantryShare');
        }

        $existingShare = PantryShare::query()
            ->where('owner_user_id', $request->user()->id)
            ->where('viewer_user_id', $viewer->id)
            ->first();

        if ($existingShare && $existingShare->status === PantryShare::STATUS_ACCEPTED) {
            return Redirect::route('profile.edit');
        }

        $reverseShare = PantryShare::query()
            ->where('owner_user_id', $viewer->id)
            ->where('viewer_user_id', $request->user()->id)
            ->first();

        if ($reverseShare && $reverseShare->status === PantryShare::STATUS_ACCEPTED) {
            return Redirect::route('profile.edit');
        }

        if ($reverseShare && $reverseShare->status === PantryShare::STATUS_PENDING) {
            return Redirect::route('profile.edit')->withErrors([
                'email' => 'This user already invited you. Accept their invite below.',
            ], 'storePantryShare');
        }

        PantryShare::updateOrCreate([
            'owner_user_id' => $request->user()->id,
            'viewer_user_id' => $viewer->id,
        ], [
            'status' => PantryShare::STATUS_PENDING,
            'accepted_at' => null,
        ]);

        return Redirect::route('profile.edit');
    }

    public function destroyPantryShare(Request $request, User $viewer): RedirectResponse
    {
        PantryShare::query()
            ->where('owner_user_id', $request->user()->id)
            ->where('viewer_user_id', $viewer->id)
            ->delete();

        return Redirect::route('profile.edit');
    }

    public function acceptPantryShare(Request $request, User $owner): RedirectResponse
    {
        PantryShare::query()
            ->where('owner_user_id', $owner->id)
            ->where('viewer_user_id', $request->user()->id)
            ->where('status', PantryShare::STATUS_PENDING)
            ->update([
                'status' => PantryShare::STATUS_ACCEPTED,
                'accepted_at' => now(),
            ]);

        return Redirect::route('profile.edit');
    }

    public function declinePantryShare(Request $request, User $owner): RedirectResponse
    {
        PantryShare::query()
            ->where('owner_user_id', $owner->id)
            ->where('viewer_user_id', $request->user()->id)
            ->where('status', PantryShare::STATUS_PENDING)
            ->delete();

        return Redirect::route('profile.edit');
    }

    public function leavePantryShare(Request $request, User $owner): RedirectResponse
    {
        PantryShare::query()
            ->where('owner_user_id', $owner->id)
            ->where('viewer_user_id', $request->user()->id)
            ->where('status', PantryShare::STATUS_ACCEPTED)
            ->delete();

        return Redirect::route('profile.edit');
    }
}
