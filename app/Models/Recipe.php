<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Laravel\Scout\Searchable;

class Recipe extends Model
{
    use HasFactory, Searchable;

    protected $guarded = [];

    protected $with = ['user', 'comments', 'comments.commentator'];

    public function toSearchableArray()
    {
        return array_merge(['name' => $this->name, 'ingredients' => $this->ingredients], [
            'id' => (string) $this->id,
            'created_at' => $this->created_at->timestamp,
        ]);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function commentAsUser(User $user, string $comment): Comment
    {
        return $this->comments()->create([
            'user_id' => $user->id,
            'comment' => $comment,
            'is_approved' => true,
        ]);
    }

    protected function name(): Attribute
    {
        return Attribute::make(
            set: fn (string $value) => html_entity_decode($value)
        );
    }

    protected function ingredients(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => json_decode($value),
            set: fn (string $value) => html_entity_decode($value)
        );
    }

    protected function directions(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => json_decode($value),
            set: fn (string $value) => html_entity_decode($value)
        );
    }

    protected function content(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => json_decode($value),
            set: fn ($value) => $value
        );
    }

    protected function nutrition(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => json_decode($value),
            set: fn ($value) => html_entity_decode(json_encode($value))
        );
    }

    protected function slug(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $value,
            set: fn () => Str::slug($this->name)
        );
    }
}
