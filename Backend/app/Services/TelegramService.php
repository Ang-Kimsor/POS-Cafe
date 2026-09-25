<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class TelegramService
{
    private function getTargetChatIds()
    {
        $adminIds = explode(',', env('TELEGRAM_CHAT_ID', ''));
        $groupIds = explode(',', env('TELEGRAM_GROUP_IDS', ''));

        $allIds = array_merge($adminIds, $groupIds);

        return array_unique(array_filter(array_map('trim', $allIds)));
    }

    public function send($message)
    {
        $token = env('TELEGRAM_BOT_TOKEN');
        if (! $token) {
            return;
        }

        $chatIds = $this->getTargetChatIds();
        $url = "https://api.telegram.org/bot{$token}/sendMessage";

        foreach ($chatIds as $chatId) {
            Http::post($url, [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'HTML',
            ]);
        }
    }

    public function sendPhoto($photoPath, $caption = '')
    {
        $token = env('TELEGRAM_BOT_TOKEN');
        if (! $token) {
            return;
        }

        $chatIds = $this->getTargetChatIds();
        $url = "https://api.telegram.org/bot{$token}/sendPhoto";

        foreach ($chatIds as $chatId) {
            Http::attach('photo', file_get_contents($photoPath), basename($photoPath))
                ->post($url, [
                    'chat_id' => $chatId,
                    'caption' => $caption,
                    'parse_mode' => 'HTML',
                ]);
        }
    }
}
