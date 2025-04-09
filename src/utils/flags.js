function nationalityToFlag(nationality) {
    const map = {
        'British': '🇬🇧',
        'German': '🇩🇪',
        'Spanish': '🇪🇸',
        'French': '🇫🇷',
        'Italian': '🇮🇹',
        'Dutch': '🇳🇱',
        'Finnish': '🇫🇮',
        'Australian': '🇦🇺',
        'Canadian': '🇨🇦',
        'American': '🇺🇸',
        'Mexican': '🇲🇽',
        'Japanese': '🇯🇵',
        'Brazilian': '🇧🇷',
        'Monegasque': '🇲🇨',
        'Thai': '🇹🇭',
        'Chinese': '🇨🇳',
        'Danish': '🇩🇰',
        'Austrian': '🇦🇹',
        'Swiss': '🇨🇭',
        'Belgian': '🇧🇪',
        'New Zealander': '🇳🇿',
        // Add more as needed
    };

    if (!map[nationality]) {
        console.warn(`⚠️ Missing flag for nationality: ${nationality}`);
    }

    return map[nationality] || '';
}
