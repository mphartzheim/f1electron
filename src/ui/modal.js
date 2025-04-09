function openWebModal(url) {
    const modal = document.getElementById('web-modal');
    const iframe = document.getElementById('web-frame');

    iframe.src = url;
    modal.classList.remove('hidden');
}

function closeWebModal() {
    const modal = document.getElementById('web-modal');
    const iframe = document.getElementById('web-frame');

    modal.classList.add('hidden');
    iframe.src = '';
}
