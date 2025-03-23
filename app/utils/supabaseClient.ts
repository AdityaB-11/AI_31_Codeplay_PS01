import { createClient } from '@supabase/supabase-js';

// Validate and format Supabase URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Ensure URL is properly formatted
const formattedUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`;

try {
  // Validate URL
  new URL(formattedUrl);
} catch (error) {
  console.error('Invalid Supabase URL:', error);
  throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL format');
}

export const supabase = createClient(formattedUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface User {
  id: string;
  name?: string;
  email?: string;
  created_at?: string;
}

export interface ChatSession {
  id?: string;
  user_id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id?: string;
  session_id: string;
  message_type: 'user' | 'ai';
  content: string;
  source?: string;
  confidence?: number;
  created_at?: string;
}

export async function createOrGetUser(userId: string): Promise<User | null> {
  try {
    // First, try to get existing user
    let { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (user) {
      return user;
    }

    // If user doesn't exist, create new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ id: userId }])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return null;
    }

    return newUser;
  } catch (error) {
    console.error('Error in createOrGetUser:', error);
    return null;
  }
}

export async function createChatSession(userId: string, title: string): Promise<ChatSession | null> {
  try {
    console.log('Creating chat session with:', { userId, title });
    
    // First ensure user exists
    const user = await createOrGetUser(userId);
    if (!user) {
      console.error('Failed to create/get user');
      return null;
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([{ 
        user_id: userId, 
        title,
        updated_at: new Date().toISOString() 
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating chat session:', error.message);
      console.error('Error details:', error);
      return null;
    }

    if (!data) {
      console.error('No data returned from chat session creation');
      return null;
    }

    console.log('Successfully created chat session:', data);
    return data;
  } catch (error) {
    console.error('Exception in createChatSession:', error);
    return null;
  }
}

export async function saveChatMessage(message: ChatMessage): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .insert([message]);

    if (error) {
      console.error('Error saving chat message:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to save chat message:', error);
    return false;
  }
}

export async function getChatHistory(sessionId: string): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
    return [];
  }
}

export async function getUserSessions(userId: string): Promise<ChatSession[]> {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch user sessions:', error);
    return [];
  }
} 