let socket = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

export function connectWebSocket() {
    if (socket && socket.connected) {
        return socket;
    }

    socket = io('http://localhost:3000/orders', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log('WebSocket connected');
        reconnectAttempts = 0;
        
        // Подписываемся на все обновления заказов
        socket.emit('subscribeToAllOrders');
    });

    socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
    });

    socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        reconnectAttempts++;
        
        if (reconnectAttempts >= maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
        }
    });

    return socket;
}

export function disconnectWebSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export function subscribeToOrder(orderId, callback) {
    if (!socket || !socket.connected) {
        connectWebSocket();
    }

    socket.emit('subscribeToOrder', { orderId });
    socket.on('orderStatusUpdate', (data) => {
        if (data.orderId === orderId) {
            callback(data);
        }
    });
}

export function subscribeToAllOrders(callback) {
    if (!socket || !socket.connected) {
        connectWebSocket();
    }

    socket.emit('subscribeToAllOrders');
    socket.on('orderStatusUpdate', callback);
}

export function getSocket() {
    return socket;
}

