import fs from 'fs'

export interface IRecordHandler<T> {
  addRecord: (record: T) => void
}

export function loader<T>(filePath: string, recordHandler: IRecordHandler<T>): void {
  const data: T[] = JSON.parse(fs.readFileSync(filePath).toString())
  data.forEach(record => recordHandler.addRecord(record))
}
