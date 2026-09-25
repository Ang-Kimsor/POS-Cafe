<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ActivateSuperadminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'superadmin:active {email? : Email Address of the superadmin}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Activate a superadmin account';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->argument('email');

        // Prompt interactively if missing argument
        if (! $email) {
            $email = $this->ask('Enter Superadmin Email to activate');
            while (empty($email) || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->error('Please enter a valid email address.');
                $email = $this->ask('Enter Superadmin Email to activate');
            }
        }

        $user = User::withTrashed()->where('email', $email)->first();

        if (! $user) {
            $this->error('User with this email not found!');

            return Command::FAILURE;
        }

        $userRole = is_object($user->role) ? $user->role->value : $user->role;
        if ($userRole !== 'superadmin') {
            $this->error('This user is not a superadmin!');

            return Command::FAILURE;
        }

        if ($user->trashed()) {
            $user->restore();
        }

        $user->is_active = true;
        $user->save();

        $this->info("Superadmin {$user->name} ({$email}) has been activated successfully!");

        return Command::SUCCESS;
    }
}
