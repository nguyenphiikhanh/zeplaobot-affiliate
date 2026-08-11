<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
@php($siteSettings = app(\App\Services\SiteSettingsService::class)->get())
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>Đơn hàng đã được hoàn tiền! - Saffi</title>
</head>
<body
    style="background-color:#FAF6F0; margin:0; padding:0; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;">

<div style="display:none; overflow:hidden; line-height:1px; opacity:0; max-height:0; max-width:0;">
    🎉 Đơn hàng #{{$order_id}} của bạn đã được hoàn tiền thành công từ Saffi.
</div>

<table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center"
       style="background-color:#FAF6F0;">
    <tbody>
    <tr>
        <td style="background-color:#FAF6F0; padding:48px 0; margin:0;">

            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                   style="max-width:576px; margin:0 auto; border-radius:16px; background-color:#FFFFFF; overflow:hidden; border:1px solid #FFEADA; box-shadow:0 4px 10px rgba(45, 37, 32, 0.05)">
                <tbody>
                <tr>
                    <td>

                        <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                               role="presentation"
                               style="background-color:#FF7A30; background-image:linear-gradient(135deg, #FF7A30 0%, #FF9F5A 100%); padding:48px 32px; text-align:center">
                            <tbody>
                            <tr>
                                <td style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                    <div
                                        style="display:inline-block; background-color:#FFFFFF; padding:8px; border-radius:9999px; border:2px solid #FFFFFF; box-shadow:0 4px 6px rgba(0, 0, 0, 0.05)">
                                        <img alt="{{ $siteSettings['site_name'] }}" height="48" src="{{ url($siteSettings['logo_light']) }}"
                                             style="display:block; outline:none; border:none; border-radius:9999px"
                                             width="48">
                                    </div>
                                    <p style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:24px; line-height:32px; margin-top:16px; margin-bottom:0; font-weight:900; color:#FFFFFF; letter-spacing:0.05em; text-transform:uppercase">
                                        Đơn hàng đã được hoàn tiền!</p>
                                    <p style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:14px; line-height:24px; margin-top:8px; margin-bottom:0; font-weight:500; color:rgba(255, 255, 255, 0.95); max-width:380px; margin-left:auto; margin-right:auto;">
                                        Saffi đã đối soát và hoàn tiền cho đơn hàng của bạn</p>
                                </td>
                            </tr>
                            </tbody>
                        </table>

                        <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                               role="presentation" style="padding:40px 32px; background-color:#FFFFFF">
                            <tbody>
                            <tr>
                                <td style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                    <p style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:20px; line-height:24px; text-align:left; font-weight:800; color:#2D2520; margin:0;">
                                        Chúc mừng {{$name}}! 🎉</p>
                                    <p style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:14px; line-height:24px; text-align:left; color:#5A4E45; margin-top:8px; margin-bottom:32px;">
                                        Đơn hàng của bạn đã được <strong>Saffi</strong> hoàn tiền rồi nhé.</p>

                                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                                           role="presentation"
                                           style="margin:32px 0; border-radius:16px; border:1px solid #DCFCE7; background-color:#F0FDF4; padding:32px; text-align:center">
                                        <tbody>
                                        <tr>
                                            <td style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                                <div
                                                    style="display:inline-block; background-color:#2E7D32; padding:6px 16px; border-radius:9999px; font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:10px; font-weight:900; color:#FFFFFF; letter-spacing:0.1em">
                                                    ✨ ĐÃ HOÀN TIỀN 🎉
                                                </div>

                                                <div style="text-align:center; margin-top:20px; margin-bottom:12px">
                                                    <img alt="Saffi Gold" src="https://app.saffi.vn/saffi_gold.webp"
                                                         style="display:inline-block; outline:none; border:none;"
                                                         width="80">
                                                </div>

                                                <p style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:12px; line-height:24px; margin-top:24px; margin-bottom:4px; font-weight:bold; text-transform:uppercase; letter-spacing:0.05em; color:#7C6E65">
                                                    Mã đơn hàng của bạn</p>
                                                <p style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:24px; line-height:24px; margin:0; font-weight:900; color:#2D2520; letter-spacing:0.02em;">
                                                    #{{$order_id}}</p>

                                                <hr style="width:100%; border:none; border-top:1px solid #DCFCE7; margin:20px auto; max-width:80%">

                                                <p style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:12px; line-height:24px; margin-top:24px; margin-bottom:4px; font-weight:bold; text-transform:uppercase; letter-spacing:0.05em; color:#7C6E65">
                                                    Điểm hoàn tiền ghi nhận</p>
                                                <p style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:28px; line-height:24px; margin:0; font-weight:900; color:#2E7D32;">
                                                    +{{ number_format($amount) }} ₫</p>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>

                                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                                           role="presentation"
                                           style="margin:32px 0; border-radius:16px; border:1px solid #DCFCE7; background-color:#F0FDF4; padding:24px">
                                        <tbody>
                                        <tr>
                                            <td style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                                <p style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:14px; line-height:22px; font-weight:bold; color:#15803d; margin:0;">
                                                    ✅ Điểm hoàn tiền này đã được đối soát và sẵn sàng để rút về tài
                                                    khoản ngân hàng của bạn.</p>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>

                                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                                           role="presentation" style="margin:32px 0">
                                        <tbody>
                                        <tr>
                                            <td style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                                <p style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:14px; line-height:24px; font-weight:bold; color:#2D2520; margin:0; margin-bottom:20px;">
                                                    Gợi ý từ Saffi</p>

                                                <table width="100%" cellpadding="0" cellspacing="0">
                                                    <tbody>
                                                    <tr>
                                                        <td valign="top" width="36" style="padding-bottom:16px">
                                                            <div
                                                                style="width:24px; height:24px; border-radius:9999px; background-color:#FFF5EE; color:#FF7A30; font-weight:bold; font-size:12px; text-align:center; line-height:24px; border:1px solid #FFEADA; font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                                                1
                                                            </div>
                                                        </td>
                                                        <td style="padding-bottom:16px; font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                                            <p style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:13px; line-height:22px; margin:0; color:#5A4E45;">
                                                                Sử dụng <a href="https://app.saffi.vn"
                                                                           style="color:#FF7A30; text-decoration:underline; font-weight:bold;"
                                                                           target="_blank">Saffi</a> để rút tiền về tài
                                                                khoản ngân hàng của bạn.</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td valign="top" width="36">
                                                            <div
                                                                style="width:24px; height:24px; border-radius:9999px; background-color:#FFF5EE; color:#FF7A30; font-weight:bold; font-size:12px; text-align:center; line-height:24px; border:1px solid #FFEADA; font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                                                2
                                                            </div>
                                                        </td>
                                                        <td style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                                            <p style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:13px; line-height:22px; margin:0; color:#5A4E45;">
                                                                Tiếp tục <a href="https://app.saffi.vn"
                                                                            style="color:#FF7A30; text-decoration:underline; font-weight:bold;"
                                                                            target="_blank">mua sắm và nhận hoàn
                                                                    tiền</a> các đơn hàng tiếp theo cùng <b>Saffi</b>
                                                                nhé ❤️.</p>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>

                                    <hr style="width:100%; border:none; border-top:1px solid #FFEADA; margin:32px 0">
                                    <p style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:14px; line-height:24px; text-align:center; font-weight:500; color:#5A4E45; margin:0;">
                                        Cảm ơn bạn vì đã đồng hành cùng <strong style="color:#FF7A30; font-weight:900">Saffi</strong>
                                        🧡</p>
                                </td>
                            </tr>
                            </tbody>
                        </table>

                        <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                               role="presentation"
                               style="background-color:#FFF9F5; padding:40px 32px; border-top:1px solid #FFEADA">
                            <tbody>
                            <tr>
                                <td style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tbody>
                                        <tr>
                                            <td width="56" valign="middle">
                                                <img alt="{{ $siteSettings['site_name'] }}" height="48" src="{{ url($siteSettings['favicon']) }}"
                                                     style="display:block; outline:none; border:1px solid #FFEADA; border-radius:12px"
                                                     width="48">
                                            </td>
                                            <td valign="middle"
                                                style="padding-left:12px; font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                                <p style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:24px; line-height:28px; margin:0; font-weight:900; color:#FF7A30;">
                                                    Saffi</p>
                                                <p style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:10px; line-height:24px; margin:0; font-weight:bold; color:#7A8B9E; letter-spacing:0.15em; text-transform:uppercase;">
                                                    SMART SHOPPING</p>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>

                                    <p style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:13px; line-height:22px; margin-top:16px; margin-bottom:24px; color:#5A4E45; text-align:left">
                                        Trợ lý mua sắm thông minh thế hệ mới. Hoàn tiền tự động, siêu tốc, minh bạch và
                                        ổn định từ các sàn TMĐT.</p>

                                    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px">
                                        <tbody>
                                        <tr>
                                            <td>
                                                <a href="{{ $siteSettings['contact_zalo'] }}"
                                                   style="display:inline-block; width:40px; height:40px; border-radius:20px; background-color:#FFFFFF; border:1px solid #FFEADA; text-align:center; box-shadow:0 2px 4px rgba(0, 0, 0, 0.03); vertical-align: middle;"
                                                   target="_blank">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        x="0px"
                                                        y="0px"
                                                        width="40"
                                                        height="40"
                                                        viewBox="0 0 48 48"
                                                    >
                                                        <path
                                                            fill="#2962ff"
                                                            d="M15,36V6.827l-1.211-0.811C8.64,8.083,5,13.112,5,19v10c0,7.732,6.268,14,14,14h10	c4.722,0,8.883-2.348,11.417-5.931V36H15z"
                                                        ></path>
                                                        <path
                                                            fill="#eee"
                                                            d="M29,5H19c-1.845,0-3.601,0.366-5.214,1.014C10.453,9.25,8,14.528,8,19	c0,6.771,0.936,10.735,3.712,14.607c0.216,0.301,0.357,0.653,0.376,1.022c0.043,0.835-0.129,2.365-1.634,3.742	c-0.162,0.148-0.059,0.419,0.16,0.428c0.942,0.041,2.843-0.014,4.797-0.877c0.557-0.246,1.191-0.203,1.729,0.083	C20.453,39.764,24.333,40,28,40c4.676,0,9.339-1.04,12.417-2.916C42.038,34.799,43,32.014,43,29V19C43,11.268,36.732,5,29,5z"
                                                        ></path>
                                                        <path
                                                            fill="#2962ff"
                                                            d="M36.75,27C34.683,27,33,25.317,33,23.25s1.683-3.75,3.75-3.75s3.75,1.683,3.75,3.75	S38.817,27,36.75,27z M36.75,21c-1.24,0-2.25,1.01-2.25,2.25s1.01,2.25,2.25,2.25S39,24.49,39,23.25S37.99,21,36.75,21z"
                                                        ></path>
                                                        <path
                                                            fill="#2962ff"
                                                            d="M31.5,27h-1c-0.276,0-0.5-0.224-0.5-0.5V18h1.5V27z"
                                                        ></path>
                                                        <path
                                                            fill="#2962ff"
                                                            d="M27,19.75v0.519c-0.629-0.476-1.403-0.769-2.25-0.769c-2.067,0-3.75,1.683-3.75,3.75	S22.683,27,24.75,27c0.847,0,1.621-0.293,2.25-0.769V26.5c0,0.276,0.224,0.5,0.5,0.5h1v-7.25H27z M24.75,25.5	c-1.24,0-2.25-1.01-2.25-2.25S23.51,21,24.75,21S27,22.01,27,23.25S25.99,25.5,24.75,25.5z"
                                                        ></path>
                                                        <path
                                                            fill="#2962ff"
                                                            d="M21.25,18h-8v1.5h5.321L13,26h0.026c-0.163,0.211-0.276,0.463-0.276,0.75V27h7.5	c0.276,0,0.5-0.224,0.5-0.5v-1h-5.321L21,19h-0.026c0.163-0.211,0.276-0.463,0.276-0.75V18z"
                                                        ></path>
                                                    </svg>
                                                </a>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>

                                    <hr style="width:100%; border:none; border-top:1px solid #FFEADA; margin:24px 0 16px 0">

                                    <p style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:12px; line-height:24px; margin:0; text-align:left;">
                                        <span style="color:#7C6E65">Support Contact: </span>
                                        <a href="mailto:{{ $siteSettings['contact_email'] }}" style="color:#FF7A30; font-weight:bold;"
                                           target="_blank">{{ $siteSettings['contact_email'] }}</a>
                                    </p>

                                    <p style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:11px; line-height:18px; margin-top:24px; margin-bottom:0; color:#A89A90; text-align:left">
                                        © {{ \Carbon\Carbon::now()->format('Y') }} Saffi.vn. All rights reserved.<br>
                                        Email tự động từ hệ thống theo dõi và quản lý đơn hàng. Vui lòng không trả lời
                                        trực tiếp email này.
                                    </p>
                                </td>
                            </tr>
                            </tbody>
                        </table>

                    </td>
                </tr>
                </tbody>
            </table>

        </td>
    </tr>
    </tbody>
</table>

</body>
</html>
