<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingSeeder extends Seeder
{
    /**
     * Seed all settings required by the application.
     *
     * Keys are derived from actual usage in:
     *   - App\Helpers\ReceiptHelper      (shop_name, tax_percent, wifi_name, wifi_password)
     *   - App\Http\Controllers\OrderController (enable_discount, discount_at, discount_percent, tax_percent)
     */
    public function run(): void
    {
        $settings = [
            // ── Receipt Header ────────────────────────────────────────────────
            [
                'key_name' => 'shop_name',
                'value' => 'My Cafe',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // ── Tax ───────────────────────────────────────────────────────────
            [
                'key_name' => 'tax_percent',
                'value' => '0',          // e.g. 10 = 10%
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // ── Discount ──────────────────────────────────────────────────────
            [
                'key_name' => 'enable_discount',
                'value' => '0',          // '1' = enabled, '0' = disabled
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key_name' => 'discount_at',
                'value' => '10',         // minimum subtotal (USD) to trigger discount
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key_name' => 'discount_percent',
                'value' => '0',          // e.g. 5 = 5%
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // ── Receipt Footer (Wi-Fi) ─────────────────────────────────────────
            [
                'key_name' => 'wifi_name',
                'value' => 'CafeWifi',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key_name' => 'wifi_password',
                'value' => '12345678',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($settings as $setting) {
            // Insert only if the key does not already exist (safe to re-run)
            DB::table('settings')->insertOrIgnore($setting);
        }
    }
}
