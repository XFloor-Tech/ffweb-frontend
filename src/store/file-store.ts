import type { TaskStatus } from "@/types/file-types";
import { create } from "zustand";

export type FileStore = {
  selectedFile: File | null;
  isPreparing: boolean;
  taskId: string | null;
  taskStatus: TaskStatus | null;
  taskProgress: number;
  isTaskCompleted: boolean;
  sseAttempt: number;

  setSelectedFile: (file: File | null) => void;
  setIsPreparing: (isPreparing: boolean) => void;
  setTaskId: (taskId: string | null) => void;
  setTaskStatus: (taskStatus: TaskStatus | null) => void;
  setTaskProgress: (taskProgress: number) => void;
  setIsTaskCompleted: (isTaskCompleted: boolean) => void;
  setSseAttempt: (sseAttempt: number) => void;
  incrementSseAttempt: () => void;
  resetToDefaults: () => void;
};

const DEFAULT_FILE_STORE_STATE = {
  selectedFile: null,
  isPreparing: false,
  taskId: null,
  taskStatus: null,
  taskProgress: 0,
  isTaskCompleted: false,
  sseAttempt: 0,
} satisfies Pick<
  FileStore,
  | "selectedFile"
  | "isPreparing"
  | "taskId"
  | "taskStatus"
  | "taskProgress"
  | "isTaskCompleted"
  | "sseAttempt"
>;

export const useFileStore = create<FileStore>()((set) => ({
  ...DEFAULT_FILE_STORE_STATE,

  setSelectedFile: (selectedFile) => set({ selectedFile }),
  setIsPreparing: (isPreparing) => set({ isPreparing }),
  setTaskId: (taskId) => set({ taskId }),
  setTaskStatus: (taskStatus) => set({ taskStatus }),
  setTaskProgress: (taskProgress) => set({ taskProgress }),
  setIsTaskCompleted: (isTaskCompleted) => set({ isTaskCompleted }),
  setSseAttempt: (sseAttempt) => set({ sseAttempt }),

  incrementSseAttempt: () =>
    set((state) => ({ sseAttempt: state.sseAttempt + 1 })),
  resetToDefaults: () => set(DEFAULT_FILE_STORE_STATE),
}));
