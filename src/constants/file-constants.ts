import type {
  TaskStatus as TaskStatusType,
  TrackStatus as TrackStatusType,
} from "@/types/file-types";

const TaskStatus = {
  Cancelled: "cancelled",
  Completed: "completed",
  Error: "error",
  Failed: "failed",
  Pending: "pending",
  Processing: "processing",
} as const satisfies Record<string, TaskStatusType>;

const TrackStatus = {
  Converting: "converting",
  Done: "done",
  Error: "error",
} as const satisfies Record<string, TrackStatusType>;

const PROGRESS_LABEL_BY_TASK_STATUS: Partial<Record<TaskStatusType, string>> = {
  [TaskStatus.Completed]: "Completed",
  [TaskStatus.Cancelled]: "Cancelled",
  [TaskStatus.Failed]: "Failed",
};

const DEFAULT_PROGRESS_LABEL = "Converting";

const BUTTON_LABELS = {
  convert: "Convert",
  convertMore: "Convert more",
  download: "Download",
  downloading: "Downloading...",
  retry: "Retry",
  retrying: "Retrying...",
} as const;

const TOAST_MESSAGES = {
  noTaskSelected: "No task selected. Start a conversion first.",
} as const;

export {
  BUTTON_LABELS,
  DEFAULT_PROGRESS_LABEL,
  PROGRESS_LABEL_BY_TASK_STATUS,
  TaskStatus,
  TOAST_MESSAGES,
  TrackStatus,
};
