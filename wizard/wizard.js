document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            button.classList.add('active');
            const tabId = `${button.dataset.tab}-tab`;
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Timer type toggle (duration vs date)
    const timerTypeRadios = document.querySelectorAll('input[name="timer-type"]');
    const durationSettings = document.getElementById('duration-settings');
    const dateSettings = document.getElementById('date-settings');
    
    timerTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'duration') {
                durationSettings.style.display = 'block';
                dateSettings.style.display = 'none';
            } else {
                durationSettings.style.display = 'none';
                dateSettings.style.display = 'block';
            }
            updateUrlOutput();
        });
    });
    
    // Set today's date and current time as defaults for date picker
    const today = new Date();
    const targetDate = document.getElementById('target-date');
    const targetTime = document.getElementById('target-time');
    if (targetDate) targetDate.valueAsDate = today;
    if (targetTime) {
        const hh = String(today.getHours()).padStart(2, '0');
        const mm = String(today.getMinutes()).padStart(2, '0');
        targetTime.value = `${hh}:${mm}`;
    }
    
    // Color defaults toggle (visibility + disable)
    const useDefaultColors = document.getElementById('use-default-colors');
    const colorInputs = document.querySelectorAll('.color-option input'); // color + any alpha sliders if placed inside .color-option
    const colorOptionsDiv = document.getElementById('color-options') || document.querySelector('.color-options'); // wrapper to hide/show

    function syncColorOptionsVisibility() {
        if (!useDefaultColors || !colorOptionsDiv) return;
        const hide = useDefaultColors.checked; // hide when using theme defaults
        colorOptionsDiv.hidden = hide;                // semantic
        colorOptionsDiv.style.display = hide ? 'none' : ''; // inline style overrides grid
        colorInputs.forEach(input => { input.disabled = hide; });
    }

    if (useDefaultColors) {
        useDefaultColors.addEventListener('change', () => {
            syncColorOptionsVisibility();
            updateUrlOutput();
        });
        // Initial state
        syncColorOptionsVisibility();
    }

    // Font scale readout
    const fontScaleInput = document.getElementById('fontscale');
    const fontScaleValue = document.getElementById('fontscale-value');
    if (fontScaleInput && fontScaleValue) {
        const updateFontScaleReadout = () => {
            const val = parseFloat(fontScaleInput.value);
            fontScaleValue.textContent = `${isNaN(val) ? '1.00' : val.toFixed(2)}x`;
        };
        fontScaleInput.addEventListener('input', updateFontScaleReadout);
        fontScaleInput.addEventListener('change', updateFontScaleReadout);
        updateFontScaleReadout();
    }

    // Alpha slider readouts (optional; only activates if sliders exist)
    const alphaIds = ['bgcolor','timercolor','textcolor','labelcolor','progresscolor','titlecolor'];
    alphaIds.forEach(id => {
        const slider = document.getElementById(`${id}-alpha`);
        const readout = document.getElementById(`${id}-alpha-readout`);
        if (slider && readout) {
            const sync = () => { readout.textContent = `${slider.value}%`; };
            slider.addEventListener('input', sync);
            slider.addEventListener('change', sync);
            sync();
        }
    });

    // Helpers to build 8-digit hex when opacity < 100%
    function percentToAlphaHex(pct) {
        const clamped = Math.max(0, Math.min(100, parseInt(pct, 10) || 0));
        const alpha = Math.round((clamped / 100) * 255);
        return alpha.toString(16).padStart(2, '0');
    }
    function buildColorParam(hex6NoHash, alphaPercent) {
        const base = (hex6NoHash || '').toLowerCase();
        const a = parseInt(alphaPercent, 10);
        if (isNaN(a) || a >= 100) return base; // 6-digit when fully opaque
        return base + percentToAlphaHex(a);     // append AA when < 100%
    }
    
    // Function to get base URL
    function getBaseUrl() {
        return window.location.href.replace(/\/wizard\/.*$/, '/index.html');
    }
    
    // Function to update URL output
    function updateUrlOutput() {
        const urlParams = new URLSearchParams();
        const baseUrl = getBaseUrl();
        
    // Time parameters
    const timerTypeEl = document.querySelector('input[name="timer-type"]:checked');
    const timerType = timerTypeEl ? timerTypeEl.value : 'duration';
    const directionEl = document.querySelector('input[name="timer-direction"]:checked');
    const direction = directionEl ? directionEl.value : 'down';
    if (direction === 'up') urlParams.append('direction', 'up');
        
        if (timerType === 'duration') {
            const days = parseInt(document.getElementById('days').value || '0', 10);
            const hours = parseInt(document.getElementById('hours').value || '0', 10);
            const minutes = parseInt(document.getElementById('minutes').value || '0', 10);
            const seconds = parseInt(document.getElementById('seconds').value || '0', 10);
            
            if (days > 0) urlParams.append('days', days);
            if (hours > 0) urlParams.append('hours', hours);
            if (minutes > 0) urlParams.append('minutes', minutes);
            if (seconds > 0) urlParams.append('seconds', seconds);
            
            if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
                urlParams.append('minutes', 5);
            }
        } else {
            const dateValue = document.getElementById('target-date').value;
            const timeValue = document.getElementById('target-time').value;
            if (dateValue) {
                urlParams.append('date', timeValue ? `${dateValue}T${timeValue}:00` : dateValue);
            }
        }
        
        // Timezone
        const timezone = document.getElementById('timezone').value;
        if (timezone) urlParams.append('timezone', timezone);
        
        // Display options
        if (document.getElementById('showcontext') && document.getElementById('showcontext').checked) {
            urlParams.append('showcontext', 'true');
        }
        const title = document.getElementById('title').value;
        if (title) urlParams.append('title', encodeURIComponent(title));
        
        const theme = document.getElementById('theme').value;
        if (theme !== 'light') urlParams.append('theme', theme);
        
        const display = document.getElementById('display').value;
        if (display !== 'standard') urlParams.append('display', display);
        
        const units = document.getElementById('units').value;
        if (units !== 'auto') urlParams.append('units', units);
        
        if (document.getElementById('progress').checked) urlParams.append('progress', 'true');
        
        const endmessage = document.getElementById('endmessage').value;
        if (endmessage && endmessage !== '⌛️') urlParams.append('endmessage', encodeURIComponent(endmessage));
        
        const showonend = document.getElementById('showonend').value;
        if (showonend !== 'message') urlParams.append('showonend', showonend);
        
        if (!document.getElementById('mobile').checked) urlParams.append('mobile', 'false');

        // Style options: font scale (only when not default 1.0)
        if (fontScaleInput) {
            const fs = parseFloat(fontScaleInput.value);
            if (!isNaN(fs) && Math.abs(fs - 1) > 0.0001) {
                const formatted = Math.round(fs * 100) / 100;
                urlParams.append('fontscale', String(formatted));
            }
        }
        
        // Colors with alpha support
        const defaults = {
            bgcolor: 'f5f5f5',
            timercolor: 'ffffff',
            textcolor: '333333',
            labelcolor: '666666',
            progresscolor: '4caf50',
            titlecolor: '333333'
        };
        if (!useDefaultColors || (useDefaultColors && !useDefaultColors.checked)) {
            function addColorParam(name) {
                const colorEl = document.getElementById(name);
                if (!colorEl) return;
                const hex6 = colorEl.value.substring(1);
                const alphaEl = document.getElementById(`${name}-alpha`);
                const alpha = alphaEl ? alphaEl.value : '100'; // assume fully opaque if no slider present
                const isDefault = hex6.toLowerCase() === defaults[name];

                // Include if color != default OR opacity < 100
                if (!isDefault || parseInt(alpha, 10) < 100) {
                    urlParams.append(name, buildColorParam(hex6, alpha));
                }
            }
            ['bgcolor','timercolor','textcolor','labelcolor','progresscolor','titlecolor'].forEach(addColorParam);
        }
        
        // Redirect options
        const redirecturl = document.getElementById('redirecturl').value;
        if (redirecturl) {
            urlParams.append('redirecturl', redirecturl);
            const redirectdelay = document.getElementById('redirectdelay').value;
            if (redirectdelay && redirectdelay !== '1') urlParams.append('redirectdelay', redirectdelay);
        }
        
        // Webhook options
        const webhookurl = document.getElementById('webhookurl').value;
        if (webhookurl) {
            urlParams.append('webhookurl', webhookurl);
            const webhookmethod = document.getElementById('webhookmethod').value;
            if (webhookmethod !== 'GET') urlParams.append('webhookmethod', webhookmethod);
            const webhookdelay = document.getElementById('webhookdelay').value;
            if (webhookdelay && webhookdelay !== '0') urlParams.append('webhookdelay', webhookdelay);
            const webhookcors = document.getElementById('webhookcors').value;
            if (webhookcors !== 'default') urlParams.append('webhookcors', webhookcors);
        }
        
        // Generate the final URL
        const finalUrl = baseUrl + (urlParams.toString() ? '?' + urlParams.toString() : '');
        document.getElementById('url-output').textContent = finalUrl;
    }
    
    // Update URL on any input change
    const formElements = document.querySelectorAll('input, select');
    formElements.forEach(element => {
        element.addEventListener('change', updateUrlOutput);
        element.addEventListener('input', updateUrlOutput);
    });
    
    // Copy URL button
    document.getElementById('copy-url').addEventListener('click', () => {
        const urlText = document.getElementById('url-output').textContent;
        navigator.clipboard.writeText(urlText).then(() => {
            alert('URL copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy URL: ', err);
        });
    });
    
    // Test Timer button
    document.getElementById('test-timer').addEventListener('click', () => {
        const urlText = document.getElementById('url-output').textContent;
        window.open(urlText, '_blank');
    });
    
    // Initialize URL output
    updateUrlOutput();
});