<?php

namespace App\Utils;

class RoleUtils
{
    const ROLE_ADMIN = 'admin';
    const ROLE_USER = 'user';

    public static function getRoles(): array
    {
        return [self::ROLE_ADMIN, self::ROLE_USER];
    }
}
