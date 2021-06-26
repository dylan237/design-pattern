/* eslint-disable  */
/* singleton design pattern */

/* 1. */
;(() => {
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
    set(newData: T): void
  }

  // factory
  function createDB<T extends IBaseRecord>() {
    class InMemoryDB implements IDatabase<T> {
      private db: Record<string, T> = {}

      public get(id: string): T | undefined {
        return this.db[id]
      }

      public set(newData: T): void {
        this.db[newData.id] = newData
      }
    }
    // singleton
    const db = new InMemoryDB()
    return db
  }

  const pokemonDB = createDB<IPokemon>()
  pokemonDB.set({
    id: 'Pikachu',
    attack: 100,
    defense: 100,
  })

  console.log('pokemonDB---', pokemonDB)
  console.log('get---', pokemonDB.get('Pikachu'))
})()

/* 2. */
;(() => {
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
    set(newData: T): void
  }

  // factory
  function createDB<T extends IBaseRecord>() {
    class InMemoryDB implements IDatabase<T> {
      private db: Record<string, T> = {}
      
      static instance: InMemoryDB = new InMemoryDB()

      private constructor(){}

      public get(id: string): T | undefined {
        return this.db[id]
      }

      public set(newData: T): void {
        this.db[newData.id] = newData
      }
    }
    return InMemoryDB
  }

  const PokemonDB = createDB<IPokemon>()
  PokemonDB.instance.set({
    id: 'Pikachu',
    attack: 100,
    defense: 100,
  })

  console.log('PokemonDB---', PokemonDB.instance)
  console.log('get---', PokemonDB.instance.get('Pikachu'))
})()
