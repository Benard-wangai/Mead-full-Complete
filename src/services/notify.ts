import { supabase } from '../utils/supabaseClient';

export async function notifyUser(params: {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  if (!params.userId) return;
  const { data: session } = await supabase.auth.getUser();
  if (session.user?.id === params.userId) return;

  await supabase.from('notifications').insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    data: params.data ?? {},
    read: false,
  });
}
