type TaskStatusResponse = {
  id: string;
  input_file_path: string;
  output_file_path: string;
  status: string;
  progress: number;
  error: string;
  created_at: string;
  updated_at: string;
};

export type { TaskStatusResponse };
