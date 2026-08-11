<?php

namespace App\Services;

class AuthService
{
    public function loginWithCode(string $code){
        try {
            $client = new \Google_Client();
            $client->setClientId(config('services.google.client_id'));
            $client->setClientSecret(config('services.google.client_secret'));
            $client->setRedirectUri(config('services.google.redirect'));

            $token = $client->fetchAccessTokenWithAuthCode($code);
            $client->setAccessToken($token['access_token']);
            $google_oauth = new \Google_Service_Oauth2($client);

            $googleUser = $google_oauth->userinfo->get();
            $payload = [
                'email' => $googleUser->getEmail(),
                'name' => $googleUser->getName(),
                'picture' => $googleUser->getPicture(),
                'sub' => $googleUser->getId(),
            ];
            return $payload;
        }
        catch (\Google_Service_Exception $e) {
            throw new \Exception('Google API error: '.$e->getMessage());
            return null;
        }
    }

    public function loginWithCredentials(string $token){
        try {
            $client = new \Google_Client();
            $client->setClientId(config('services.google.client_id'));
            $client->setClientSecret(config('services.google.client_secret'));
            $client->setRedirectUri(config('services.google.redirect'));

            $googleUser = $client->verifyIdToken($token);

            $payload = null;
            if($googleUser){
                $payload = [
                    'email' => $googleUser['email'],
                    'name' => $googleUser['name'] ?? '',
                    'picture' => $googleUser['picture'],
                    'sub' => $googleUser['sub'],
                ];
            }

            return $payload;
        }
        catch (\Google_Service_Exception $e) {
            throw new \Exception('Google API error: '.$e->getMessage());
            return null;
        }
    }
}
