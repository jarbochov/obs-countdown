document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
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
    
    targetDate.valueAsDate = today;
    
    // Format current time as HH:MM
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    targetTime.value = `${hours}:${minutes}`;
    
    // Color defaults toggle
    const useDefaultColors = document.getElementById('use-default-colors');
    const colorInputs = document.querySelectorAll('.color-option input');
    
    if (useDefaultColors) {
        useDefaultColors.addEventListener('change', () => {
            colorInputs.forEach(input => {
                input.disabled = useDefaultColors.checked;
            });
            updateUrlOutput();
        });
        
        // Initial state for color inputs
        colorInputs.forEach(input => {
            input.disabled = useDefaultColors.checked;
        });
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
    
    // Function to get base URL
    function getBaseUrl() {
        // If your timer is at the root of your site:
        return window.location.href.replace(/\/wizard\/.*$/, '/index.html');
        
        // Or if you need a specific URL:
        // return "https://your-domain.com/index.html";
    }
    
    // Function to update URL output
    function updateUrlOutput() {
        const urlParams = new URLSearchParams();
        const baseUrl = getBaseUrl();
        
        // Time parameters
        const timerType = document.querySelector('input[name="timer-type"]:checked').value;
        
        if (timerType === 'duration') {
            const days = parseInt(document.getElementById('days').value);
            const hours = parseInt(document.getElementById('hours').value);
            const minutes = parseInt(document.getElementById('minutes').value);
            const seconds = parseInt(document.getElementById('seconds').value);
            
            if (days > 0) urlParams.append('days', days);
            if (hours > 0) urlParams.append('hours', hours);
            if (minutes > 0) urlParams.append('minutes', minutes);
            if (seconds > 0) urlParams.append('seconds', seconds);
            
            // If all values are 0, set default of 5 minutes
            if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
                urlParams.append('minutes', 5);
            }
        } else {
            // Date-based timer
            const dateValue = document.getElementById('target-date').value;
            const timeValue = document.getElementById('target-time').value;
            
            if (dateValue) {
                // Combine date and time
                if (timeValue) {
                    urlParams.append('date', `${dateValue}T${timeValue}:00`);
                } else {
                    urlParams.append('date', dateValue);
                }
            }
        }
        
        // Timezone
        const timezone = document.getElementById('timezone').value;
        if (timezone) {
            urlParams.append('timezone', timezone);
        }
        
        // Display options
        const title = document.getElementById('title').value;
        if (title) {
            urlParams.append('title', encodeURIComponent(title));
        }
        
        const theme = document.getElementById('theme').value;
        if (theme !== 'light') {
            urlParams.append('theme', theme);
        }
        
        const display = document.getElementById('display').value;
        if (display !== 'standard') {
            urlParams.append('display', display);
        }
        
        const units = document.getElementById('units').value;
        if (units !== 'auto') {
            urlParams.append('units', units);
        }
        
        if (document.getElementById('progress').checked) {
            urlParams.append('progress', 'true');
        }
        
        const endmessage = document.getElementById('endmessage').value;
        if (endmessage && endmessage !== '⌛️') {
            urlParams.append('endmessage', encodeURIComponent(endmessage));
        }
        
        const showonend = document.getElementById('showonend').value;
        if (showonend !== 'message') {
            urlParams.append('showonend', showonend);
        }
        
        if (!document.getElementById('mobile').checked) {
            urlParams.append('mobile', 'false');
        }

        // Style options
        // Font scale: only include when not the default 1.0
        if (fontScaleInput) {
            const fs = parseFloat(fontScaleInput.value);
            if (!isNaN(fs) && Math.abs(fs - 1) > 0.0001) {
                const formatted = Math.round(fs * 100) / 100; // up to 2 decimals
                urlParams.append('fontscale', String(formatted));
            }
        }
        
        // Color customization
        if (!useDefaultColors || (useDefaultColors && !useDefaultColors.checked)) {
            // Helper function to strip # from color values and only add if different from defaults
            function addColorParam(paramName, inputId, defaultValue) {
                const el = document.getElementById(inputId);
                if (!el) return;
                const colorValue = el.value.substring(1);
                if (colorValue.toLowerCase() !== defaultValue.toLowerCase()) {
                    urlParams.append(paramName, colorValue);
                }
            }
            
            addColorParam('bgcolor', 'bgcolor', 'f5f5f5');
            addColorParam('timercolor', 'timercolor', 'ffffff');
            addColorParam('textcolor', 'textcolor', '333333');
            addColorParam('labelcolor', 'labelcolor', '666666');
            addColorParam('progresscolor', 'progresscolor', '4caf50');
            addColorParam('titlecolor', 'titlecolor', '333333');
        }
        
        // Redirect options
        const redirecturl = document.getElementById('redirecturl').value;
        if (redirecturl) {
            urlParams.append('redirecturl', redirecturl);
            
            const redirectdelay = document.getElementById('redirectdelay').value;
            if (redirectdelay && redirectdelay !== '1') {
                urlParams.append('redirectdelay', redirectdelay);
            }
        }
        
        // Webhook options
        const webhookurl = document.getElementById('webhookurl').value;
        if (webhookurl) {
            urlParams.append('webhookurl', webhookurl);
            
            const webhookmethod = document.getElementById('webhookmethod').value;
            if (webhookmethod !== 'GET') {
                urlParams.append('webhookmethod', webhookmethod);
            }
            
            const webhookdelay = document.getElementById('webhookdelay').value;
            if (webhookdelay && webhookdelay !== '0') {
                urlParams.append('webhookdelay', webhookdelay);
            }
            // Webhook CORS mode
            const webhookcors = document.getElementById('webhookcors').value;
            if (webhookcors !== 'default') {
                urlParams.append('webhookcors', webhookcors);
            }
        }
        
        // Generate the final URL
        const finalUrl = baseUrl + (urlParams.toString() ? '?' + urlParams.toString() : '');
        document.getElementById('url-output').textContent = finalUrl;
    }
    
    // Add event listeners to all form elements
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