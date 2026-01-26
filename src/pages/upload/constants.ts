const TaskStatus = {
  Cancelled: "cancelled",
  Completed: "completed",
  Error: "error",
  Failed: "failed",
  Pending: "pending",
  Processing: "processing",
} as const;

type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

const TrackStatus = {
  Converting: "converting",
  Done: "done",
  Error: "error",
} as const;

type TrackStatus = (typeof TrackStatus)[keyof typeof TrackStatus];

const PROGRESS_LABEL_BY_TASK_STATUS: Partial<Record<TaskStatus, string>> = {
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
  TOAST_MESSAGES,
  TaskStatus,
  TrackStatus,
};
