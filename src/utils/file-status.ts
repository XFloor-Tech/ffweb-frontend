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
const getFalsyTaskStatus = (status?: TaskStatus | null) =>
  !!status &&
  (
    [
      TaskStatusMap.Error,
      TaskStatusMap.Failed,
      TaskStatusMap.Cancelled,
    ] as string[]
  ).includes(status);

/**
 * Возвращает статус трека по статусу задачи.
 * Если статус задачи является ошибкой или неудачной, то возвращает TrackStatus.Error.
 * Если статус задачи завершен, то возвращает TrackStatus.Done.
 * Если статус задачи выполняется, то возвращает TrackStatus.Converting.
 */
const getTrackStatusFromTaskStatus = (taskStatus: TaskStatus) =>
  taskStatus === TaskStatusMap.Error || taskStatus === TaskStatusMap.Failed
    ? TrackStatus.Error
    : taskStatus === TaskStatusMap.Completed
      ? TrackStatus.Done
      : taskStatus === TaskStatusMap.Processing
        ? TrackStatus.Converting
        : undefined;

export { getFalsyTaskStatus, getTrackStatusFromTaskStatus };
