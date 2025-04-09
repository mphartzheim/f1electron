function isSessionLive(label, sessionDateTime, sessionTimings) {
    const config = sessionTimings[label];
    if (!config) return false;

    const now = new Date();
    const start = new Date(sessionDateTime);
    const prerollStart = new Date(start.getTime() - config.preroll * 60 * 1000);
    const end = new Date(start.getTime() + config.duration * 60 * 1000);

    return now >= prerollStart && now <= end;
}
