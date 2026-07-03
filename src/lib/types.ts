export type ThreadStatus = "open" | "resolved";
export type Severity = "P0" | "P1" | "P2" | "P3";
export type IssueTag = "bug" | "feature" | "question";
export type Sender = "me";

export interface Client {
  id: string;
  name: string;
  company: string | null;
  contact_info: string | null;
  created_at: string;
}

export interface Thread {
  id: string;
  client_id: string;
  title: string;
  status: ThreadStatus;
  severity: Severity | null;
  tag: IssueTag | null;
  created_at: string;
  resolved_at: string | null;
}

export interface Message {
  id: string;
  thread_id: string;
  body: string;
  sent_at: string;
  sender: Sender;
  is_update: boolean;
  created_at: string;
}

export interface ThreadWithClient extends Thread {
  client: Client;
}

export interface ThreadWithMessages extends ThreadWithClient {
  messages: Message[];
}
