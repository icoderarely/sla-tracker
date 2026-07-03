"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ClientType, IssueTag, Severity } from "@/lib/types";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function optStr(formData: FormData, key: string): string | null {
  const v = str(formData, key);
  return v.length > 0 ? v : null;
}

function clientType(formData: FormData): ClientType {
  return formData.get("client_type") === "b2c" ? "b2c" : "b2b";
}

export async function createClientRecord(formData: FormData) {
  const supabase = await createClient();
  const name = str(formData, "name");
  if (!name) throw new Error("Client name is required.");

  const { data, error } = await supabase
    .from("clients")
    .insert({
      name,
      company: optStr(formData, "company"),
      contact_info: optStr(formData, "contact_info"),
      client_type: clientType(formData),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/clients");
  return data;
}

export async function updateClientRecord(formData: FormData) {
  const supabase = await createClient();
  const clientId = str(formData, "client_id");
  const name = str(formData, "name");
  if (!clientId) throw new Error("Missing client id.");
  if (!name) throw new Error("Client name is required.");

  const { error } = await supabase
    .from("clients")
    .update({
      name,
      company: optStr(formData, "company"),
      contact_info: optStr(formData, "contact_info"),
      client_type: clientType(formData),
    })
    .eq("id", clientId);

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
}

export async function updateClientType(formData: FormData) {
  const supabase = await createClient();
  const clientId = str(formData, "client_id");
  if (!clientId) throw new Error("Missing client id.");

  const { error } = await supabase
    .from("clients")
    .update({ client_type: clientType(formData) })
    .eq("id", clientId);

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
}

export async function deleteClientRecord(formData: FormData) {
  const supabase = await createClient();
  const clientId = str(formData, "client_id");
  if (!clientId) throw new Error("Missing client id.");

  const { error } = await supabase.from("clients").delete().eq("id", clientId);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath("/history");
}

/**
 * Creates a new open thread (optionally for a brand-new client) and its
 * first logged message. This is the "client just pinged me" fast path, so it
 * accepts either an existing client id or inline new-client fields.
 */
export async function createIssue(formData: FormData) {
  const supabase = await createClient();

  let clientId = optStr(formData, "client_id");
  if (!clientId) {
    const name = str(formData, "new_client_name");
    if (!name) throw new Error("Client name is required.");
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({
        name,
        company: optStr(formData, "new_client_company"),
        contact_info: optStr(formData, "new_client_contact"),
      })
      .select()
      .single();
    if (clientError) throw new Error(clientError.message);
    clientId = client.id;
  }

  const title = str(formData, "title");
  if (!title) throw new Error("A short summary is required.");

  const severity = optStr(formData, "severity") as Severity | null;
  const tag = optStr(formData, "tag") as IssueTag | null;

  const { data: thread, error: threadError } = await supabase
    .from("threads")
    .insert({
      client_id: clientId,
      title,
      severity,
      tag,
      status: "open",
    })
    .select()
    .single();

  if (threadError) throw new Error(threadError.message);

  const body = str(formData, "body");
  if (body) {
    const isUpdate = formData.get("is_update") === "on";
    const { error: messageError } = await supabase.from("messages").insert({
      thread_id: thread.id,
      body,
      is_update: isUpdate,
      sender: "me",
    });
    if (messageError) throw new Error(messageError.message);
  }

  revalidatePath("/");
  revalidatePath("/history");
  redirect(`/threads/${thread.id}`);
}

export async function addMessage(formData: FormData) {
  const supabase = await createClient();
  const threadId = str(formData, "thread_id");
  const body = str(formData, "body");
  if (!body) throw new Error("Message body is required.");
  const isUpdate = formData.get("is_update") === "on";

  const { error } = await supabase.from("messages").insert({
    thread_id: threadId,
    body,
    is_update: isUpdate,
    sender: "me",
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/threads/${threadId}`);
  revalidatePath("/");
  revalidatePath("/history");
}

export async function markResolved(formData: FormData) {
  const supabase = await createClient();
  const threadId = str(formData, "thread_id");

  const { data: thread, error } = await supabase
    .from("threads")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", threadId)
    .select()
    .single();
  if (error) throw new Error(error.message);

  revalidatePath(`/threads/${threadId}`);
  revalidatePath("/");
  revalidatePath("/history");
  if (thread?.client_id) revalidatePath(`/clients/${thread.client_id}`);
}

export async function reopenThread(formData: FormData) {
  const supabase = await createClient();
  const threadId = str(formData, "thread_id");

  const { data: thread, error } = await supabase
    .from("threads")
    .update({ status: "open", resolved_at: null })
    .eq("id", threadId)
    .select()
    .single();
  if (error) throw new Error(error.message);

  revalidatePath(`/threads/${threadId}`);
  revalidatePath("/");
  revalidatePath("/history");
  if (thread?.client_id) revalidatePath(`/clients/${thread.client_id}`);
}

export async function updateThreadMeta(formData: FormData) {
  const supabase = await createClient();
  const threadId = str(formData, "thread_id");
  const severity = optStr(formData, "severity") as Severity | null;
  const tag = optStr(formData, "tag") as IssueTag | null;

  const { error } = await supabase
    .from("threads")
    .update({ severity, tag })
    .eq("id", threadId);
  if (error) throw new Error(error.message);

  revalidatePath(`/threads/${threadId}`);
  revalidatePath("/");
}
