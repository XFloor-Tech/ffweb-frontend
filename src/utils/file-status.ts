import {
  TaskStatus as TaskStatusMap,
  TrackStatus,
} from "@/constants/file-constants";
import type { TaskStatus } from "@/types/file-types";

/**
 * Возвращает true, если статус задачи является ложным.
 * Ложные статусы:
 * - Error
 * - Failed
 * - Cancelled
 */
const getFalsyTaskStatus = (status: TaskStatus) =>
  (
    [
      TaskStatusMap.Error,
      TaskStatusMap.Failed,
      TaskStatusMap.Cancelled,
    ] as string[]
  ).includes(status);

const getTrackStatusFromTaskStatus = (taskStatus: TaskStatus) =>
  taskStatus === TaskStatusMap.Error || taskStatus === TaskStatusMap.Failed
    ? TrackStatus.Error
    : taskStatus === TaskStatusMap.Completed
      ? TrackStatus.Done
      : taskStatus === TaskStatusMap.Processing
        ? TrackStatus.Converting
        : undefined;

export { getFalsyTaskStatus, getTrackStatusFromTaskStatus };
