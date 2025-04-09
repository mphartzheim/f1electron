function renderStandingsGrid(standings, type) {
    const isDriver = type.toLowerCase() === 'driver';

    return `
        <div class="standings-column">
            <h3>${isDriver ? 'Driver' : 'Constructor'} Standings</h3>
            <ul class="${type.toLowerCase()}-standings">
                ${standings.map(entry => {
        let name, flag = '', team = '';

        if (isDriver) {
            const driver = entry.Driver || {};
            name = `${driver.givenName || 'Unknown'} ${driver.familyName || ''}`;
            flag = nationalityToFlag(driver.nationality || '');
            team = entry.Constructors?.[0]?.name || '';
        } else {
            const constructor = entry.Constructor || {};
            name = constructor.name || 'Unknown';
            flag = nationalityToFlag(constructor.nationality || '');
        }

        const points = entry.points || '0';

        return `
                        <li>
                            <strong>#${entry.position}</strong> ${name} ${flag}${team ? ` <span class="team">(${team})</span>` : ''}
                            <span class="points">- ${points} pts</span>
                        </li>
                    `;
    }).join('')}
            </ul>
        </div>
    `;
}
