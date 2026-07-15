<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PantryShare extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_ACCEPTED = 'accepted';

    protected $guarded = [];

    protected $casts = [
        'accepted_at' => 'datetime',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function viewer()
    {
        return $this->belongsTo(User::class, 'viewer_user_id');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', self::STATUS_ACCEPTED);
    }
}
