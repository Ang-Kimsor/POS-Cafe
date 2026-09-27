<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateSuperadminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'superadmin:create {name? : Full Name} {email? : Email Address} {password? : Account Password}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new superadmin account';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $name = $this->argument('name');
        $email = $this->argument('email');
        $password = $this->argument('password');

        // Prompt interactively if missing arguments
        if (! $name) {
            $name = $this->ask('Enter Full Name');
            while (empty(trim((string) $name))) {
                $this->error('Name is required.');
                $name = $this->ask('Enter Full Name');
            }
        }

        if (! $email) {
            $email = $this->ask('Enter Email address');
            while (empty($email) || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->error('Please enter a valid email address.');
                $email = $this->ask('Enter Email address');
            }
        }

        if (! $password) {
            $password = $this->secret('Enter Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)');
            while (empty($password) || strlen($password) < 8 || !preg_match('/[a-z]/', $password) || !preg_match('/[A-Z]/', $password) || !preg_match('/[0-9]/', $password)) {
                $this->error('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.');
                $password = $this->secret('Enter Password');
            }
        }

        $user = User::withTrashed()->where('email', $email)->first();

        if ($user) {
            $this->error("Account creation failed: A user with email '{$email}' already exists.");
            $this->line('If you wish to activate an existing account, please use command: php artisan superadmin:activate');

            return Command::FAILURE;
        }

        $superAdmin = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'superadmin',
            'is_active' => true,
        ]);

        $this->info("Superadmin {$name} ({$email}) created successfully!");

        return Command::SUCCESS;
    }
}
