/* eslint-disable  */
import { IRecordHandler, loader } from './loader'

type Listener<EventType> = (ev: EventType) => void
// Observer
function createObserver<EventType>(): {
  subscribe: (listener: Listener<EventType>) => () => void
  publish: (event: EventType) => void
} {
  let listeners: Listener<EventType>[] = []

  return {
    subscribe: (listener: Listener<EventType>): (() => void) => {
      listeners.push(listener)
      // expose unsubscribe function
      return () => {
        listeners = listeners.filter(l => l !== listener)
      }
    },
    publish: (event: EventType) => {
      listeners.forEach(listener => listener(event))
    },
  }
}

interface IBeforeSetEvent<T> {
  value: T
  newValue: T
}
interface IAfterSetEvent<T> {
  value: T
}

interface IPokemon {
  id: string
  defense: number
  attack: number
}
interface IBaseRecord {
  readonly id: string
}
interface IDatabase<T extends IBaseRecord> {
  get(id: string): T | undefined
  set(newValue: T): void
  onBeforeAdd(listener: Listener<IBeforeSetEvent<T>>): () => void
  onAfterAdd(listener: Listener<IAfterSetEvent<T>>): () => void
  visit(visitor: (item: T, idx: number) => void): void
}

// factory
function createDB<T extends IBaseRecord>() {
  class InMemoryDB implements IDatabase<T> {
    private db: Record<string, T> = {}

    static instance: InMemoryDB = new InMemoryDB()

    private beforeAddListeners = createObserver<IBeforeSetEvent<T>>()

    private afterAddListeners = createObserver<IAfterSetEvent<T>>()

    private constructor() {}

    public get(id: string): T | undefined {
      return this.db[id]
    }

    public set(newValue: T): void {
      this.beforeAddListeners.publish({
        newValue,
        value: this.db[newValue.id],
      })

      this.db[newValue.id] = newValue

      this.afterAddListeners.publish({
        value: newValue,
      })
    }

    onBeforeAdd(listener: Listener<IBeforeSetEvent<T>>): () => void {
      return this.beforeAddListeners.subscribe(listener)
    }

    onAfterAdd(listener: Listener<IAfterSetEvent<T>>): () => void {
      return this.afterAddListeners.subscribe(listener)
    }

    // visitor
    visit(visitor: (item: T, idx: number) => void): void {
      Object.values(this.db).forEach(visitor)
    }
  }
  return InMemoryDB
}

const PokemonDB = createDB<IPokemon>()

const unsubscribe = PokemonDB.instance.onAfterAdd(({ value }) => {
  console.log('onAfterAdd---', value)
})

// adapter
/*  */
class PokemonDBAdapter implements IRecordHandler<IPokemon> {
  public addRecord(record: IPokemon) {
    PokemonDB.instance.set(record)
  }
}

loader(`${__dirname}/data.json`, new PokemonDBAdapter())
/*  */

unsubscribe()

PokemonDB.instance.visit((item, idx) => {
  console.log('item--', item)
  console.log('idx--', idx)
})
