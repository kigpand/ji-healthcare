export interface IRecord {
  category: string;
  date: string;
  _id: string;
  id: number;
  routineId: number;
  title: string;
}

export interface IRecordItem {
  id: number;
  title: string;
  kg: number;
  set: number;
  sortOrder: number;
}

export interface IRecordDetail extends IRecord {
  items: IRecordItem[];
}
