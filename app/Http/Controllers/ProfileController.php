<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
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
                'viewer_id' => $share->viewer_id,
                'viewer_name' => $share->viewer?->name,
                'viewer_email' => $share->viewer?->email,
                'created_at' => $share->created_at,
            ]);

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'noteShares' => $noteShares,
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
            ]);
        }

        if ((int) $viewer->id === (int) $request->user()->id) {
            return Redirect::route('profile.edit')->withErrors([
                'email' => 'You already have access to your own notes.',
            ]);
        }

        PrivateNoteShare::firstOrCreate([
            'owner_user_id' => $request->user()->id,
            'viewer_user_id' => $viewer->id,
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
}
