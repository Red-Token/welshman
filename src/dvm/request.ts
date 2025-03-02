import {Emitter, now} from "../lib/index.js"
import type {TrustedEvent, SignedEvent, Filter} from "../util/index.js"
import {subscribe, publish, SubscriptionEvent} from "../net/index.js"
import type {Subscription, Publish} from "../net/index.js"

export enum DVMEvent {
  Progress = "progress",
  Result = "result",
}

export type DVMRequestOptions = {
  event: SignedEvent
  relays: string[]
  timeout?: number
  autoClose?: boolean
  reportProgress?: boolean
}

export type DVMRequest = {
  request: DVMRequestOptions
  emitter: Emitter
  sub: Subscription
  pub: Publish
}

export const makeDvmRequest = (request: DVMRequestOptions) => {
  const emitter = new Emitter()
  const {event, relays, timeout = 30_000, autoClose = true, reportProgress = true} = request
  const kind = event.kind + 1000
  const kinds = reportProgress ? [kind, 7000] : [kind]
  const filters: Filter[] = [{kinds, since: now() - 60, "#e": [event.id]}]

  const sub = subscribe({relays, timeout, filters})
  const pub = publish({event, relays, timeout})

  sub.on(SubscriptionEvent.Event, (url: string, event: TrustedEvent) => {
    if (event.kind === 7000) {
      emitter.emit(DVMEvent.Progress, url, event)
    } else {
      emitter.emit(DVMEvent.Result, url, event)

      if (autoClose) {
        sub.close()
      }
    }
  })

  return {request, emitter, sub, pub} as DVMRequest
}
