function buildResultsHeader(race, mapURL, hasSprint = false) {
    const lat = race.Circuit?.Location?.lat;
    const lon = race.Circuit?.Location?.long;

    const buttons = `
        <div class="button-row">
            <button class="wiki-button" onclick="openWebModal('${race.url}')">Wiki</button>
            <button class="wiki-button" onclick="openWebModal('${race.Circuit.url}')">Circuit</button>
            ${mapURL ? `<button class="wiki-button" onclick="openMapPopup(${lat}, ${lon})">Map</button>` : ''}
        </div>
    `;

    const sprintButton = hasSprint
        ? `<button class="sub-tab ${state.selectedSession === 'sprint' ? 'active' : ''}" onclick="loadRaceResults(${race.round}, ${race.season}, 'sprint')">Sprint</button>`
        : '';

    const resultsNav = `
        <nav class="sub-tabs">
            <button class="sub-tab ${state.selectedSession === 'race' ? 'active' : ''}" onclick="loadRaceResults(${race.round}, ${race.season}, 'race')">Race</button>
            <button class="sub-tab ${state.selectedSession === 'qualifying' ? 'active' : ''}" onclick="loadRaceResults(${race.round}, ${race.season}, 'qualifying')">Qualifying</button>
            ${sprintButton}
        </nav>
    `;

    return `
        <h2>🏁 ${race.raceName}</h2>
        ${buttons}
        <p><strong>Date:</strong> ${race.date}</p>
        <p><strong>Location:</strong> ${race.Circuit.circuitName} (${race.Circuit.Location.locality}, ${race.Circuit.Location.country})</p>
        ${resultsNav}
    `;
}

async function loadRaceResults(round = null, season = null, session = 'race') {
    const container = document.getElementById('results-content');
    container.innerHTML = '<div class="spinner">Loading results…</div>';

    state.selectedSession = session;

    const year = season || state.selectedSeason || new Date().getFullYear();
    const raceRound = round || state.selectedRound;

    let url;
    if (!raceRound) {
        // Use fallback if no round is defined
        if (session === 'qualifying') {
            url = `https://api.jolpi.ca/ergast/f1/current/last/qualifying.json`;
        } else if (session === 'sprint') {
            url = `https://api.jolpi.ca/ergast/f1/current/last/sprint.json`;
        } else {
            url = `https://api.jolpi.ca/ergast/f1/current/last/results.json`;
        }
    } else {
        // Normal season/round loading
        if (session === 'qualifying') {
            url = `https://api.jolpi.ca/ergast/f1/${year}/${raceRound}/qualifying.json`;
        } else if (session === 'sprint') {
            url = `https://api.jolpi.ca/ergast/f1/${year}/${raceRound}/sprint.json`;
        } else {
            url = `https://api.jolpi.ca/ergast/f1/${year}/${raceRound}/results.json`;
        }
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        const race = data?.MRData?.RaceTable?.Races?.[0];
        let results;
        if (session === 'qualifying') {
            results = race?.QualifyingResults;
        } else if (session === 'sprint') {
            results = race?.SprintResults;
        } else {
            results = race?.Results;
        }

        if (!results || results.length === 0) {
            container.innerHTML = 'No results available.';
            return;
        }

        const lat = race.Circuit?.Location?.lat;
        const lon = race.Circuit?.Location?.long;
        const mapURL = lat && lon
            ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=15`
            : null;

        let hasSprint = false;
        if (raceRound) {
            hasSprint = await checkSprintAvailable(year, raceRound);
        }
        container.innerHTML = buildResultsHeader(race, mapURL, hasSprint) + '<ul class="results-list" id="results-list"></ul>';
        renderResultsList(results, session);

    } catch (err) {
        console.error('❌ Error loading race results:', err);
        container.innerHTML = '⚠️ Failed to load race results.';
    }
}

function renderResultsList(results, session = 'race') {
    const list = document.getElementById('results-list');
    list.innerHTML = '';

    const isSprint = session === 'sprint';
    const fastest = results.find(r => r.FastestLap?.rank === "1");
    const fastestDriverId = fastest?.Driver?.driverId;

    results.forEach((result) => {
        const driver = result.Driver;
        const constructor = result.Constructor;

        let description = '';
        let bonus = '';

        const position = parseInt(result.position);
        const points = result.points || '';
        const topBonusCutoff = isSprint ? 8 : 10;

        if (
            session !== 'qualifying' &&
            driver.driverId === fastestDriverId &&
            position <= topBonusCutoff
        ) {
            bonus = ' +1 🟣';
        }

        const pointsDisplay = session === 'qualifying' ? '' : `${points} pts${bonus}`;

        if (session === 'qualifying') {
            const q3 = result.Q3 || '—';
            const q2 = result.Q2 || '—';
            const q1 = result.Q1 || '—';
            description = `Q1: ${q1}, Q2: ${q2}, Q3: ${q3}`;
        } else {
            const finishTime = result.Time?.time || 'N/A';
            const grid = result.grid || 'N/A';
            const laps = result.laps || 'N/A';
            const status = result.status || 'N/A';
            const fastestLap = result.FastestLap;
            const fastTime = fastestLap?.Time?.time || '—';

            description = `Grid: ${grid} | Laps: ${laps} | Time: ${finishTime} | Fastest Lap: ${fastTime} | Status: ${status}`;
        }

        const item = document.createElement('li');
        item.innerHTML = `
            <strong>#${position}</strong> ${driver.givenName} ${driver.familyName}
            (${constructor.name})${pointsDisplay ? ` – ${pointsDisplay}` : ''}
            <small>${description}</small>
        `;

        if (session === 'qualifying') {
            if (position === 1) item.classList.add('pole-position');
        } else {
            if (position === 1) item.classList.add('podium-1');
            else if (position === 2) item.classList.add('podium-2');
            else if (position === 3) item.classList.add('podium-3');
        }

        if (session !== 'qualifying' && driver.driverId === fastestDriverId) {
            item.classList.add('fastest-lap');
        }

        list.appendChild(item);
    });
}

async function checkSprintAvailable(year, round) {
    try {
        const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/${round}/sprint.json`);
        const data = await res.json();
        const sprintRace = data?.MRData?.RaceTable?.Races?.[0];
        return !!sprintRace?.SprintResults?.length;
    } catch {
        return false;
    }
}
