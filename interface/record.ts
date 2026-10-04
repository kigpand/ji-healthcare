import type { IRoutineData, IRoutineInfo } from "@/interface/routine";

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
  sets: IRecordSet[];
}

export interface IRecordSet {
  id: number;
  setNumber: number;
  kg: number;
}

export interface ICompletedRoutineItem extends IRoutineData {
  setKgs: number[];
}

export type ICompletedRoutine = Omit<IRoutineInfo, "routine"> & {
  routine: ICompletedRoutineItem[];
};

export interface IRecordDetail extends IRecord {
  items: IRecordItem[];
}
