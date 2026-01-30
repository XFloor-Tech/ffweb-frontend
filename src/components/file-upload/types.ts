import type { TaskStatus } from "@/types/file-types";

type TaskStatusResponse = {
  id: string;
  input_file_path: string;
  output_file_path: string;
  status: TaskStatus;
  progress: number;
  error: string;
  created_at: string;
  updated_at: string;
};

export type { TaskStatusResponse };
