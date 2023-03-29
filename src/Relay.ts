import {EventBus} from "./util/EventBus"

export class Relay {
  constructor(socket) {
    this.socket = socket
    this.bus = new EventBus()
    this.listeners = sockets.map(socket => {
      return socket.bus.addListener('message', (url, [verb, ...payload]) => {
        this.bus.emit(verb, url, ...payload)
      })
    })
  }
  async send(...payload) {
    await this.socket.connect()

    this.socket.send(payload)
  }
  cleanup() {
    this.bus.clear()
    this.listeners.map(unsubscribe => unsubscribe())
  }
}