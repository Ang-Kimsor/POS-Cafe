<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SuperadminCommandsTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_superadmin_via_command(): void
    {
        $this->artisan('superadmin:create', [
            'name' => 'John Superadmin',
            'email' => 'superadmin@example.com',
            'password' => 'Password123',
        ])
            ->expectsOutputToContain('created successfully')
            ->assertSuccessful();

        $user = User::where('email', 'superadmin@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('John Superadmin', $user->name);
        $this->assertEquals('superadmin', $user->role);
        $this->assertTrue($user->is_active);
        $this->assertTrue(Hash::check('Password123', $user->password));
    }

    public function test_cannot_create_duplicate_superadmin(): void
    {
        User::create([
            'name' => 'Existing Admin',
            'email' => 'existing@example.com',
            'password' => Hash::make('Password123'),
            'role' => 'superadmin',
            'is_active' => true,
        ]);

        $this->artisan('superadmin:create', [
            'name' => 'Another Admin',
            'email' => 'existing@example.com',
            'password' => 'Password123',
        ])
            ->expectsOutputToContain('already exists')
            ->assertFailed();
    }

    public function test_can_deactivate_superadmin_via_command(): void
    {
        $user = User::create([
            'name' => 'Active Superadmin',
            'email' => 'active@example.com',
            'password' => Hash::make('Password123'),
            'role' => 'superadmin',
            'is_active' => true,
        ]);

        $this->artisan('superadmin:deactivate', [
            'email' => 'active@example.com',
        ])
            ->expectsOutputToContain('has been deactivated')
            ->assertSuccessful();

        $user->refresh();
        $this->assertFalse($user->is_active);
    }

    public function test_deactivate_fails_for_non_existent_user(): void
    {
        $this->artisan('superadmin:deactivate', [
            'email' => 'notfound@example.com',
        ])
            ->expectsOutputToContain('User with this email not found')
            ->assertFailed();
    }

    public function test_deactivate_fails_for_non_superadmin_user(): void
    {
        User::create([
            'name' => 'Regular Cashier',
            'email' => 'cashier@example.com',
            'password' => Hash::make('Password123'),
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $this->artisan('superadmin:deactivate', [
            'email' => 'cashier@example.com',
        ])
            ->expectsOutputToContain('This user is not a superadmin')
            ->assertFailed();
    }

    public function test_can_activate_superadmin_via_command(): void
    {
        $user = User::create([
            'name' => 'Inactive Superadmin',
            'email' => 'inactive@example.com',
            'password' => Hash::make('Password123'),
            'role' => 'superadmin',
            'is_active' => false,
        ]);

        $this->artisan('superadmin:activate', [
            'email' => 'inactive@example.com',
        ])
            ->expectsOutputToContain('has been activated successfully')
            ->assertSuccessful();

        $user->refresh();
        $this->assertTrue($user->is_active);
    }

    public function test_activate_restores_soft_deleted_superadmin(): void
    {
        $user = User::create([
            'name' => 'Deleted Superadmin',
            'email' => 'deleted@example.com',
            'password' => Hash::make('Password123'),
            'role' => 'superadmin',
            'is_active' => false,
        ]);

        $user->delete();
        $this->assertTrue($user->trashed());

        $this->artisan('superadmin:activate', [
            'email' => 'deleted@example.com',
        ])
            ->expectsOutputToContain('has been activated successfully')
            ->assertSuccessful();

        $user->refresh();
        $this->assertFalse($user->trashed());
        $this->assertTrue($user->is_active);
    }

    public function test_activate_fails_for_non_existent_user(): void
    {
        $this->artisan('superadmin:activate', [
            'email' => 'notfound@example.com',
        ])
            ->expectsOutputToContain('User with this email not found')
            ->assertFailed();
    }

    public function test_activate_fails_for_non_superadmin_user(): void
    {
        User::create([
            'name' => 'Regular Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('Password123'),
            'role' => 'admin',
            'is_active' => false,
        ]);

        $this->artisan('superadmin:activate', [
            'email' => 'admin@example.com',
        ])
            ->expectsOutputToContain('This user is not a superadmin')
            ->assertFailed();
    }
}
