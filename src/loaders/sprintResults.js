async function loadSprintResults(round = null, season = null) {
    const container = document.getElementById('results-content');
    container.innerHTML = '<div class="spinner">Loading sprint results…</div>';

    state.selectedSession = 'sprint';

    const year = season || state.selectedSeason || new Date().getFullYear();
    const raceRound = round || state.selectedRound;

    const url = `https://api.jolpi.ca/ergast/f1/${year}/${raceRound}/sprint.json`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const race = data?.MRData?.RaceTable?.Races?.[0];
        const results = race?.SprintResults;

        if (!results || results.length === 0) {
            container.innerHTML = 'No sprint results available.';
            return;
        }

        const lat = race.Circuit?.Location?.lat;
        const lon = race.Circuit?.Location?.long;
        const mapURL = lat && lon
            ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=15`
            : null;

        container.innerHTML = buildResultsHeader(race, mapURL) + '<ul class="results-list" id="results-list"></ul>';
        renderResultsList(results, 'sprint'); // same UI as race

    } catch (err) {
        console.error('❌ Error loading sprint results:', err);
        container.innerHTML = '⚠️ Failed to load sprint results.';
    }
}
