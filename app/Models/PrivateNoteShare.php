<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrivateNoteShare extends Model
{
    protected $guarded = [];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function viewer()
    {
        return $this->belongsTo(User::class, 'viewer_user_id');
    }
}
