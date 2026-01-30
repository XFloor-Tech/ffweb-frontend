const ALERT_TEXT = {
  app: {
    mockServerUnavailableToast: "Mock server unavailable.",
    serverUnreachableAlert: {
      title: "We couldn't reach the server",
      description: "Please wait a bit and try again.",
    },
  },
  fileUpload: {
    noTaskSelectedToast: "No task selected. Start a conversion first.",
    uploadFailedToast: "Upload failed. Please try again.",
    taskStatusFailedToast: "Task status failed. Please try again.",
    downloadFailedToast: "Download failed. Please try again.",
  },
} as const;

export { ALERT_TEXT };
