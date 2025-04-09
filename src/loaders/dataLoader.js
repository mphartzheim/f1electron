async function loadUpcomingRace() {
    const container = document.getElementById('upcoming');
    container.innerHTML = '<div class="spinner">Loading…</div>';

    try {
        const response = await fetch('https://api.jolpi.ca//ergast/f1/current/next.json');
        const data = await response.json();

        const races = data?.MRData?.RaceTable?.Races;
        if (!Array.isArray(races) || races.length === 0) {
            container.innerHTML = `
                <p>No upcoming race found.</p>
                <p>🏁 The season may not have started or all sessions are complete. Check <strong>Schedule</strong> or <strong>Results</strong>.</p>
            `;
            return;
        }

        const race = races[0];
        const { raceName, Circuit } = race;
        const location = `${Circuit?.Location?.locality}, ${Circuit?.Location?.country}`;
        const lat = Circuit?.Location?.lat;
        const lon = Circuit?.Location?.long;

        const mapURL = lat && lon
            ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=15`
            : null;

        const sessionLabels = {
            FirstPractice: 'Practice 1',
            SecondPractice: 'Practice 2',
            ThirdPractice: 'Practice 3',
            Sprint: 'Sprint',
            Qualifying: 'Qualifying',
            Race: 'Race',
        };

        const sessionOrder = [
            'FirstPractice',
            'SecondPractice',
            'ThirdPractice',
            'Sprint',
            'Qualifying',
            'Race',
        ];

        let sessionGrid = '<div class="session-grid">';
        let nextSessionFound = false;

        sessionOrder.forEach((key) => {
            let sessionTime = null;
            if (key === 'Race') {
                sessionTime = `${race.date}T${race.time}`;
            } else if (race[key]) {
                sessionTime = `${race[key].date}T${race[key].time}`;
            }

            if (sessionTime) {
                const isNext = !nextSessionFound && new Date(sessionTime) > new Date();
                if (isNext) nextSessionFound = true;

                sessionGrid += formatSession(sessionLabels[key], sessionTime, isNext);
            }
        });

        sessionGrid += '</div>';

        const buttons = createSessionButtons(race.url, Circuit.url, mapURL, lat, lon);

        container.innerHTML = `
            <h2>${raceName}</h2>
            <p><strong>Location:</strong> ${Circuit?.circuitName} (${location})</p>
            <div class="button-row">${buttons}</div>
            <h3 style="margin-top: 1.5rem;">Weekend Schedule</h3>
            ${sessionGrid}
        `;
    } catch (err) {
        console.error('❌ Error loading upcoming race:', err);
        container.innerHTML = '⚠️ Failed to load upcoming race.';
    }
}

async function loadRaceSchedule() {
    const container = document.getElementById('schedule');
    state.nextRaceFound = false;

    // Get previously selected season if available
    const existingSelect = document.getElementById('season-select');
    const selectedSeason = existingSelect?.value || new Date().getFullYear();

    // Rebuild the container contents
    container.innerHTML = `
        <h2>🗓️ ${selectedSeason} Race Schedule</h2>
        <div class="season-selector">
            <label for="season-select">Season:</label>
            <select id="season-select"></select>
        </div>
        <ul class="race-list"></ul>
    `;

    const select = container.querySelector('#season-select');
    for (let year = new Date().getFullYear(); year >= 1950; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
    }
    select.value = selectedSeason;

    // 🔁 Rebind onchange handler every time
    select.onchange = loadRaceSchedule;

    try {
        const response = await fetch(`https://api.jolpi.ca/ergast/f1/${selectedSeason}.json`);
        const data = await response.json();
        const races = data?.MRData?.RaceTable?.Races;

        if (!races || races.length === 0) {
            container.innerHTML += '<p>No races found.</p>';
            return;
        }

        const list = container.querySelector('.race-list');
        const now = new Date();

        races.forEach((race) => {
            const raceDateTime = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
            const isPast = raceDateTime < now;
            const isNextRace = raceDateTime > now && !state.nextRaceFound && selectedSeason == new Date().getFullYear();

            const lat = race.Circuit?.Location?.lat;
            const lon = race.Circuit?.Location?.long;

            let buttonHTML = `
                <button class="wiki-button" data-type="wiki" data-url="${race.url}">Wiki</button>
                <button class="wiki-button" data-type="circuit" data-url="${race.Circuit?.url}">Circuit</button>
            `;

            if (lat && lon) {
                buttonHTML += `
                    <button class="wiki-button" data-type="map" data-lat="${lat}" data-lon="${lon}">Map</button>
                `;
            }

            if (isPast) {
                buttonHTML += `
                    <button class="wiki-button" data-type="results" data-season="${selectedSeason}" data-round="${race.round}">Results</button>
                `;
            }


            const item = document.createElement('li');
            item.innerHTML = `
                <strong>Round ${race.round}:</strong> ${race.raceName} ${isPast ? '🏁' : ''}<br>
                ${race.date} – ${race.Circuit?.circuitName} (${race.Circuit?.Location?.locality}, ${race.Circuit?.Location?.country})<br>
                ${buttonHTML}
            `;

            if (isPast) item.classList.add('completed');
            if (isNextRace) {
                item.classList.add('next-race');
                state.nextRaceFound = true;
            }

            item.style.cursor = 'pointer';
            list.appendChild(item);
        });
    } catch (err) {
        console.error(err);
        container.innerHTML += '<p>⚠️ Failed to load schedule.</p>';
    }
}

