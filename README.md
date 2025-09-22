# Simple Countdown Timer

A clean, customizable countdown timer that can be configured entirely through URL parameters. Perfect for presentations, OBS overlays, streams, or any scenario where you need a visual countdown.

## Demo

Try it live at: [countdown.example.com](https://countdown.example.com)

## Usage

Simply open `index.html` in a browser, or use URL parameters to customize the timer: https://path-to-timer/index.html?minutes=10&theme=dark


## URL Parameters

### Time Configuration

| Parameter | Description | Example |
|-----------|-------------|---------|
| `date` | Set a specific target date/time | `?date=2023-12-31` or `?date=2023-12-31T23:59:59` |
| `days` | Add days to current time | `?days=7` |
| `hours` | Add hours to current time | `?hours=3` |
| `minutes` | Add minutes to current time | `?minutes=30` |
| `seconds` | Add seconds to current time | `?seconds=45` |
| `timezone` | Specify timezone for the timer | `?timezone=America/New_York` |

Multiple time units can be combined: `?days=1&hours=12`

### Display Options

| Parameter | Description | Values |
|-----------|-------------|--------|
| `theme` | Set the color theme | `light` (default), `dark` |
| `display` | Set the display format | `standard` (default), `compact` |
| `units` | Control time unit display | `auto` (default), `full` |
| `progress` | Show progress bar | `true`, `false` (default) |
| `title` | Add a title above the timer | `?title=Meeting%20Timer` |
| `endmessage` | Custom text or emoji shown when timer completes | `?endmessage=🎉` (default: ⌛️) |
| `showonend` | Control what to display when timer ends | `message` (default, shows endmessage), `zero` (shows 00:00), `none` (shows nothing) |
| `resume` | Resume interrupted timer | `true`, `false` (default) |
| `mobile` | Control mobile optimization | `true` (default), `false` |
| `redirecturl` | URL to redirect to when timer completes | `?redirecturl=https://example.com` |
| `redirectdelay` | Seconds to wait before redirecting (default: 1) | `?redirectdelay=5` |

### Color Customization

All color parameters accept hex color codes **without** the # symbol.

| Parameter | Description | Example |
|-----------|-------------|---------|
| `bgcolor` | Background color | `?bgcolor=f0f0f0` |
| `timercolor` | Timer background color | `?timercolor=ffffff` |
| `textcolor` | Main text color | `?textcolor=333333` |
| `labelcolor` | Label text color | `?labelcolor=666666` |
| `progresscolor` | Progress bar color | `?progresscolor=4caf50` |
| `titlecolor` | Title text color | `?titlecolor=333333` |

## Timezone Support

The timer supports specifying a timezone to ensure consistent countdown behavior regardless of where it's viewed:

- Use IANA timezone names like `America/New_York`, `Europe/London`, `Asia/Tokyo`
- When a timezone is specified, all time calculations use that timezone instead of the viewer's local timezone
- Useful for coordinating events across different regions

Example: `?date=2023-12-31T00:00:00&timezone=America/New_York`

## Mobile Optimization

The timer automatically optimizes its display for mobile devices:

- Detects mobile devices and adjusts layout for better viewing
- Can be disabled with `?mobile=false` if you prefer the desktop layout on all devices
- Improves readability and touch interaction on small screens
- Especially useful for sharing countdown links that might be opened on phones

## Timer Resumption (For Duration-Based Timers)

The timer uses localStorage to allow resuming interrupted timers that are created with duration parameters (days, hours, minutes, seconds):

- If you refresh or close the page during an active countdown, a resume banner will appear when you return
- Click "Resume" or use `?resume=true` parameter to continue the countdown
- The timer state is saved every 10 seconds
- Progress bar position is correctly restored when resuming
- Resumable timers expire after 24 hours
- Note: Date-based timers (using the `date` parameter) do not support resumption

## Webhook Integration

The timer can call a webhook URL when the countdown completes, useful for integrating with external systems like Bitfocus Companion:

| Parameter | Description | Values |
|-----------|-------------|--------|
| `webhookurl` | URL to call when timer completes | `?webhookurl=https://example.com/api/hook` |
| `webhookmethod` | HTTP method to use for webhook call | `GET` (default), `POST` |
| `webhookdelay` | Seconds to wait before calling webhook | `?webhookdelay=2` (default: 0) |

When using `POST` method, a JSON payload is sent with the event type and timestamp:
```json
{
  "event": "timer_complete",
  "timestamp": "2023-04-15T12:00:00.000Z"
}



## Examples

1. **10-minute timer with dark theme and title**:
2. **Countdown to a specific date with timezone**:
3. **3-day countdown showing all units with progress bar**:
4. **Presentation timer with custom colors**:
5. **Custom end message when timer completes**:
6. **Show zeros when timer ends**:
7. **Show nothing when timer ends**:
8. **Resume an interrupted timer**:
9. **Event timer with mobile optimization disabled**:
10. **Redirect to a URL when timer completes**:
11. **Redirect with a 3-second delay**:
12. **Call a webhook when timer completes**: `?minutes=5&webhookurl=https://example.com/api/timer-done`
13. **Call a webhook with POST and delay**: `?minutes=1&webhookurl=https://example.com/api/timer-done&webhookmethod=POST&webhookdelay=2`





## OBS Integration Tips

For best results when using as an OBS Browser Source:

1. Set width and height to match your desired dimensions (e.g., 800×200)
2. Enable "Shutdown source when not visible" to conserve resources
3. Disable "Refresh browser when scene becomes active" to prevent timer resets
4. Use custom CSS in OBS to make the background transparent if needed:
```css
body { background-color: rgba(0, 0, 0, 0) !important; }
```

## Technical Details

- Pure HTML, CSS, and JavaScript - no dependencies
- Responsive design with font clamps for consistent display at any size
- Optimized for OBS, shared displays, and mobile devices
- Uses the Intl.DateTimeFormat API for timezone support
- Uses localStorage for timer state persistence (resume feature for duration-based timers)
- Font scaling that works well across all device sizes

MIT License