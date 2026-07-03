import { createClient } from "@/lib/supabase/server";
import type {
  Client,
  ClientWithThreadSummary,
  Message,
  Thread,
  ThreadWithMessages,
} from "@/lib/types";

export async function getOpenThreadsWithMessages(): Promise<ThreadWithMessages[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("threads")
    .select("*, client:clients(*), messages(*)")
    .eq("status", "open");

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ThreadWithMessages[];
}

export async function getClients(): Promise<Client[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getThreadWithMessages(
  threadId: string
): Promise<ThreadWithMessages | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("threads")
    .select("*, client:clients(*), messages(*)")
    .eq("id", threadId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as ThreadWithMessages | null;
}

export async function getClientsWithThreadSummaries(): Promise<
  ClientWithThreadSummary[]
> {
  const supabase = await createClient();
  const [{ data: clients, error: clientsError }, { data: threads, error: threadsError }] =
    await Promise.all([
      supabase.from("clients").select("*").order("name", { ascending: true }),
      supabase.from("threads").select("*").order("created_at", { ascending: false }),
    ]);

  if (clientsError) throw new Error(clientsError.message);
  if (threadsError) throw new Error(threadsError.message);

  const threadsByClient = new Map<string, Thread[]>();
  for (const thread of threads ?? []) {
    const existing = threadsByClient.get(thread.client_id);
    if (existing) existing.push(thread);
    else threadsByClient.set(thread.client_id, [thread]);
  }

  return (clients ?? []).map((client) => {
    const clientThreads = threadsByClient.get(client.id) ?? [];
    return {
      ...client,
      openThreads: clientThreads.filter((t) => t.status === "open"),
      resolvedCount: clientThreads.filter((t) => t.status === "resolved").length,
    };
  });
}

export async function getClientWithThreads(
  clientId: string
): Promise<{ client: Client; threads: Thread[] } | null> {
  const supabase = await createClient();
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .maybeSingle();

  if (clientError) throw new Error(clientError.message);
  if (!client) return null;

  const { data: threads, error: threadsError } = await supabase
    .from("threads")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (threadsError) throw new Error(threadsError.message);
  return { client, threads: threads ?? [] };
}

export interface HistoryFilters {
  clientId?: string;
  status?: "open" | "resolved";
  from?: string;
  to?: string;
  query?: string;
}

export interface HistoryRow {
  message: Message;
  thread: Thread;
  client: Client;
}

export async function getHistory(filters: HistoryFilters): Promise<HistoryRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("messages")
    .select("*, thread:threads!inner(*, client:clients!inner(*))")
    .order("sent_at", { ascending: false })
    .limit(500);

  if (filters.clientId) {
    query = query.eq("thread.client_id", filters.clientId);
  }
  if (filters.status) {
    query = query.eq("thread.status", filters.status);
  }
  if (filters.from) {
    query = query.gte("sent_at", filters.from);
  }
  if (filters.to) {
    query = query.lte("sent_at", filters.to);
  }
  if (filters.query) {
    query = query.ilike("body", `%${filters.query}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const { thread, ...message } = row as unknown as Message & {
      thread: Thread & { client: Client };
    };
    const { client, ...threadRest } = thread;
    return { message, thread: threadRest, client };
  });
}
