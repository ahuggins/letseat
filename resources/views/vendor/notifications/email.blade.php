<x-mail::message>
<div style="margin: -8px 0 20px; background: #ffffff;">
    <div style="padding: 18px 20px 14px; background: #ffffff;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin: 0 0 8px;">
            <tr>
                <td style="width: 74px; vertical-align: middle;">
                    <span style="display: inline-block; width: 68px; height: 68px; border-radius: 12px; border: 1px solid #fee2e2; background: #ffffff; overflow: hidden;">
                        <img src="{{ asset('img/icon-128.png') }}" width="68" height="68" alt="LetsEat logo" style="display: block; width: 68px; height: 68px;" />
                    </span>
                </td>
                <td style="vertical-align: middle; font-size: 18px; letter-spacing: 0.04em; text-transform: uppercase; color: #b91c1c; font-weight: 500;">
                    LetsEat!
                </td>
            </tr>
        </table>
        <div style="margin-top: 4px; font-size: 24px; line-height: 1.2; color: #b91c1c; font-weight: 700; font-family: Georgia, 'Times New Roman', serif;">Kitchen Updates</div>
        <div style="margin-top: 6px; font-size: 13px; color: #52525b;">Fresh from your meal planning account.</div>
    </div>
    <div style="padding: 10px 20px; font-size: 12px; line-height: 1.5; color: #7f1d1d; background: #fff7f7;">
        This message was sent from your LetsEat account notifications.
    </div>
</div>

<div style="margin: 0 0 20px; border: 1px solid #fee2e2; border-top: 6px solid #ef4444; border-radius: 18px; background: #ffffff; overflow: hidden;">
<div style="padding: 24px 20px 18px;">

{{-- Greeting --}}
@if (! empty($greeting))
<h1 style="margin: 0 0 14px; font-size: 28px; line-height: 1.2; color: #18181b; font-weight: 700; font-family: Georgia, 'Times New Roman', serif;">{{ $greeting }}</h1>
@else
@if ($level === 'error')
<h1 style="margin: 0 0 14px; font-size: 28px; line-height: 1.2; color: #18181b; font-weight: 700; font-family: Georgia, 'Times New Roman', serif;">Whoops!</h1>
@else
<h1 style="margin: 0 0 14px; font-size: 28px; line-height: 1.2; color: #18181b; font-weight: 700; font-family: Georgia, 'Times New Roman', serif;">Hello Chef!</h1>
@endif
@endif

{{-- Intro Lines --}}
@foreach ($introLines as $line)
<p style="margin: 0 0 12px; font-size: 15px; line-height: 1.65; color: #3f3f46;">{{ $line }}</p>

@endforeach

{{-- Action Button --}}
@isset($actionText)
<?php
    $color = match ($level) {
        'success', 'error' => $level,
        default => 'error',
    };
?>
<x-mail::button :url="$actionUrl" :color="$color">
{{ $actionText }}
</x-mail::button>
@endisset

{{-- Outro Lines --}}
@foreach ($outroLines as $line)
<p style="margin: 0 0 12px; font-size: 15px; line-height: 1.65; color: #3f3f46;">{{ $line }}</p>

@endforeach

{{-- Salutation --}}
@if (! empty($salutation))
<p style="margin: 12px 0 0; font-size: 14px; line-height: 1.6; color: #3f3f46;">{!! nl2br(e($salutation)) !!}</p>
@else
<p style="margin: 12px 0 0; font-size: 14px; line-height: 1.6; color: #3f3f46;">
    Regards,<br>
    <span style="font-weight: 600; color: #18181b;">{{ config('app.name') }}</span>
</p>
@endif

</div>
</div>

{{-- Subcopy --}}
@isset($actionText)
<x-slot:subcopy>
<p style="margin: 12px 0 0; font-size: 12px; line-height: 1.6; color: #71717a;">
    @lang(
        "If you're having trouble clicking the \":actionText\" button, copy and paste the URL below\n".
        'into your web browser:',
        [
            'actionText' => $actionText,
        ]
    )
</p>
<p style="margin: 8px 0 0; font-size: 12px; line-height: 1.6; color: #52525b; word-break: break-all;">
    <a href="{{ $actionUrl }}" style="color: #b91c1c; text-decoration: underline;">{{ $displayableActionUrl }}</a>
</p>
</x-slot:subcopy>
@endisset
</x-mail::message>
