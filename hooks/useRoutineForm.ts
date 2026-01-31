import { useReducer } from "react";

export type RoutineSetForm = {
  title: string;
  set: string;
  kg: string;
  link: string;
};

type RoutineFormState = {
  title: string;
  sets: RoutineSetForm[];
};

type RoutineFormAction =
  | { type: "SET_TITLE"; payload: string }
  | {
      type: "UPDATE_SET";
      index: number;
      key: keyof RoutineSetForm;
      value: string;
      numeric?: boolean;
    }
  | { type: "ADD_SET" }
  | { type: "REMOVE_SET"; index: number }
  | { type: "RESET" };

const createInitialState = (): RoutineFormState => ({
  title: "",
  sets: [{ title: "", set: "", kg: "", link: "" }],
});

function reducer(state: RoutineFormState, action: RoutineFormAction) {
  switch (action.type) {
    case "SET_TITLE":
      return { ...state, title: action.payload };
    case "UPDATE_SET": {
      const sanitized = action.numeric
        ? action.value.replace(/[^0-9]/g, "")
        : action.value;
      return {
        ...state,
        sets: state.sets.map((set, index) =>
          index === action.index ? { ...set, [action.key]: sanitized } : set,
        ),
      };
    }
    case "ADD_SET":
      return {
        ...state,
        sets: [...state.sets, { title: "", set: "", kg: "", link: "" }],
      };
    case "REMOVE_SET":
      return {
        ...state,
        sets: state.sets.filter((_, index) => index !== action.index),
      };
    case "RESET":
      return createInitialState();
    default:
      return state;
  }
}

export function useRoutineForm() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  return {
    state,
    dispatch,
  };
}
