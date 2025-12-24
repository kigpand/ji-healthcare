export interface IRoutineData {
  kg: number;
  set: number;
  title: string;
}

export interface IRoutineInfo {
  id: number;
  title: string;
  category: string;
  date: string;
  routine: IRoutineData[];
}

export interface IRoutine {
  routines: IRoutineInfo[];
}
