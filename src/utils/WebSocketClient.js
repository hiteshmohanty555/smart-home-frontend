// frontend/src/utils/WebSocketClient.js
export default class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.listeners = new Set();
    this.reconnectMs = 2000;
    this.shouldReconnect = true;
  }

  connect() {
    if (this.ws) return;
    try {
      this.ws = new WebSocket(this.url);
    } catch (e) {
      this._scheduleReconnect();
      return;
    }

    this.ws.addEventListener("open", () => {
      console.log("WebSocket connected:", this.url);
      this._emit({ type: "ws_open" });
    });

    this.ws.addEventListener("message", (ev) => {
      try {
        const data = JSON.parse(ev.data);
        this._emit(data);
      } catch (e) {
        this._emit({ type: "raw", data: ev.data });
      }
    });

    this.ws.addEventListener("close", () => {
      this.ws = null;
      this._emit({ type: "ws_close" });
      if (this.shouldReconnect) this._scheduleReconnect();
    });

    this.ws.addEventListener("error", (err) => {
      console.error("WebSocket error", err);
      // close will trigger reconnect
    });
  }

  _scheduleReconnect() {
    setTimeout(() => {
      if (this.shouldReconnect) this.connect();
    }, this.reconnectMs);
  }

  subscribe(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  _emit(msg) {
    for (const cb of this.listeners) {
      try { cb(msg); } catch (e) { console.error("WS listener error", e); }
    }
  }

  send(obj) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
      return true;
    }
    console.warn("WS not open - message skipped");
    return false;
  }

  close() {
    this.shouldReconnect = false;
    if (this.ws) this.ws.close();
    this.ws = null;
  }
}
