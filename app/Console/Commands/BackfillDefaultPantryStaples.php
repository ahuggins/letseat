<?php

namespace App\Console\Commands;

use App\Models\PantryStaple;
use App\Models\User;
use Illuminate\Console\Command;

class BackfillDefaultPantryStaples extends Command
{
    private const DEFAULT_STAPLES = [
        'Water',
        'Salt',
        'Pepper',
        'Olive Oil',
        'Flour',
    ];

    protected $signature = 'app:backfill-default-pantry-staples
                            {--all : Also add missing default staples for users who already have at least one pantry staple}
                            {--dry-run : Preview users that would be updated without writing changes}';

    protected $description = 'Backfill default pantry staples for existing users';

    public function handle(): int
    {
        $usersQuery = User::query()->select(['id']);
        $onlyEmptyUsers = ! $this->option('all');
        $dryRun = (bool) $this->option('dry-run');
        $usersTouched = 0;
        $staplesCreated = 0;

        $usersQuery
            ->orderBy('id', 'asc')
            ->chunkById(200, function ($users) use (&$usersTouched, &$staplesCreated, $dryRun, $onlyEmptyUsers) {
                foreach ($users as $user) {
                    if ($onlyEmptyUsers) {
                        $hasAnyStaples = PantryStaple::query()
                            ->where('user_id', $user->id)
                            ->exists();

                        if ($hasAnyStaples) {
                            continue;
                        }
                    }

                    $createdForUser = 0;

                    foreach (self::DEFAULT_STAPLES as $stapleName) {
                        if ($dryRun) {
                            $exists = PantryStaple::query()
                                ->where('user_id', $user->id)
                                ->whereRaw('lower(name) = ?', [mb_strtolower($stapleName)])
                                ->exists();

                            if (! $exists) {
                                $createdForUser++;
                            }

                            continue;
                        }

                        $staple = PantryStaple::query()->firstOrCreate(
                            [
                                'user_id' => $user->id,
                                'name' => $stapleName,
                            ],
                            [
                                'is_in_stock' => true,
                            ],
                        );

                        if ($staple->wasRecentlyCreated) {
                            $createdForUser++;
                        }
                    }

                    if ($createdForUser > 0) {
                        $usersTouched++;
                        $staplesCreated += $createdForUser;
                    }
                }
            });

        if ($dryRun) {
            $this->comment('Dry run complete.');
            $this->line("Users that would receive defaults: {$usersTouched}");
            $this->line("Default staples that would be created: {$staplesCreated}");

            return self::SUCCESS;
        }

        $this->info('Backfill complete.');
        $this->line("Users updated: {$usersTouched}");
        $this->line("Default staples created: {$staplesCreated}");

        return self::SUCCESS;
    }
}
