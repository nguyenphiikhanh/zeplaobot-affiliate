<?php

namespace Tests;

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Foundation\Application;

trait CreatesApplication
{
    /**
     * Creates the application.
     */
    public function createApplication(): Application
    {
        $app = require __DIR__.'/../bootstrap/app.php';

        $app->make(Kernel::class)->bootstrap();

        $connection = $app['config']->get('database.default');
        $database = $app['config']->get("database.connections.{$connection}.database");

        if (
            ! $app->environment('testing')
            || $connection !== 'sqlite'
            || $database !== ':memory:'
        ) {
            throw new \RuntimeException(sprintf(
                'Unsafe test database configuration blocked: environment=%s, connection=%s, database=%s. Tests must use SQLite :memory:.',
                $app->environment(),
                (string) $connection,
                (string) $database
            ));
        }

        return $app;
    }
}
