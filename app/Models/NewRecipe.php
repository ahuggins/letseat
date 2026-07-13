<?php

namespace App\Models;

use BeyondCode\Comments\Traits\HasComments;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Laravel\Scout\Searchable;

class NewRecipe extends Model
{
    use HasComments, HasFactory, Searchable;

    protected $guarded = [];

    protected $with = ['user', 'comments', 'comments.commentator'];

    protected $casts = [
        'ingredients' => 'array',
        'directions' => 'array',
        'nutrition' => 'array',
        'content' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function toSearchableArray()
    {
        return array_merge(['name' => $this->name, 'ingredients' => $this->ingredients], [
            'id' => (string) $this->id,
            'created_at' => $this->created_at->timestamp,
        ]);
    }

    protected function slug(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $value,
            set: fn () => Str::slug($this->name)
        );
    }
}
