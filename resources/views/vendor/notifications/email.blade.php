<x-mail::message>
@php
    $logoDataUri = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MzMzLjMzMzUgNTMzMy4zMzM1IiB3aWR0aD0iNjgiIGhlaWdodD0iNjgiIGFyaWEtbGFiZWw9IkxldHNFYXQgbG9nbyIgcm9sZT0iaW1nIiBzdHlsZT0iZGlzcGxheTogYmxvY2s7IHdpZHRoOiA2OHB4OyBoZWlnaHQ6IDY4cHg7Ij4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0ibWF0cml4KDEuMzMzMzMzMywwLDAsLTEuMzMzMzMzMywwLDUzMzMuMzMzMykiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0ic2NhbGUoMC4xKSI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0ic2NhbGUoMi4xNDcyNCkiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD0iI2RjMjYyNiIgZD0ibSAxNjMwMCw5MzE1LjY0IGMgMCwtMjcxMS4zOSAtMTU0Mi45LC01MDY0LjQ2IC0zODAyLjQsLTYyMTYuOTYgbCAtMTM2LjMsMzQyNS4zNyBjIDAsMjAzLjE5IDc3LjUsODAyLjE1IDIzMi41LDEwMDguMDQgNDU0LjcsNTkzLjY1IDEwMzIuMywxMDA4LjA5IDEwMzIuMywyMjc4LjIzIDAsMTY2NS44OCAtNzMyLjcsMzAxNi4xOCAtMTYzNi41LDMwMTYuMTggLTkwMS4xLDAgLTE2MzMuOCwtMTM1MC4zIC0xNjMzLjgsLTMwMTYuMTggMCwtMTI3MC4xNCA1NzcuNSwtMTY4NC41OCAxMDI5LjUsLTIyNzguMjMgMTU3LjcsLTIwNS44OSAyMzUuMywtODA0Ljg1IDIzNS4zLC0xMDA4LjA0IGwgLTE1NS4xLC0zODU1Ljg4IGMgLTY3Ni42LC0yMjEuOTEgLTE0MDEuMiwtMzM5LjYgLTIxNDkuODYsLTMzOS42IC02NC4yMywwIC0xMjguMzEsMCAtMTkyLjU4LDUuMzYgbCAtMTcxLjEsNDcwMy41MyBjIDAsMTM2LjM2IDI5LjQzLDI1NCA5MC45NSwzNzQuMjkgNDIuNzYsOTAuOTUgNTI0LjA3LDY2My4xMyA2MjIuOTksOTIyLjUzIDQ4LjE2LDEzMy43MSA4OC4yNSwyNjcuMzcgMTEyLjMzLDQwOS4xMyAxMDQuMjcsNjA0LjMxIC04LjAxLDEyNTEuNDIgLTU2LjEyLDE4NjEuMDkgLTEzLjQxLDE3MS4yIC0xOTcuOTMsMTgzNC4zIC0yNDAuNzMsMjEwMS43IC0yLjY1LDIxLjQgLTE2LjAyLDQyLjggLTM3LjM5LDU2LjEgLTguMDEsNS40IC0xOC43MiwxMC44IC0yNi43MywxMy41IC01Ni4xNywyNi43IC0xMTcuNjQsLTE4LjggLTExNy42NCwtODAuMyA4LjAxLC0yMTkuMyAyMS4zNywtNjkyLjYgMzcuMzksLTEyMjQuNiAyNC4wOCwtNjcxLjIgNTAuODYsLTE0MzYgNjkuNTMsLTE4OTUuODYgOC4wMSwtMTA0LjMyIC0zMi4wOCwtMjUxLjM5IC0xMjAuMzQsLTIyNy4zMiAtNjQuMTcsMTYuMDcgLTc3LjU0LDEwNC4yOCAtODUuNTUsMTc2LjQ2IGwgLTE3My44LDE5MTEuOTIgLTEyMC4zLDEzNDIuMyBjIC00NS41LDc0LjkgLTk5LjAxLDUzLjUgLTEzMS4wNSwtNS4zIGwgLTMyLjA5LC0xMzM3IC00NS40NSwtMTg2MS4wNiBjIDAsLTkzLjYxIC0xNi4wNywtMjExLjI1IC05Ni4zMSwtMjM1LjM3IC0xMC42MiwtMi42NiAtNDIuNzUsLTIuNjYgLTUzLjQ2LDAgLTgwLjIsMjQuMTIgLTk2LjIyLDE0MS43NiAtOTYuMjIsMjM1LjM3IGwgLTQ1LjUsMTg2MS4wNiAtMzIuMDQsMTMzNyBjIC0zMi4xNCw1OC44IC04NS42LDgwLjIgLTEzMS4wNSw1LjMgTCA4MTIwLjMzLDExNDM2LjEgNzk0Ni41OCw5NTI0LjE4IGMgLTUuMzYsLTcyLjE4IC0xOC43NywtMTYwLjM5IC04Mi45NSwtMTc2LjQ2IC04OC4xNiwtMjQuMDcgLTEyOC4zLDEyMyAtMTIwLjI5LDIyNy4zMiAxOC43Miw0NTkuODYgNDUuNSwxMjI0LjY2IDY2LjgzLDE4OTUuODYgMTguNzcsNTMyIDMyLjEzLDEwMDUuMyA0MC4xNCwxMjI0LjYgMCw2MS41IC02MS40NywxMDcgLTExNy42OCw4MC4zIC04LjAxLC0yLjcgLTE4LjcyLC04LjEgLTI5LjM5LC0xMy41IC0xOC43MiwtMTMuMyAtMzIuMDksLTM0LjcgLTM0Ljc5LC01Ni4xIC00Mi43NSwtMjY3LjQgLTIyNy4yMiwtMTkzMC41IC0yNDAuNjMsLTIxMDEuNyAtNDguMTYsLTYwOS42NyAtMTYzLjE0LC0xMjU2Ljc4IC01Ni4xMiwtMTg2MS4wOSAyNC4wMywtMTQxLjc2IDY0LjE3LC0yNzUuNDIgMTEyLjI4LC00MDkuMTMgOTguOTcsLTI1OS40IDU3Ny41MywtODMxLjU4IDYyMy4wMywtOTIyLjUzIDYxLjUzLC0xMjAuMjkgOTAuODcsLTIzNy45MyA5MC44NywtMzc0LjI5IEwgODAzMi4xMywyNDQ4Ljg3IGMgLTQ1Ny4yNCw4Mi45NCAtOTAxLjE2LDIxMy45NCAtMTMyMC45NSwzODUuMDkgbCAtMjE5LjIyLDk5OTIuNTQgYyAtNDA2LjQ3LC0xNTUuMSAtNjI1LjczLC0yNTkuMyAtODM0LjMyLC01MDggLTYxMi4zMiwtNzE2LjYgLTcwMy4yMywtMTU3NSAtNjMzLjcsLTYxMzEuMzkgMCwtNjM2LjQgMjE2LjU2LC01NjEuNTEgNTU2LjE2LC05MjcuODkgMTguNzIsLTE4LjcyIC01LjM2LC04MTAuMiAtNDAuMSwtMTgyMC45NCAtMTkzMy4yNywxMjQwLjcgLTMyMTEuNDMsMzQwOS4zIC0zMjExLjQzLDU4NzcuMzYgMCwzODU4LjU2IDMxMjguNTMsNjk4NC4zNiA2OTg3LjA3LDY5ODQuMzYgMzg1OC41NiwwIDY5ODQuMzYsLTMxMjUuOCA2OTg0LjM2LC02OTg0LjM2IiAvPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz4=';
@endphp

<div style="margin: -8px 0 20px; background: #ffffff;">
    <div style="padding: 18px 20px 14px; background: #ffffff;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin: 0 0 8px;">
            <tr>
                <td style="width: 74px; vertical-align: middle;">
                    <span style="display: inline-block; width: 68px; height: 68px; border-radius: 12px; border: 1px solid #fee2e2; background: #ffffff; overflow: hidden;">
                        <img src="{{ $logoDataUri }}" width="68" height="68" alt="LetsEat logo" style="display: block; width: 68px; height: 68px;" />
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
