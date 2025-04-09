async function loadQualifyingResults(round = null, season = null) {
    const container = document.getElementById('results-content');
    container.innerHTML = '<div class="spinner">Loading qualifying results…</div>';

    state.selectedSession = 'qualifying';

    const year = season || state.selectedSeason || new Date().getFullYear();
    const raceRound = round || state.selectedRound;

    const url = `https://api.jolpi.ca/ergast/f1/${year}/${raceRound}/qualifying.json`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const race = data?.MRData?.RaceTable?.Races?.[0];
        const results = race?.QualifyingResults;

        if (!results || results.length === 0) {
            container.innerHTML = 'No qualifying results available.';
            return;
        }

        const lat = race.Circuit?.Location?.lat;
        const lon = race.Circuit?.Location?.long;
        const mapURL = lat && lon
            ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=15`
            : null;

        container.innerHTML = buildResultsHeader(race, mapURL) + '<ul class="results-list" id="results-list"></ul>';

        renderResultsList(results, 'qualifying');

    } catch (err) {
        console.error('❌ Error loading qualifying results:', err);
        container.innerHTML = '⚠️ Failed to load qualifying results.';
    }
}
