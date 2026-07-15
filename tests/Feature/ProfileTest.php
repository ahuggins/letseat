<?php

use App\Models\PantryShare;
use App\Models\PantryStaple;
use App\Models\User;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/profile');

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/profile', [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    $user->refresh();

    $this->assertSame('Test User', $user->name);
    $this->assertSame('test@example.com', $user->email);
    $this->assertNull($user->email_verified_at);
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/profile', [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    $this->assertNotNull($user->refresh()->email_verified_at);
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete('/profile', [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/');

    $this->assertGuest();
    $this->assertNull($user->fresh());
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/profile')
        ->delete('/profile', [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect('/profile');

    $this->assertNotNull($user->fresh());
});

test('user can share pantry with another user by email', function () {
    $owner = User::factory()->create();
    $viewer = User::factory()->create();

    $response = $this
        ->actingAs($owner)
        ->post('/profile/pantry-shares', [
            'email' => $viewer->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    $this->assertDatabaseHas('pantry_shares', [
        'owner_user_id' => $owner->id,
        'viewer_user_id' => $viewer->id,
        'status' => PantryShare::STATUS_PENDING,
    ]);
});

test('user can stop sharing pantry with another user', function () {
    $owner = User::factory()->create();
    $viewer = User::factory()->create();

    PantryShare::create([
        'owner_user_id' => $owner->id,
        'viewer_user_id' => $viewer->id,
    ]);

    $response = $this
        ->actingAs($owner)
        ->delete("/profile/pantry-shares/{$viewer->id}");

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    $this->assertDatabaseMissing('pantry_shares', [
        'owner_user_id' => $owner->id,
        'viewer_user_id' => $viewer->id,
    ]);
});

test('invited user can accept pantry invite', function () {
    $owner = User::factory()->create();
    $viewer = User::factory()->create();

    PantryShare::create([
        'owner_user_id' => $owner->id,
        'viewer_user_id' => $viewer->id,
        'status' => PantryShare::STATUS_PENDING,
    ]);

    $response = $this
        ->actingAs($viewer)
        ->patch("/profile/pantry-shares/{$owner->id}/accept");

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    $this->assertDatabaseHas('pantry_shares', [
        'owner_user_id' => $owner->id,
        'viewer_user_id' => $viewer->id,
        'status' => PantryShare::STATUS_ACCEPTED,
    ]);
});

test('invited user can decline pantry invite', function () {
    $owner = User::factory()->create();
    $viewer = User::factory()->create();

    PantryShare::create([
        'owner_user_id' => $owner->id,
        'viewer_user_id' => $viewer->id,
        'status' => PantryShare::STATUS_PENDING,
    ]);

    $response = $this
        ->actingAs($viewer)
        ->delete("/profile/pantry-shares/{$owner->id}/decline");

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    $this->assertDatabaseMissing('pantry_shares', [
        'owner_user_id' => $owner->id,
        'viewer_user_id' => $viewer->id,
    ]);
});

test('pending invite does not allow pantry staple edits until accepted', function () {
    $owner = User::factory()->create();
    $viewer = User::factory()->create();

    $staple = PantryStaple::create([
        'user_id' => $owner->id,
        'name' => 'rice',
        'is_in_stock' => true,
    ]);

    PantryShare::create([
        'owner_user_id' => $owner->id,
        'viewer_user_id' => $viewer->id,
        'status' => PantryShare::STATUS_PENDING,
    ]);

    $forbiddenResponse = $this
        ->actingAs($viewer)
        ->patch("/meal-planning/pantry/staples/{$staple->id}", [
            'is_in_stock' => false,
        ]);

    $forbiddenResponse->assertForbidden();

    PantryShare::query()
        ->where('owner_user_id', $owner->id)
        ->where('viewer_user_id', $viewer->id)
        ->update([
            'status' => PantryShare::STATUS_ACCEPTED,
            'accepted_at' => now(),
        ]);

    $allowedResponse = $this
        ->actingAs($viewer)
        ->patch("/meal-planning/pantry/staples/{$staple->id}", [
            'is_in_stock' => false,
        ]);

    $allowedResponse->assertRedirect('/meal-planning/pantry');
});
