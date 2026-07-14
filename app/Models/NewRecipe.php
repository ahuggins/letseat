<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Laravel\Scout\Searchable;

class NewRecipe extends Model
{
    use HasFactory, Searchable;

    private const MAX_REASONABLE_COOK_MINUTES = 24 * 60;

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

    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function privateNotes()
    {
        return $this->hasMany(PrivateRecipeNote::class);
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'new_recipe_favorites')
            ->withTimestamps();
    }

    public function madeBy()
    {
        return $this->belongsToMany(User::class, 'new_recipe_mades')
            ->withTimestamps();
    }

    public function commentAsUser(User $user, string $comment): Comment
    {
        return $this->comments()->create([
            'user_id' => $user->id,
            'comment' => $comment,
            'is_approved' => true,
        ]);
    }

    public function toSearchableArray()
    {
        return array_merge(['name' => $this->name, 'ingredients' => $this->ingredients, 'category' => $this->category], [
            'id' => (string) $this->id,
            'created_at' => $this->created_at->timestamp,
        ]);
    }

    public function planningCookTimeLabel(): ?string
    {
        $content = is_array($this->content) ? $this->content : [];
        $recipeNode = $this->extractRecipeNode($content);

        if (! is_array($recipeNode)) {
            return null;
        }

        $timeKeys = ['totalTime', 'cookTime', 'prepTime'];

        foreach ($timeKeys as $key) {
            $label = $this->normalizeTimeValue($recipeNode[$key] ?? null);

            if ($label !== null) {
                return $label;
            }
        }

        return null;
    }

    private function extractRecipeNode(array $content): ?array
    {
        if (array_key_exists('@graph', $content) && is_array($content['@graph'])) {
            foreach ($content['@graph'] as $node) {
                if (! is_array($node)) {
                    continue;
                }

                $nodeType = $node['@type'] ?? null;
                $isRecipe = $nodeType === 'Recipe' || (is_array($nodeType) && in_array('Recipe', $nodeType, true));

                if ($isRecipe) {
                    return $node;
                }
            }
        }

        $nodeType = $content['@type'] ?? null;
        $isRecipe = $nodeType === 'Recipe' || (is_array($nodeType) && in_array('Recipe', $nodeType, true));

        return $isRecipe ? $content : null;
    }

    private function normalizeTimeValue(mixed $value): ?string
    {
        if (is_array($value)) {
            if (array_is_list($value)) {
                foreach ($value as $item) {
                    $label = $this->normalizeTimeValue($item);

                    if ($label !== null) {
                        return $label;
                    }
                }

                return null;
            }

            return $this->normalizeTimeValue($value['@value'] ?? $value['value'] ?? null);
        }

        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        if ($trimmed === '') {
            return null;
        }

        if (! preg_match('/^P(?!$)/i', $trimmed)) {
            return $trimmed;
        }

        $parsedMinutes = $this->parseIsoDurationMinutes($trimmed);

        if ($parsedMinutes !== null) {
            return $this->formatMinutesLabel($parsedMinutes);
        }

        try {
            $interval = new \DateInterval($trimmed);
        } catch (\Exception) {
            return null;
        }

        $totalMinutes = ($interval->y * 525600)
            + ($interval->m * 43200)
            + ($interval->d * 1440)
            + ($interval->h * 60)
            + $interval->i;

        if ($totalMinutes <= 0 && $interval->s > 0) {
            $totalMinutes = 1;
        }

        if ($totalMinutes > self::MAX_REASONABLE_COOK_MINUTES) {
            return null;
        }

        return $this->formatMinutesLabel($totalMinutes);
    }

    private function parseIsoDurationMinutes(string $value): ?int
    {
        $trimmed = trim($value);

        // Invalid source data sometimes contains negative segments like PT-495529H5M.
        if (str_contains($trimmed, '-')) {
            return null;
        }

        if (! preg_match(
            '/^P(?:(?<years>\d+)Y)?(?:(?<months>\d+)M)?(?:(?<weeks>\d+)W)?(?:(?<days>\d+)D)?(?:T(?:(?<hours>\d+)H)?(?:(?<minutes>\d+)M)?(?:(?<seconds>\d+)S)?)?$/i',
            $trimmed,
            $parts,
        )) {
            return null;
        }

        $years = abs((int) ($parts['years'] ?? 0));
        $months = abs((int) ($parts['months'] ?? 0));
        $weeks = abs((int) ($parts['weeks'] ?? 0));
        $days = abs((int) ($parts['days'] ?? 0));
        $hours = abs((int) ($parts['hours'] ?? 0));
        $minutes = abs((int) ($parts['minutes'] ?? 0));
        $seconds = abs((int) ($parts['seconds'] ?? 0));

        $totalMinutes = ($years * 525600)
            + ($months * 43200)
            + ($weeks * 10080)
            + ($days * 1440)
            + ($hours * 60)
            + $minutes;

        if ($totalMinutes <= 0 && $seconds > 0) {
            return 1;
        }

        if ($totalMinutes > self::MAX_REASONABLE_COOK_MINUTES) {
            return null;
        }

        return $totalMinutes > 0 ? $totalMinutes : null;
    }

    private function formatMinutesLabel(int $totalMinutes): ?string
    {
        if ($totalMinutes <= 0) {
            return null;
        }

        $hours = intdiv($totalMinutes, 60);
        $minutes = $totalMinutes % 60;

        if ($hours > 0 && $minutes > 0) {
            return sprintf('%d hr %d min', $hours, $minutes);
        }

        if ($hours > 0) {
            return sprintf('%d hr', $hours);
        }

        return sprintf('%d min', $minutes);
    }

    protected function slug(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $value,
            set: fn () => Str::slug($this->name)
        );
    }
}
