<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recipe extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $with = ['user'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'ingredients' => 'array',
            'directions' => 'array',
            'content' => 'array',
            'nutrition' => 'json',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
