import { Queue } from 'bullmq';

let queueInstance: Queue | null = null;

function getConnection() {
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  };
}

async function getQueue(): Promise<Queue> {
  if (!queueInstance) {
    queueInstance = new Queue('analysis', { connection: getConnection() });
  }
  return queueInstance;
}

export async function enqueueAnalysisJob(payload: any): Promise<boolean> {
  try {
    const q = await getQueue();
    await q.add('analyze-file', payload);
    return true;
  } catch (err) {
    console.warn('[queue] enqueue failed; continuing without queue');
    return false;
  }
}
