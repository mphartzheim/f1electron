let resultsViewMode = 'race';

document.addEventListener('DOMContentLoaded', async () => {
    const modal = document.getElementById('map-modal');
    const closeMapBtn = document.getElementById('close-map');
    const webModal = document.getElementById('web-modal');
    const closeWebBtn = document.getElementById('close-web');
    const themeSelect = document.getElementById('theme-select');

    // Theme select + persistence
    const savedTheme = localStorage.getItem('selectedTheme') || 'dark';
    themeSelect.value = savedTheme;
    document.body.classList.add(`theme-${savedTheme}`);

    themeSelect.onchange = (e) => {
        const theme = e.target.value;
        document.body.className = ''; // reset
        document.body.classList.add(`theme-${theme}`);
        localStorage.setItem('selectedTheme', theme);
    };

    // Setup tab switching
    const initialTab = window.location.hash.replace('#', '') || 'upcoming';
    switchTab(initialTab, false);

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            switchTab(tabId, true);
        });
    });

    // Load upcoming race and start countdown
    try {
        await loadUpcomingRace();
        updateNextSessionCountdown();
        scheduleRefreshEveryFiveMinutes()
    } catch (e) {
        console.error('Failed to load upcoming race:', e);
    }

    // Wiki buttons
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.wiki-button');
        if (!btn) return;

        const { type, url, lat, lon, season, round } = btn.dataset;

        switch (type) {
            case 'map':
                openMapPopup(parseFloat(lat), parseFloat(lon));
                break;
            case 'wiki':
            case 'circuit':
                openWebModal(url);
                break;
            case 'results':
                state.selectedSeason = season;
                state.selectedRound = round;
                loadRaceResultsTab(season, round, "race");
                break;
        }
    });

    // Close map modal
    closeMapBtn.onclick = () => {
        modal.classList.add('hidden');
        if (mapInstance) {
            mapInstance.remove();
            mapInstance = null;
        }
    };

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            if (mapInstance) {
                mapInstance.remove();
                mapInstance = null;
            }
        }
    });

    // Close web modal
    closeWebBtn.addEventListener('click', closeWebModal);

    webModal.addEventListener('click', (e) => {
        if (e.target === webModal) {
            closeWebModal();
        }
    });
});

window.addEventListener('popstate', (event) => {
    const tabId = event.state?.tabId || 'schedule';
    switchTab(tabId, false);
});
