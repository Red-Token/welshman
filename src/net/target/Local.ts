import {Emitter} from "../../lib/index.js"
import {Relay, LOCAL_RELAY_URL} from "../../util/index.js"
import type {Message} from "../Socket.js"

export class Local extends Emitter {
  constructor(readonly relay: Relay) {
    super()

    relay.on("*", this.onMessage)
  }

  get connections() {
    return []
  }

  async send(...payload: Message) {
    await this.relay.send(...payload)
  }

  onMessage = (...message: Message) => {
    const [verb, ...payload] = message

    this.emit(verb, LOCAL_RELAY_URL, ...payload)
  }

  cleanup = () => {
    this.removeAllListeners()
    this.relay.off("*", this.onMessage)
  }
}
