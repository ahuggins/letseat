<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PantryStaple extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'is_in_stock' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
