export interface IRoutineData {
  kg: number;
  set: number;
  title: string;
}

export interface IRoutine {
  id: number;
  title: string;
  category: string;
  routine: IRoutineData[];
}
