function switchTab(tabId, push = true) {
    // Deactivate all tabs
    document.querySelectorAll('.tab').forEach((tab) => {
        tab.classList.remove('active');
    });

    // Activate new tab
    const newTab = document.getElementById(tabId);
    if (newTab) {
        newTab.classList.add('active');

        // Push to browser history if applicable
        if (push) {
            history.pushState({ tabId }, '', `#${tabId}`);
        }

        requestAnimationFrame(() => {
            let loader = null;

            if (tabId === 'upcoming') {
                loader = loadUpcomingRace;
            } else if (tabId === 'schedule') {
                loader = loadRaceSchedule;
            } else if (tabId === 'results') {
                loader = () => loadRaceResults(state.selectedRound, state.selectedSeason, 'race');
            } else if (tabId === 'standings') {
                loader = loadStandings;
            }

            if (loader) {
                loader();
            }
        });
    }
}

function loadRaceResultsTab(season, round) {
    state.selectedSeason = season;
    state.selectedRound = round;
    switchTab('results', false);
}