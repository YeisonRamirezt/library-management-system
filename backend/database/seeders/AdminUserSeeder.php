<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::create([
            'name' => 'Admin User',
            'email' => 'admin@lms.local',
            'library_id' => 'ADMIN001',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        \App\Models\User::create([
            'name' => 'John Doe',
            'email' => 'user@lms.local',
            'library_id' => 'USER001',
            'password' => bcrypt('password'),
            'role' => 'user',
        ]);
    }
}
