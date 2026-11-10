/**
 * Metro stub for the Node "ws" package on React Native.
 * Supabase Realtime uses global WebSocket when available.
 */
const WebSocketImpl = globalThis.WebSocket;

module.exports = WebSocketImpl;
module.exports.default = WebSocketImpl;
module.exports.WebSocket = WebSocketImpl;
