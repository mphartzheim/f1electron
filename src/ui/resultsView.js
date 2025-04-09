state.resultsViewMode = state.resultsViewMode || 'race';

function resultsViewModeLabel(mode) {
    return {
        race: 'Race',
        qualifying: 'Qualifying',
        sprint: 'Sprint'
    }[mode] || '';
}

function cycleResultsMode(direction) {
    const modes = ['race', 'qualifying', 'sprint'];
    let i = modes.indexOf(state.selectedSession);

    do {
        i = (i + direction + modes.length) % modes.length;
        state.selectedSession = modes[i];
    } while (!state.availableResults?.[state.selectedSession] && state.selectedSession !== 'race');

    setSession(state.selectedSession)
}

function setSession(session) {
    state.selectedSession = session;
    switchTab('results', false); // Reload the results tab without pushing to history
}

function renderResultsSection() {
    const container = document.getElementById('results-content');
    const result = state.availableResults?.[state.resultsViewMode];

    if (!result) {
        container.innerHTML = `<p>❌ ${state.resultsViewMode} results not available.</p>`;
        return;
    }

    const race = result;
    const isSprint = state.resultsViewMode === 'sprint';
    const results = isSprint ? race?.SprintResults : race?.Results || race?.QualifyingResults;

    const lat = race.Circuit?.Location?.lat;
    const lon = race.Circuit?.Location?.long;
    const mapURL = lat && lon
        ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=15`
        : null;

    const buttons = `
        <div class="button-row">
            <button class="wiki-button" data-type="wiki" data-url="${race.url}">Wiki</button>
            <button class="wiki-button" data-type="circuit" data-url="${race.Circuit.url}">Circuit</button>
            ${mapURL ? `<button class="wiki-button" data-type="map" data-lat="${lat}" data-lon="${lon}">Map</button>` : ''}
        </div>
    `;

    container.innerHTML = `
        <h2>🏁 ${race.raceName}</h2>
        <div class="results-mode-nav">
            <button class="results-nav" data-dir="-1">←</button>
            <span class="results-mode-label">${resultsViewModeLabel(state.resultsViewMode)}</span>
            <button class="results-nav" data-dir="1">→</button>
        </div>
        <p><strong>Date:</strong> ${race.date}</p>
        <p><strong>Location:</strong> ${race.Circuit.circuitName} (${race.Circuit.Location.locality}, ${race.Circuit.Location.country})</p>
        ${buttons}
        <ul class="results-list" id="results-list"></ul>
    `;

    const list = document.getElementById('results-list');

    results?.forEach((result) => {
        const driver = result.Driver;
        const constructorName = result.Constructor?.name ?? 'Unknown Team';
        const position = result.position || '-';
        const points = result.points || '';
        const time = result.Time?.time || result.Q3 || result.Q2 || result.Q1 || '';

        const item = document.createElement('li');
        item.innerHTML = `
            <strong>#${position}</strong> ${driver.givenName} ${driver.familyName}
            (${constructorName}) – ${points} pts
            ${time ? `<br><small>${time}</small>` : ''}
        `;
        list.appendChild(item);
    });

    // Delegate result nav button clicks
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.results-nav');
        if (btn) {
            const dir = parseInt(btn.dataset.dir);
            cycleResultsMode(dir);
        }
    }, { once: true });
}
