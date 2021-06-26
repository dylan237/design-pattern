;(() => {
  /* */
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
  /* */

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
    onBeforeAdd(listener: Listener<IBeforeSetEvent<T>>): () => void /* */
    onAfterAdd(listener: Listener<IAfterSetEvent<T>>): () => void /* */
  }

  // factory
  function createDB<T extends IBaseRecord>() {
    class InMemoryDB implements IDatabase<T> {
      private db: Record<string, T> = {}

      static instance: InMemoryDB = new InMemoryDB()

      private beforeAddListeners = createObserver<IBeforeSetEvent<T>>() /* */

      private afterAddListeners = createObserver<IAfterSetEvent<T>>() /* */

      private constructor() {}

      public get(id: string): T | undefined {
        return this.db[id]
      }

      public set(newValue: T): void {
        /* */
        this.beforeAddListeners.publish({
          newValue,
          value: this.db[newValue.id],
        })

        this.db[newValue.id] = newValue

        /* */
        this.afterAddListeners.publish({
          value: newValue,
        })
      }

      /* */
      onBeforeAdd(listener: Listener<IBeforeSetEvent<T>>): () => void {
        return this.beforeAddListeners.subscribe(listener)
      }

      onAfterAdd(listener: Listener<IAfterSetEvent<T>>): () => void {
        return this.afterAddListeners.subscribe(listener)
      }
      /* */
    }
    return InMemoryDB
  }

  const PokemonDB = createDB<IPokemon>()
  PokemonDB.instance.onBeforeAdd(({ value, newValue }) => {
    console.log('onBeforeAdd value---', value)
    console.log('onBeforeAdd newValue---', newValue)
  })
  const unsubscribe = PokemonDB.instance.onAfterAdd(({ value }) => {
    console.log('onAfterAdd---', value)
  })

  PokemonDB.instance.set({
    id: 'Pikachu',
    attack: 100,
    defense: 100,
  })
  PokemonDB.instance.set({
    id: 'Ditto',
    attack: 10,
    defense: 10,
  })

  unsubscribe()
})()
