import {ctx, isNil} from "../lib/index.js"
import {LOCAL_RELAY_URL, getFilterResultCardinality} from "../util/index.js"
import type {TrustedEvent, Filter} from "../util/index.js"
import {subscribe as baseSubscribe, SubscriptionEvent} from "../net/index.js"
import type {SubscribeRequestWithHandlers} from "../net/index.js"
import {repository} from "./core.js"

export type PartialSubscribeRequest = Partial<SubscribeRequestWithHandlers> & {filters: Filter[]}

export const subscribe = (request: PartialSubscribeRequest) => {
  const events: TrustedEvent[] = []

  // If we already have all results for any filter, don't send the filter to the network
  if (request.closeOnEose) {
    for (const filter of request.filters.splice(0)) {
      const cardinality = getFilterResultCardinality(filter)

      if (!isNil(cardinality)) {
        const results = repository.query([filter])

        if (results.length === cardinality) {
          for (const event of results) {
            events.push(event)
          }

          break
        }
      }

      request.filters.push(filter)
    }
  }

  // Make sure to query our local relay too
  const delay = ctx.app.requestDelay
  const authTimeout = ctx.app.authTimeout
  const timeout = request.closeOnEose ? ctx.app.requestTimeout : 0
  const sub = baseSubscribe({delay, timeout, authTimeout, relays: [], ...request})

  // Keep cached results async so the caller can set up handlers
  setTimeout(() => {
    for (const event of events) {
      sub.emit(SubscriptionEvent.Event, LOCAL_RELAY_URL, event)
    }
  })

  return sub
}

export const load = (request: PartialSubscribeRequest) =>
  new Promise<TrustedEvent[]>(resolve => {
    const sub = subscribe({closeOnEose: true, timeout: ctx.app.requestTimeout, ...request})
    const events: TrustedEvent[] = []

    sub.on(SubscriptionEvent.Event, (url: string, e: TrustedEvent) => events.push(e))
    sub.on(SubscriptionEvent.Complete, () => resolve(events))
  })
