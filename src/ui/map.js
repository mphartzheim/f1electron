let mapInstance;

function openMapPopup(lat, lon) {
    const modal = document.getElementById('map-modal');
    const mapDiv = document.getElementById('map');

    modal.classList.remove('hidden');

    setTimeout(() => {
        if (mapInstance) {
            mapInstance.remove();
        }

        mapInstance = L.map('map').setView([lat, lon], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);

        L.marker([lat, lon]).addTo(mapInstance);
    }, 100); // Let modal show before initializing map
}
