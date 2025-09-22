document.addEventListener('DOMContentLoaded', function() {
    // Debug: Check for saved timer data at startup
    console.log('Checking for saved timer data...');
    try {
        const savedData = localStorage.getItem('current_timer');
        if (savedData) {
            console.log('Found saved timer data:', JSON.parse(savedData));
        } else {
            console.log('No saved timer data found');
        }
    } catch (e) {
        console.error('Error reading saved timer data:', e);
    }

    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
        // Add showonend parameter: 'zero' or 'none'
        const showOnEnd = urlParams.get('showonend') || 'none';
    let targetDate;
    let startDate;
    let countdownInterval;
    let totalDuration = 0;
    let originalDuration = 0; // Store the original duration for progress bar calculations
    let isDateBasedTimer = false; // Flag to identify date-based timers
    
    // Get timezone parameter (e.g., 'America/New_York', 'Europe/London')
    const timezone = urlParams.get('timezone');
    
    // Check mobile optimization preference
    const mobileParam = urlParams.get('mobile');
    const mobileOptimized = mobileParam !== 'false';
    
    // Apply mobile optimization if enabled and on a mobile device
    if (mobileOptimized && isMobileDevice()) {
        document.body.classList.add('mobile-optimized');
    }
    
    // Function to detect if the user is on a mobile device
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768);
    }
    
    // Function to create a date with the specified timezone if provided
    function createDate(dateString) {
        const date = new Date(dateString);
        
        if (!timezone) {
            return date; // Use local timezone if none specified
        }
        
        try {
            // Convert the date to the specified timezone
            const options = { timeZone: timezone };
            
            // Create formatter for the target timezone
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: false
            });
            
            // Get the parts of the formatted date
            const parts = formatter.formatToParts(date);
            let year, month, day, hour, minute, second;
            
            // Extract values from parts
            parts.forEach(part => {
                switch(part.type) {
                    case 'year': year = parseInt(part.value); break;
                    case 'month': month = parseInt(part.value) - 1; break; // JS months are 0-based
                    case 'day': day = parseInt(part.value); break;
                    case 'hour': hour = parseInt(part.value); break;
                    case 'minute': minute = parseInt(part.value); break;
                    case 'second': second = parseInt(part.value); break;
                }
            });
            
            // Create a new date using the timezone's time components
            return new Date(Date.UTC(year, month, day, hour, minute, second));
        } catch (e) {
            console.error(`Error with timezone "${timezone}":`, e);
            return date; // Fallback to system timezone if there's an error
        }
    }
    
    // Function to get current date with timezone adjustment if specified
    function getCurrentDate() {
        if (!timezone) {
            return new Date(); // Use local timezone if none specified
        }
        
        try {
            // Get current time in the specified timezone
            return createDate(new Date().toISOString());
        } catch (e) {
            console.error(`Error getting current time in timezone "${timezone}":`, e);
            return new Date(); // Fallback to system timezone
        }
    }
    
    // Set theme based on URL parameter
    const theme = urlParams.get('theme') || 'light';
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    // Check if we should always show all units
    const unitsDisplay = urlParams.get('units') || 'auto';
    
    // Set display mode based on URL parameter
    const displayMode = urlParams.get('display') || 'standard';
    const standardTimer = document.getElementById('timer');
    const compactTimer = document.getElementById('compact-timer');
    
    if (displayMode === 'compact') {
        standardTimer.style.display = 'none';
        compactTimer.style.display = 'flex';
    } else {
        standardTimer.style.display = 'flex';
        compactTimer.style.display = 'none';
    }
    
    // Check for progress bar
    const showProgress = urlParams.get('progress') === 'true';
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    
    if (showProgress) {
        progressContainer.style.display = 'block';
    }
    
    // Check for timer title
    const timerTitle = urlParams.get('title');
    const timerTitleElement = document.getElementById('timer-title');
    
    if (timerTitle) {
        timerTitleElement.textContent = decodeURIComponent(timerTitle);
        timerTitleElement.style.display = 'block';
        // Update the page title as well
        document.title = decodeURIComponent(timerTitle) + ' - Countdown Timer';
    }
    
    // Apply custom colors if provided
    if (urlParams.has('bgcolor')) {
        document.documentElement.style.setProperty('--background-color', '#' + urlParams.get('bgcolor'));
    }
    
    if (urlParams.has('timercolor')) {
        document.documentElement.style.setProperty('--timer-background', '#' + urlParams.get('timercolor'));
    }
    
    if (urlParams.has('textcolor')) {
        document.documentElement.style.setProperty('--text-color', '#' + urlParams.get('textcolor'));
    }
    
    if (urlParams.has('labelcolor')) {
        document.documentElement.style.setProperty('--label-color', '#' + urlParams.get('labelcolor'));
    }
    
    if (urlParams.has('progresscolor')) {
        document.documentElement.style.setProperty('--progress-color', '#' + urlParams.get('progresscolor'));
    }
    
    if (urlParams.has('titlecolor')) {
        document.documentElement.style.setProperty('--title-color', '#' + urlParams.get('titlecolor'));
    }
    
    // Standard display elements
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    const daysContainer = document.getElementById('days-container');
    const hoursContainer = document.getElementById('hours-container');
    const minutesContainer = document.getElementById('minutes-container');
    const secondsContainer = document.getElementById('seconds-container');
    
    // Compact display elements
    const compactDaysElement = document.getElementById('compact-days');
    const compactHoursElement = document.getElementById('compact-hours');
    const compactMinutesElement = document.getElementById('compact-minutes');
    const compactSecondsElement = document.getElementById('compact-seconds');
    
    const daysDelimiter = document.querySelector('.days-delimiter');
    const hoursDelimiter = document.querySelector('.hours-delimiter');
    const minutesDelimiter = document.querySelector('.minutes-delimiter');
    
    const completeMessage = document.getElementById('complete-message');
    const resumeBanner = document.getElementById('resume-banner');
    
    // Save current timer state for potential resumption
    function saveTimerState() {
        try {
            // Only save if timer is active and NOT a date-based timer
            if (!isDateBasedTimer && targetDate > getCurrentDate()) {
                // Calculate current progress percentage
                let currentProgress = 0;
                if (originalDuration > 0) {
                    const now = getCurrentDate();
                    const remaining = targetDate - now;
                    const elapsed = originalDuration - remaining;
                    currentProgress = Math.min(100, (elapsed / originalDuration) * 100);
                }
                
                const timerState = {
                    // Only for relative timers, store the calculated target date
                    targetDate: targetDate.toISOString(),
                    startDate: startDate.toISOString(),
                    totalDuration: totalDuration,
                    originalDuration: originalDuration,
                    
                    // Store progress percentage
                    progressPercentage: currentProgress,
                    
                    // Store display settings
                    display: displayMode,
                    theme: theme,
                    units: unitsDisplay,
                    progress: showProgress ? 'true' : 'false',
                    title: timerTitle || '',
                    timezone: timezone || '',
                    mobile: mobileParam || 'true',
                    savedAt: new Date().toISOString(),
                    
                    // Include all color settings
                    bgcolor: urlParams.get('bgcolor') || '',
                    textcolor: urlParams.get('textcolor') || '',
                    timercolor: urlParams.get('timercolor') || '',
                    labelcolor: urlParams.get('labelcolor') || '',
                    progresscolor: urlParams.get('progresscolor') || '',
                    titlecolor: urlParams.get('titlecolor') || '',
                    completeemoji: urlParams.get('completeemoji') || ''
                };
                
                localStorage.setItem('current_timer', JSON.stringify(timerState));
            } else if (!isDateBasedTimer) {
                // Clear saved state if timer is complete
                localStorage.removeItem('current_timer');
            }
        } catch (e) {
            console.error("Error saving timer state:", e);
        }
    }
    
    // Resume a previously interrupted countdown (only for non-date-based timers)
    function resumeCountdown() {
        try {
            const savedState = JSON.parse(localStorage.getItem('current_timer'));
            if (!savedState) return false;
            
            const now = getCurrentDate();
            console.log('Attempting to resume timer:', savedState);
            
            // Make sure the saved state isn't too old (e.g., more than a day)
            const savedAt = new Date(savedState.savedAt);
            if (now - savedAt > 24 * 60 * 60 * 1000) {
                console.log('Saved timer is too old, not resuming');
                localStorage.removeItem('current_timer');
                return false;
            }
            
            // For time-based timers, recalculate the target date based on remaining time
            const savedTargetDate = createDate(savedState.targetDate);
            const elapsedSinceSave = now - savedAt;
            
            // Calculate how much time was remaining when the timer was saved
            const remainingAtSave = savedTargetDate - savedAt;
            
            // Calculate new remaining time by subtracting elapsed time since save
            const newRemainingTime = Math.max(0, remainingAtSave - elapsedSinceSave);
            
            console.log('Time remaining when saved (ms):', remainingAtSave);
            console.log('Time elapsed since save (ms):', elapsedSinceSave);
            console.log('New remaining time (ms):', newRemainingTime);
            
            // If no time remains, don't resume
            if (newRemainingTime <= 0) {
                console.log('No time remaining, not resuming timer');
                localStorage.removeItem('current_timer');
                return false;
            }
            
            // Set new target date based on current time + remaining time
            targetDate = new Date(now.getTime() + newRemainingTime);
            startDate = createDate(savedState.startDate);
            totalDuration = savedState.totalDuration;
            
            // Restore original duration for progress calculation
            originalDuration = savedState.originalDuration || savedState.totalDuration;
            
            // Calculate new progress percentage
            if (originalDuration > 0 && showProgress) {
                const elapsed = originalDuration - newRemainingTime;
                const percentComplete = Math.min(100, (elapsed / originalDuration) * 100);
                progressBar.style.width = percentComplete + '%';
                console.log('Updated progress bar to:', percentComplete + '%');
            }
            
            // Apply mobile optimization if needed
            const savedMobile = savedState.mobile !== 'false';
            if (savedMobile && isMobileDevice()) {
                document.body.classList.add('mobile-optimized');
            } else {
                document.body.classList.remove('mobile-optimized');
            }
            
            // Apply the saved title if present
            if (savedState.title) {
                timerTitleElement.textContent = savedState.title;
                timerTitleElement.style.display = 'block';
                document.title = savedState.title + ' - Countdown Timer';
            }
            
            // Apply saved display mode
            if (savedState.display === 'compact') {
                standardTimer.style.display = 'none';
                compactTimer.style.display = 'flex';
            } else {
                standardTimer.style.display = 'flex';
                compactTimer.style.display = 'none';
            }
            
            // Apply saved theme
            if (savedState.theme === 'dark') {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
            
            // Apply saved progress bar
            if (savedState.progress === 'true') {
                progressContainer.style.display = 'block';
            }
            
            // Apply saved colors
            const colorMappings = [
                { saved: 'bgcolor', css: '--background-color' },
                { saved: 'timercolor', css: '--timer-background' },
                { saved: 'textcolor', css: '--text-color' },
                { saved: 'labelcolor', css: '--label-color' },
                { saved: 'progresscolor', css: '--progress-color' },
                { saved: 'titlecolor', css: '--title-color' }
            ];
            
            colorMappings.forEach(mapping => {
                if (savedState[mapping.saved]) {
                    document.documentElement.style.setProperty(mapping.css, '#' + savedState[mapping.saved]);
                }
            });
            
            // Hide the resume banner
            resumeBanner.style.display = 'none';
            console.log('Timer successfully resumed with new target:', targetDate);
            
            return true;
        } catch (e) {
            console.error("Error resuming countdown:", e);
            return false;
        }
    }
    
    // Check if there's a saved timer that can be resumed
    function checkForResumableSessions() {
        try {
            const savedState = JSON.parse(localStorage.getItem('current_timer'));
            if (!savedState || !savedState.targetDate || !savedState.savedAt) return;
            
            const now = getCurrentDate();
            const savedAt = new Date(savedState.savedAt);
            const savedTargetDate = createDate(savedState.targetDate);
            
            // Calculate the remaining time with the correct approach
            const remainingAtSave = savedTargetDate - savedAt;
            const elapsedSinceSave = now - savedAt;
            const newRemainingTime = Math.max(0, remainingAtSave - elapsedSinceSave);
            
            // If timer is still valid (has remaining time, not too old)
            if (newRemainingTime > 0 && (now - savedAt < 24 * 60 * 60 * 1000)) {
                showResumeBanner(savedState);
            } else {
                // Clean up expired timer data
                localStorage.removeItem('current_timer');
            }
        } catch (e) {
            console.error("Error checking for resumable sessions:", e);
        }
    }
    
    // Helper function to show the resume banner
    function showResumeBanner(savedState) {
        resumeBanner.style.display = 'block';
        
        // Add the timer title to the resume banner if it exists
        if (savedState.title) {
            const resumeText = resumeBanner.querySelector('p');
            resumeText.innerHTML = `"${savedState.title}" timer was interrupted. <a href="?resume=true">Resume?</a>`;
        }
    }
    
    // IMPORTANT: Check for resume conditions BEFORE creating a new timer
    // This is critical to fix the resume functionality when refreshing the page
    if (urlParams.has('resume') && urlParams.get('resume') === 'true' && !urlParams.has('date')) {
        const resumed = resumeCountdown();
        
        // If successfully resumed, skip all other timer creation logic
        if (!resumed) {
            console.log('Resume failed, will create new timer if parameters exist');
            checkForResumableSessions();
        } else {
            console.log('Timer successfully resumed, skipping new timer creation');
        }
    } else if (!urlParams.has('days') && !urlParams.has('hours') && 
               !urlParams.has('minutes') && !urlParams.has('seconds') &&
               !urlParams.has('date')) {
        // Only check for resumable sessions if we're not creating a new timer
        checkForResumableSessions();
    }
    
    // If no target date set yet, create a new timer
    if (!targetDate) {
        // Check if a specific date is provided
        if (urlParams.has('date')) {
            isDateBasedTimer = true;
            const dateString = urlParams.get('date');
            
            // If only a date is provided (no time), set it to beginning of the day (00:00:00)
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                // Create date at 00:00:00 of the specified date in the given timezone
                targetDate = createDate(dateString + 'T00:00:00');
            } else {
                // If date and time are provided, use the specified timezone
                targetDate = createDate(dateString);
            }
            
            // Check if the date is valid
            if (isNaN(targetDate.getTime())) {
                console.error('Invalid date format. Use YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS');
                targetDate = null;
            }
        } 
        // Check for time units
        else {
            const now = getCurrentDate(); // Get current time in specified timezone
            startDate = new Date(now); // Store the start date for progress calculation
            targetDate = new Date(now);
            
            let addedTime = false;
            
            if (urlParams.has('days')) {
                const days = parseInt(urlParams.get('days'));
                targetDate.setDate(targetDate.getDate() + days);
                totalDuration += days * 24 * 60 * 60 * 1000;
                addedTime = true;
            }
            
            if (urlParams.has('hours')) {
                const hours = parseInt(urlParams.get('hours'));
                targetDate.setHours(targetDate.getHours() + hours);
                totalDuration += hours * 60 * 60 * 1000;
                addedTime = true;
            }
            
            if (urlParams.has('minutes')) {
                const minutes = parseInt(urlParams.get('minutes'));
                targetDate.setMinutes(targetDate.getMinutes() + minutes);
                totalDuration += minutes * 60 * 1000;
                addedTime = true;
            }
            
            if (urlParams.has('seconds')) {
                const seconds = parseInt(urlParams.get('seconds'));
                targetDate.setSeconds(targetDate.getSeconds() + seconds);
                totalDuration += seconds * 1000;
                addedTime = true;
            }
            
            // If no valid parameters were provided
            if (!addedTime) {
                // Default to 5 minutes if no parameters provided
                targetDate.setMinutes(targetDate.getMinutes() + 5);
                totalDuration = 5 * 60 * 1000;
            }
        }
        
        if (targetDate && !startDate) {
            // If we're counting down to a specific date, set startDate to now
            startDate = getCurrentDate();
            totalDuration = targetDate - startDate;
        }
        
        // Store the original duration for progress calculations
        originalDuration = totalDuration;
    }
    
    // Log for debugging
    console.log('Timezone:', timezone || 'Local (system)');
    console.log('Start date:', startDate);
    console.log('Target date:', targetDate);
    console.log('Total duration (ms):', totalDuration);
    console.log('Is date-based timer:', isDateBasedTimer);
    console.log('Mobile optimized:', mobileOptimized && isMobileDevice());
    
    // Update timer function
    function updateTimer() {
        const now = getCurrentDate(); // Get current time in specified timezone
        const difference = targetDate - now;
        
        // Check if countdown is complete
        if (difference <= 0) {
            clearInterval(countdownInterval);
                if (showOnEnd === 'zero') {
                    // Show zeroes in both displays
                    daysElement.textContent = '00';
                    hoursElement.textContent = '00';
                    minutesElement.textContent = '00';
                    secondsElement.textContent = '00';
                    compactDaysElement.textContent = '00';
                    compactHoursElement.textContent = '00';
                    compactMinutesElement.textContent = '00';
                    compactSecondsElement.textContent = '00';
                    // Show timer, hide complete message
                    standardTimer.style.display = displayMode === 'compact' ? 'none' : 'flex';
                    compactTimer.style.display = displayMode === 'compact' ? 'flex' : 'none';
                    progressContainer.style.display = 'none';
                    timerTitleElement.style.display = 'none';
                    completeMessage.style.display = 'none';
                } else {
                    // Hide timer, show complete message
                    standardTimer.style.display = 'none';
                    compactTimer.style.display = 'none';
                    progressContainer.style.display = 'none';
                    timerTitleElement.style.display = 'none';
                    completeMessage.style.display = 'block';
                    // Custom emoji for completion if provided
                    if (urlParams.has('completeemoji')) {
                        completeMessage.textContent = decodeURIComponent(urlParams.get('completeemoji'));
                    }
                }
                // Clear the saved timer state
                localStorage.removeItem('current_timer');
                return;
        }
        
        // Calculate time units
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        // Update standard display
        daysElement.textContent = formatNumber(days);
        hoursElement.textContent = formatNumber(hours);
        minutesElement.textContent = formatNumber(minutes);
        secondsElement.textContent = formatNumber(seconds);
        
        // Update progress bar if enabled
        if (showProgress && originalDuration > 0) {
            const elapsed = originalDuration - difference;
            const percentComplete = Math.min(100, (elapsed / originalDuration) * 100);
            progressBar.style.width = percentComplete + '%';
            
            // Log progress updates occasionally
            if (seconds % 10 === 0) {
                console.log('Progress updated:', percentComplete.toFixed(2) + '%');
            }
        }
        
        // Check if we should only show days (more than 1.5 days and not 'full' units mode)
        const totalHours = days * 24 + hours;
        const isLongDuration = totalHours >= 36; // 1.5 days = 36 hours
        const showOnlyDays = isLongDuration && unitsDisplay !== 'full';
        
        // Adaptive sizing based on visible units
        if (showOnlyDays) {
            // Days-only mode (very large days display)
            standardTimer.classList.add('days-only');
            standardTimer.classList.remove('short-timer');
            compactTimer.classList.add('days-only');
            compactTimer.classList.remove('short-timer');
        } else if (days === 0) {
            // Short timer (no days)
            standardTimer.classList.add('short-timer');
            standardTimer.classList.remove('days-only');
            compactTimer.classList.add('short-timer');
            compactTimer.classList.remove('days-only');
        } else {
            // Regular timer
            standardTimer.classList.remove('days-only');
            standardTimer.classList.remove('short-timer');
            compactTimer.classList.remove('days-only');
            compactTimer.classList.remove('short-timer');
        }
        
        // Show/hide relevant segments in standard display
        daysContainer.style.display = days > 0 ? 'flex' : 'none';
        
        if (showOnlyDays) {
            // If more than 1.5 days, only show days unless units=full
            hoursContainer.style.display = 'none';
            minutesContainer.style.display = 'none';
            secondsContainer.style.display = 'none';
        } else {
            // Use the original logic for showing/hiding units
            hoursContainer.style.display = (days > 0 || hours > 0) ? 'flex' : 'none';
            minutesContainer.style.display = (days > 0 || hours > 0 || minutes > 0) ? 'flex' : 'none';
            secondsContainer.style.display = 'flex'; // Always show seconds in standard mode
        }
        
        // Update compact display
        compactDaysElement.textContent = formatNumber(days);
        compactHoursElement.textContent = formatNumber(hours);
        compactMinutesElement.textContent = formatNumber(minutes);
        compactSecondsElement.textContent = formatNumber(seconds);
        
        // Apply the same logic to compact display
        if (showOnlyDays) {
            // If more than 1.5 days, only show days unless units=full
            compactDaysElement.style.display = 'inline';
            daysDelimiter.style.display = 'none'; // Hide delimiter after days
            compactHoursElement.style.display = 'none';
            hoursDelimiter.style.display = 'none';
            compactMinutesElement.style.display = 'none';
            minutesDelimiter.style.display = 'none';
            compactSecondsElement.style.display = 'none';
        } else {
            // Use the original logic for showing/hiding units
            const showDays = days > 0;
            const showHours = days > 0 || hours > 0;
            const showMinutes = days > 0 || hours > 0 || minutes > 0;
            
            compactDaysElement.style.display = showDays ? 'inline' : 'none';
            daysDelimiter.style.display = showDays ? 'inline' : 'none';
            
            compactHoursElement.style.display = showHours ? 'inline' : 'none';
            hoursDelimiter.style.display = showHours ? 'inline' : 'none';
            
            compactMinutesElement.style.display = showMinutes ? 'inline' : 'none';
            minutesDelimiter.style.display = showMinutes ? 'inline' : 'none';
            
            compactSecondsElement.style.display = 'inline'; // Always show seconds
        }
        
        // Save the timer state every 10 seconds for potential resumption
        // Only for non-date-based timers
        if (seconds % 10 === 0 && !isDateBasedTimer) {
            saveTimerState();
        }
    }
    
    // Format numbers to have leading zeros
    function formatNumber(number) {
        return number.toString().padStart(2, '0');
    }
    
    // Initial update
    if (targetDate) {
        updateTimer();
        
        // Update every second
        countdownInterval = setInterval(updateTimer, 1000);
        
        // Save initial state for non-date-based timers
        if (!isDateBasedTimer) {
            saveTimerState();
        }
    }
});