async function loadStandings(type = 'Driver') {
    const container = document.getElementById('standings-content');
    container.innerHTML = '<div class="spinner">Loading standings…</div>';

    state.selectedStandings = type;

    const year = state.selectedSeason || new Date().getFullYear();
    const url = `https://api.jolpi.ca/ergast/f1/${year}/${type.toLowerCase()}standings.json`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log('Standings API data:', data);

        const standingsList = data?.MRData?.StandingsTable?.StandingsLists?.[0];
        if (!standingsList) {
            container.innerHTML = `No ${type} standings available for ${year}.`;
            return;
        }

        const standings = type === 'Driver'
            ? standingsList.DriverStandings
            : standingsList.ConstructorStandings;

        if (!Array.isArray(standings)) {
            container.innerHTML = `No ${type} standings data found.`;
            return;
        }

        container.innerHTML = `
            <nav class="sub-tabs">
                <button class="sub-tab ${type === 'Driver' ? 'active' : ''}" onclick="loadStandings('Driver')">Driver</button>
                <button class="sub-tab ${type === 'Constructor' ? 'active' : ''}" onclick="loadStandings('Constructor')">Constructor</button>
            </nav>
            <div class="standings-grid">${renderStandingsGrid(standings, type)}</div>
        `;

    } catch (err) {
        console.error('❌ Error loading standings:', err);
        container.innerHTML = '⚠️ Failed to load standings.';
    }
}

async function fetchSeasonData(season) {
    const results = document.getElementById('history-results');
    results.innerHTML = 'Loading...';

    try {
        const res = await fetch(`https://api.jolpi.ca/ergast/f1/${season}.json`);
        const data = await res.json();
        const races = data?.MRData?.RaceTable?.Races;

        if (!races || races.length === 0) {
            results.innerHTML = 'No races found.';
            return;
        }

        results.innerHTML = `<h3>${season} Season</h3><ul class="history-list"></ul>`;
        const list = results.querySelector('.history-list');

        races.forEach((race) => {
            const item = document.createElement('li');
            item.innerHTML = `
        <strong>Round ${race.round}:</strong> ${race.raceName}<br>
        ${race.date} – ${race.Circuit.circuitName} (${race.Circuit.Location.locality}, ${race.Circuit.Location.country})
      `;
            list.appendChild(item);
        });
    } catch (err) {
        console.error(err);
        results.innerHTML = '⚠️ Failed to load season data.';
    }
}