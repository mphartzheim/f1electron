const sessionTimings = {
  'Practice 1': { preroll: 15, duration: 60 },
  'Practice 2': { preroll: 15, duration: 60 },
  'Practice 3': { preroll: 15, duration: 60 },
  'Qualifying': { preroll: 20, duration: 75 },
  'Sprint': { preroll: 15, duration: 30 },
  'Race': { preroll: 60, duration: 120 },
};

function formatSession(label, datetime, isNext = false) {
  const dt = new Date(datetime);
  const options = {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  };

  const live = isSessionLive(label, datetime, sessionTimings);

  return `
    <span class="session-label ${isNext ? 'next-session' : ''}">${label}</span>
    <span class="session-time ${isNext ? 'next-session' : ''}">
      ${dt.toLocaleString(undefined, options)}
      ${live ? `
        <a id="live-button"
          href="https://f1tv.formula1.com"
          target="_blank"
          style="
            display: inline-block;
            margin-left: 0.5em;
            padding: 0.2em 0.6em;
            background-color: #dc2626;
            color: white;
            border-radius: 0.375em;
            font-size: 0.85em;
            font-weight: bold;
            text-decoration: none;
            transition: background-color 0.2s ease;
          "
          onmouseover="this.style.backgroundColor='#b91c1c';"
          onmouseout="this.style.backgroundColor='#dc2626';">
          Live
        </a>
      ` : ''}
    </span>
  `;
}

function createSessionButtons(raceUrl, circuitUrl, mapURL, lat, lon) {
  return `
    <button class="wiki-button" data-type="wiki" data-url="${raceUrl}">Wiki</button>
    <button class="wiki-button" data-type="circuit" data-url="${circuitUrl}">Circuit</button>
    ${mapURL ? `<button class="wiki-button" data-type="map" data-lat="${lat}" data-lon="${lon}">Map</button>` : ''}
  `;
}

function scheduleRefreshEveryFiveMinutes() {
  const now = new Date();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();

  // How many minutes until the next 5-minute mark?
  const minutesToNext = 5 - (minutes % 5);
  const msUntilNextTick = (minutesToNext * 60 * 1000) - (seconds * 1000) - milliseconds;

  console.log(`Next refresh scheduled in ${Math.ceil(msUntilNextTick / 1000)} seconds`);

  setTimeout(() => {
    // Do your refresh action here (reload, re-fetch, etc.)
    location.reload(); // or call your update function

    // After the first accurate trigger, use a fixed 5-minute interval
    setInterval(() => {
      location.reload(); // or call update function
    }, 5 * 60 * 1000); // every 5 minutes
  }, msUntilNextTick);
}
