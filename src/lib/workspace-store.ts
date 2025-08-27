type WorkspaceRecord = {
  userId: string;
  fileIds: string[];
  name?: string;
  description?: string;
  createdAt: string;
};

const workspaceStore = new Map<string, WorkspaceRecord>();

export function setWorkspace(
  workspaceId: string,
  record: Omit<WorkspaceRecord, 'createdAt'>
) {
  workspaceStore.set(workspaceId, {
    ...record,
    createdAt: new Date().toISOString(),
  });
}

export function getWorkspace(
  workspaceId: string
): WorkspaceRecord | undefined {
  return workspaceStore.get(workspaceId);
}


