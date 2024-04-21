import type {Event} from 'nostr-tools'
import {matchFilter as nostrToolsMatchFilter} from 'nostr-tools'
import {prop, avg, hash, groupBy, randomId, uniq} from '@coracle.social/lib'
import type {Rumor} from './Events'
import {decodeAddress, addressFromEvent, encodeAddress} from './Address'
import {isReplaceableKind} from './Kinds'

export const EPOCH = 1609459200

export type Filter = {
  ids?: string[]
  kinds?: number[]
  authors?: string[]
  since?: number
  until?: number
  limit?: number
  search?: string
  [key: `#${string}`]: string[]
}

export const matchFilter = <E extends Rumor>(filter: Filter, event: E) => {
  if (!nostrToolsMatchFilter(filter, event as unknown as Event)) {
    return false
  }

  if (filter.search) {
    const content = event.content.toLowerCase()
    const terms = filter.search.toLowerCase().split(/\s+/g)

    for (const term of terms) {
      if (content.includes(term)) {
        return true
      }

      return false
    }
  }

  return true
}

export const matchFilters = <E extends Rumor>(filters: Filter[], event: E) => {
  for (const filter of filters) {
    if (matchFilter(filter, event)) {
      return true
    }
  }

  return false
}

export const getFilterId = (filter: Filter) => {
  const keys = Object.keys(filter)

  keys.sort()

  const parts = []
  for (const k of keys) {
    const v = filter[k as keyof Filter]
    const s = Array.isArray(v) ? v.join(',') : v

    parts.push([k, s].join(':'))
  }

  return hash(parts.join('|'))
}

export const calculateFilterGroup = ({since, until, limit, search, ...filter}: Filter) => {
  const group = Object.keys(filter)

  if (since) group.push(`since:${since}`)
  if (until) group.push(`until:${until}`)
  if (limit) group.push(`limit:${randomId()}`)
  if (search) group.push(`search:${search}`)

  return group.sort().join("-")
}

export const mergeFilters = (filters: Filter[]) => {
  const result = []

  for (const group of Object.values(groupBy(calculateFilterGroup, filters))) {
    const newFilter: Record<string, any> = {}

    for (const k of Object.keys(group[0])) {
      if (["since", "until", "limit", "search"].includes(k)) {
        newFilter[k] = (group[0] as Record<string, any>)[k]
      } else {
        newFilter[k] = uniq(group.flatMap(prop(k)))
      }
    }

    result.push(newFilter as Filter)
  }

  return result
}

export const getIdFilters = (idsOrAddresses: Iterable<string>) => {
  const ids = []
  const aFilters = []

  for (const idOrAddress of idsOrAddresses) {
    if (idOrAddress.includes(":")) {
      const {kind, pubkey, identifier} = decodeAddress(idOrAddress)

      if (identifier) {
        aFilters.push({kinds: [kind], authors: [pubkey], "#d": [identifier]})
      } else {
        aFilters.push({kinds: [kind], authors: [pubkey]})
      }
    } else {
      ids.push(idOrAddress)
    }
  }

  const filters = mergeFilters(aFilters)

  if (ids.length > 0) {
    filters.push({ids})
  }

  return filters
}

export const getReplyFilters = (events: Rumor[], filter: Filter) => {
  const a = []
  const e = []

  for (const event of events) {
    e.push(event.id)

    if (isReplaceableKind(event.kind)) {
      a.push(encodeAddress(addressFromEvent(event)))
    }

    if (event.wrap) {
      e.push(event.wrap.id)
    }
  }

  const filters = []

  if (a.length > 0) {
    filters.push({...filter, "#a": a})
  }

  if (e.length > 0) {
    filters.push({...filter, "#e": e})
  }

  return filters
}

export const getFilterGenerality = (filter: Filter) => {
  if (filter.ids || filter["#e"] || filter["#a"]) {
    return 0
  }

  const hasTags = Object.keys(filter).find((k: string) => k.startsWith("#"))

  if (filter.authors && hasTags) {
    return 0.2
  }

  if (filter.authors) {
    return Math.min(1, filter.authors.length / 100)
  }

  return 1
}

export const guessFilterDelta = (filters: Filter[], max = 60 * 60 * 24 * 7) =>
  Math.round(max * Math.max(0.005, 1 - avg(filters.map(getFilterGenerality))))
