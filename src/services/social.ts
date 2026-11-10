import { supabase } from '../utils/supabaseClient';
import { notifyUser } from './notify';

export type FeedItem = {
  id: string;
  user_id: string;
  body: string;
  media_url: string | null;
  media_type: string | null;
  kind: string;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
  like_count: number;
  comment_count: number;
  liked: boolean;
};

export async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Please sign in to continue.');
  return data.user.id;
}

export async function getMyProfile() {
  const userId = await requireUserId();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function searchProfiles(query: string) {
  const q = query.trim();
  if (!q) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio')
    .or(`username.ilike.%${q}%,full_name.ilike.%${q}%,phone.ilike.%${q}%`)
    .limit(30);
  if (error) throw error;
  return data || [];
}

export async function followUser(targetId: string) {
  const userId = await requireUserId();
  const { error } = await supabase.from('follows').insert({
    follower_id: userId,
    following_id: targetId,
  });
  if (error && !String(error.message).includes('duplicate')) throw error;
  const me = await getMyProfile();
  await notifyUser({
    userId: targetId,
    type: 'follow',
    title: 'New follower',
    body: `${me?.full_name || me?.username || 'Someone'} started following you`,
  });
}

export async function unfollowUser(targetId: string) {
  const userId = await requireUserId();
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', userId)
    .eq('following_id', targetId);
  if (error) throw error;
}

export async function isFollowing(targetId: string): Promise<boolean> {
  const userId = await requireUserId();
  const { data } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', userId)
    .eq('following_id', targetId)
    .maybeSingle();
  return Boolean(data);
}

export async function createPost(params: {
  body: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  kind?: string;
  targetType?: string;
  targetCountries?: string[] | null;
  isBoosted?: boolean;
}) {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      body: params.body.trim(),
      media_url: params.mediaUrl || null,
      media_type: params.mediaType || null,
      kind: params.kind || 'post',
      target_type: params.targetType || 'worldwide',
      target_countries: params.targetCountries || null,
      is_boosted: Boolean(params.isBoosted),
    })
    .select('id')
    .single();
  if (error) throw error;
  return data;
}

export async function fetchFeed(): Promise<FeedItem[]> {
  const userId = await requireUserId();
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, user_id, body, media_url, media_type, kind, created_at, profiles (full_name, username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(80);
  if (error) throw error;

  const ids = (posts || []).map((p: { id: string }) => p.id);
  const [{ data: likes }, { data: comments }, { data: myLikes }] = await Promise.all([
    supabase.from('likes').select('target_id').eq('target_type', 'post').in('target_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']),
    supabase.from('comments').select('target_id').eq('target_type', 'post').in('target_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']),
    supabase.from('likes').select('target_id').eq('target_type', 'post').eq('user_id', userId),
  ]);

  const likeMap = new Map<string, number>();
  (likes || []).forEach((row: { target_id: string }) => {
    likeMap.set(row.target_id, (likeMap.get(row.target_id) || 0) + 1);
  });
  const commentMap = new Map<string, number>();
  (comments || []).forEach((row: { target_id: string }) => {
    commentMap.set(row.target_id, (commentMap.get(row.target_id) || 0) + 1);
  });
  const likedSet = new Set((myLikes || []).map((row: { target_id: string }) => row.target_id));

  return (posts || []).map((post: any) => ({
    id: post.id,
    user_id: post.user_id,
    body: post.body,
    media_url: post.media_url,
    media_type: post.media_type,
    kind: post.kind,
    created_at: post.created_at,
    author_name: post.profiles?.full_name || post.profiles?.username || 'Mead member',
    author_avatar: post.profiles?.avatar_url || null,
    like_count: likeMap.get(post.id) || 0,
    comment_count: commentMap.get(post.id) || 0,
    liked: likedSet.has(post.id),
  }));
}

export async function toggleLike(targetType: string, targetId: string, ownerId?: string) {
  const userId = await requireUserId();
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .maybeSingle();

  if (existing?.id) {
    await supabase.from('likes').delete().eq('id', existing.id);
    return false;
  }

  const { error } = await supabase.from('likes').insert({
    user_id: userId,
    target_type: targetType,
    target_id: targetId,
  });
  if (error) throw error;
  if (ownerId) {
    const me = await getMyProfile();
    await notifyUser({
      userId: ownerId,
      type: 'like',
      title: 'New like',
      body: `${me?.full_name || 'Someone'} liked your ${targetType}`,
      data: { targetType, targetId },
    });
  }
  return true;
}

export async function addComment(targetType: string, targetId: string, content: string, ownerId?: string) {
  const userId = await requireUserId();
  const { error } = await supabase.from('comments').insert({
    user_id: userId,
    target_type: targetType,
    target_id: targetId,
    content: content.trim(),
  });
  if (error) throw error;
  if (ownerId) {
    const me = await getMyProfile();
    await notifyUser({
      userId: ownerId,
      type: 'comment',
      title: 'New comment',
      body: `${me?.full_name || 'Someone'} commented: ${content.trim().slice(0, 80)}`,
      data: { targetType, targetId },
    });
  }
}

export async function fetchComments(targetType: string, targetId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('id, content, created_at, user_id, profiles (full_name, username, avatar_url)')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function openDirectConversation(otherUserId: string, otherName?: string) {
  const userId = await requireUserId();
  if (otherUserId === userId) throw new Error('You cannot message yourself.');

  const { data: mine } = await supabase
    .from('conversation_participants')
    .select('conversation_id, conversations (id, type)')
    .eq('user_id', userId);

  const myDirectIds = (mine || [])
    .filter((row: any) => row.conversations?.type === 'direct')
    .map((row: any) => row.conversation_id);

  if (myDirectIds.length) {
    const { data: shared } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', otherUserId)
      .in('conversation_id', myDirectIds)
      .limit(1);
    if (shared?.[0]?.conversation_id) {
      return shared[0].conversation_id as string;
    }
  }

  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert({
      type: 'direct',
      name: otherName || 'Chat',
      created_by: userId,
    })
    .select('id')
    .single();
  if (error) throw error;

  const { error: partError } = await supabase.from('conversation_participants').insert([
    { conversation_id: conversation.id, user_id: userId },
    { conversation_id: conversation.id, user_id: otherUserId },
  ]);
  if (partError) throw partError;
  return conversation.id as string;
}

export async function globalSearch(query: string) {
  const q = query.trim();
  if (q.length < 2) return { people: [], groups: [], products: [], posts: [] };

  const [people, groups, products, posts] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio')
      .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
      .limit(12),
    supabase.from('groups').select('id, name, description, image_url, member_count').ilike('name', `%${q}%`).limit(12),
    supabase.from('products').select('id, title, price, currency, image_url, location').ilike('title', `%${q}%`).limit(12),
    supabase.from('posts').select('id, body, media_url, user_id').ilike('body', `%${q}%`).limit(12),
  ]);

  return {
    people: people.data || [],
    groups: groups.data || [],
    products: products.data || [],
    posts: posts.data || [],
  };
}
