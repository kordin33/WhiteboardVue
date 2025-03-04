
// Funkcja testująca połączenie WebSocket
function testWebSocket(boardId) {
    console.log('Testowanie połączenia WebSocket dla tablicy:', boardId);
    
    // Tworzymy WebSocket
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/boards/${boardId}/`;
    console.log('Próba połączenia z:', wsUrl);
    
    const testSocket = new WebSocket(wsUrl);
    
    testSocket.onopen = function(e) {
        console.log('TEST: WebSocket połączony pomyślnie!');
        document.getElementById('ws-status').textContent = 'Połączony';
        document.getElementById('ws-status').style.color = 'green';
    };
    
    testSocket.onclose = function(e) {
        console.log('TEST: WebSocket rozłączony, kod:', e.code, 'powód:', e.reason);
        document.getElementById('ws-status').textContent = 'Rozłączony (kod: ' + e.code + ')';
        document.getElementById('ws-status').style.color = 'red';
    };
    
    testSocket.onerror = function(e) {
        console.error('TEST: Błąd WebSocket:', e);
        document.getElementById('ws-status').textContent = 'Błąd połączenia';
        document.getElementById('ws-status').style.color = 'red';
    };
    
    // Dodajemy przycisk do zamknięcia testu
    setTimeout(() => {
        if (testSocket.readyState === WebSocket.OPEN) {
            testSocket.close();
            console.log('TEST: Zamknięto testowe połączenie WebSocket.');
        }
    }, 10000); // Zamknij po 10 sekundach
}
