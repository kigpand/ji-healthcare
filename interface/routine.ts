export interface IRoutineData {
  id?: number;
  kg: number;
  set: number;
  sortOrder?: number;
  title: string;
  link?: string;
}

export interface IRoutineInfo {
  id: number;
  title: string;
  category: string;
  categoryId: number | null;
  createdAt: string;
  routine: IRoutineData[];
}

export interface IRoutine {
  routines: IRoutineInfo[];
}

export interface IRoutineRequest {
  title: string;
  categoryId: number;
  routine: IRoutineData[];
}
