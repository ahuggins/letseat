<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if a comment for a specific model needs to be approved.
     * From BeyondCode\Laravel-comments package
     *
     * @param  mixed  $model
     */
    public function needsCommentApproval($model): bool
    {
        return false;
    }

    public function favoriteRecipes()
    {
        return $this->belongsToMany(NewRecipe::class, 'new_recipe_favorites')
            ->withTimestamps();
    }

    public function madeRecipes()
    {
        return $this->belongsToMany(NewRecipe::class, 'new_recipe_mades')
            ->withTimestamps();
    }

    public function privateRecipeNotes()
    {
        return $this->hasMany(PrivateRecipeNote::class);
    }

    public function noteSharesGiven()
    {
        return $this->hasMany(PrivateNoteShare::class, 'owner_user_id');
    }

    public function noteSharesReceived()
    {
        return $this->hasMany(PrivateNoteShare::class, 'viewer_user_id');
    }
}
