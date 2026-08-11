<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

@php($siteSettings = app(\App\Services\SiteSettingsService::class)->get())
<head>
    <meta charset="utf-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
    >

    <meta
        name="csrf-token"
        content="{{ csrf_token() }}"
    >

    <meta
        name="theme-color"
        content="#ee4d2d"
    >

    <!-- PWA Web App Manifest -->
    <link rel="manifest" href="/manifest.json">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="{{ $siteSettings['site_name'] }}">

    <title>{{ $siteSettings['site_name'] }}</title>
    <meta name="description" content="{{ $siteSettings['seo_description'] }}">

    <!-- Favicon -->
    <link rel="icon" href="{{ $siteSettings['favicon'] }}">
    <link rel="shortcut icon" href="{{ $siteSettings['favicon'] }}">
    <link rel="apple-touch-icon" href="{{ $siteSettings['favicon'] }}">

    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:title" content="{{ $siteSettings['site_name'] }}">
    <meta property="og:description" content="{{ $siteSettings['seo_description'] }}">
    <meta property="og:image" content="{{ url($siteSettings['social_share_image']) }}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $siteSettings['site_name'] }}">
    <meta name="twitter:description" content="{{ $siteSettings['seo_description'] }}">
    <meta name="twitter:image" content="{{ url($siteSettings['social_share_image']) }}">

    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
    <script>
        window.TURNSTILE_SITE_KEY = @json(config('services.turnstile.site_key'));
    </script>

    @vite([
        'resources/css/app.css',
        'resources/js/app.js',
    ])
</head>

<body>

<div id="app">
    <style>
        .saffi-spin { animation: saffi-spin 1s linear infinite; }
        @keyframes saffi-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .saffi-pulse { animation: saffi-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes saffi-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .saffi-bounce { animation: saffi-bounce 0.5s cubic-bezier(0.28, 0.84, 0.42, 1) infinite alternate; }
        @keyframes saffi-bounce { 0% { transform: translateY(0) scale(0.95); } 100% { transform: translateY(-20px) scale(1.05); } }
    </style>
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #f8fafc;">
        <img class="saffi-bounce" src="{{ $siteSettings['loading_image'] }}" alt="{{ $siteSettings['site_name'] }}" style="width: 56px; height: 56px; object-fit: contain; margin-bottom: 16px; z-index: 20;" />
        <div style="position: relative; width: 84px; height: 84px; display: flex; align-items: center; justify-content: center;">
            <div class="saffi-spin" style="position: absolute; inset: 0; border-radius: 50%; border: 4px solid #e2e8f0; border-top-color: #ee4d2d;"></div>
            <img class="saffi-pulse" src="{{ $siteSettings['favicon'] }}" alt="Loading" style="width: 64px; height: 64px; object-fit: cover; border-radius: 50%; z-index: 10;" />
        </div>
        <p style="margin-top: 24px; font-size: 15px; font-weight: 700; color: #64748b; font-family: sans-serif;">
            Đang tải...
        </p>
    </div>
</div>

</body>

</html>
