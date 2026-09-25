<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('settings');
        Schema::create('settings', function (Blueprint $table) {
            $table->tinyIncrements('setting_id');
            $table->string('key_name')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Run the setting seeder automatically after the table is created
        Artisan::call('db:seed', [
            '--class' => 'Database\Seeders\SettingSeeder',
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
