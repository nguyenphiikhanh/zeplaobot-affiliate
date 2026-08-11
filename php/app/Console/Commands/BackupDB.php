<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

class BackupDB extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'data:backup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backup mysql database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        $database = config('database.connections.mysql.database');
        $host = config('database.connections.mysql.host');
        $port = config('database.connections.mysql.port');
        $username = config('database.connections.mysql.username');
        $password = config('database.connections.mysql.password');

        $filename = sprintf(
            '%s_%s.sql.gz',
            $database,
            now()->format('Ymd_His')
        );
        $tempFile = storage_path("app/{$filename}");

        $command = sprintf(
            'mysqldump --single-transaction --quick --lock-tables=false -h%s -P%s -u%s %s | gzip > %s',
            escapeshellarg($host),
            escapeshellarg($port),
            escapeshellarg($username),
            escapeshellarg($database),
            escapeshellarg($tempFile)
        );
        $process = Process::fromShellCommandline($command);
        $process->setEnv([
            'MYSQL_PWD' => $password,
        ]);
        $process->setTimeout(3600);

        try {
            $process->mustRun();
        } catch (\Symfony\Component\Process\Exception\ProcessFailedException $e) {
            $this->error($e->getProcess()->getErrorOutput());

            return self::FAILURE;
        }
        if (! file_exists($tempFile)) {
            $this->error('Backup file was not created.');

            return self::FAILURE;
        }
        $remotePath = now()->format('Y/m/d/') . $filename;

        Storage::disk('r2')->put(
            $remotePath,
            fopen($tempFile, 'rb')
        );
        @unlink($tempFile);
        $this->info("BackupDB Uploaded to R2: {$remotePath}");

        return self::SUCCESS;
    }
}
