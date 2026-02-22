<?php

namespace App\Models;

use BeyondCode\Comments\Traits\HasComments;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Laravel\Scout\Searchable;

class Recipe extends Model
{
    use HasComments, HasFactory, Searchable;

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
            set: fn (string $value) => html_entity_decode($value)
        );
    }

    protected function nutrition(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => json_decode($value),
            set: fn (string $value) => html_entity_decode($value)
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
