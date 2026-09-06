<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Contracts\NotificationProviderInterface::class,
            \App\Services\Notifications\LogNotificationProvider::class
        );

        $this->app->bind(
            \App\Contracts\ShippingProviderInterface::class,
            \App\Services\BiteshipService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
