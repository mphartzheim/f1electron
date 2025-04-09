let countdownInterval;
let liveButtonInterval;

async function updateNextSessionCountdown() {
    const el = document.getElementById('next-session-countdown');
    if (!el) return;

    try {
        const response = await fetch('https://api.jolpi.ca/ergast/f1/current/next.json');
        const data = await response.json();
        const race = data?.MRData?.RaceTable?.Races?.[0];

        if (!race) {
            el.textContent = '⏳ Next session: unavailable';
            return;
        }

        const sessionOrder = [
            { key: 'FirstPractice', label: 'Practice 1' },
            { key: 'SecondPractice', label: 'Practice 2' },
            { key: 'ThirdPractice', label: 'Practice 3' },
            { key: 'Sprint', label: 'Sprint' },
            { key: 'Qualifying', label: 'Qualifying' },
            { key: 'Race', label: 'Race' },
        ];

        let next = null;

        for (const session of sessionOrder) {
            const entry = session.key === 'Race'
                ? { date: race.date, time: race.time }
                : race[session.key];

            if (entry) {
                const sessionTime = new Date(`${entry.date}T${entry.time}`);
                if (sessionTime > new Date()) {
                    next = { name: session.label, time: sessionTime };
                    break;
                }
            }
        }

        if (!next) {
            el.textContent = '⏳ All sessions completed for this race.';
            return;
        }

        startLiveButtonWatcher(next);

        // Clear any existing interval
        if (countdownInterval) clearInterval(countdownInterval);

        countdownInterval = setInterval(() => {
            const now = new Date();
            const diffMs = next.time - now;

            if (diffMs <= 0) {
                el.textContent = `⏳ ${next.name} is starting now!`;
                clearInterval(countdownInterval);
                return;
            }

            const totalSeconds = Math.floor(diffMs / 1000);
            const weeks = Math.floor(totalSeconds / 604800);
            const days = Math.floor((totalSeconds % 604800) / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            // Build the display string
            const parts = [];
            if (weeks > 0) parts.push(`${weeks}w`);
            if (days > 0) parts.push(`${days}d`);

            // Always show hours, minutes, and seconds with two digits.
            parts.push(`${String(hours).padStart(2, '0')}h`);
            parts.push(`${String(minutes).padStart(2, '0')}m`);
            parts.push(`${String(seconds).padStart(2, '0')}s`);

            el.textContent = `⏳ Next session: ${next.name} in ${parts.join(' ')}`;
        }, 1000);

    } catch (err) {
        console.error('❌ Countdown error:', err);
        el.textContent = '⏳ Countdown unavailable.';
    }
}

function startLiveButtonWatcher(session) {
    const el = document.getElementById('live-button');
    if (!el) return;

    if (liveButtonInterval) clearInterval(liveButtonInterval);

    liveButtonInterval = setInterval(() => {
        const now = new Date().getTime();
        const sessionStart = session.start.getTime();
        const liveStart = sessionStart - session.preroll;
        const liveEnd = sessionStart + session.duration;

        if (now >= liveStart && now <= liveEnd) {
            el.style.display = 'inline-block';
        } else {
            el.style.display = 'none';
        }
    }, 1000);
}