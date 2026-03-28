// CaptionCraft — Admin User Management
// Requires env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY
//
// Actions (via ?action= query param):
//   list   — list all workspace members
//   invite — invite a new user by email with a role
//   update — update a user's role / brand_id
//   remove — delete a user

const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // service role key — bypasses RLS
);

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // 1. Verify caller is authenticated
  const token = event.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  // Validate the JWT using the service key client
  const { data: { user }, error: authError } = await sb.auth.getUser(token);
  if (authError || !user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid token' }) };
  }

  // 2. Verify caller is an admin
  const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden — admin only' }) };
  }

  const action = event.queryStringParameters?.action;
  const body = event.body ? JSON.parse(event.body) : {};

  // 3. Route by action
  try {
    if (action === 'list') {
      // List all workspace members (excludes the admin themselves)
      const { data, error } = await sb
        .from('profiles')
        .select('id, display_name, email, role, brand_id')
        .eq('workspace_id', user.id)
        .neq('id', user.id);

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data || []) };
    }

    if (action === 'invite') {
      const { email, role, brand_id } = body;
      if (!email) return { statusCode: 400, headers, body: JSON.stringify({ error: 'email required' }) };
      if (!['team', 'client'].includes(role)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'role must be team or client' }) };
      }

      // Invite user — Supabase sends the invite email
      // The user_metadata is picked up by the handle_new_user DB trigger
      const { data, error } = await sb.auth.admin.inviteUserByEmail(email, {
        data: {
          role,
          workspace_id: user.id,
          brand_id: (role === 'client' && brand_id) ? brand_id : null,
        }
      });

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, user: data.user }) };
    }

    if (action === 'update') {
      const { userId, role, brand_id } = body;
      if (!userId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'userId required' }) };

      const { error } = await sb
        .from('profiles')
        .update({ role, brand_id: brand_id || null })
        .eq('id', userId)
        .eq('workspace_id', user.id);  // safety: only update users in this workspace

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (action === 'remove') {
      const { userId } = body;
      if (!userId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'userId required' }) };

      // Verify the user being removed belongs to this workspace
      const { data: memberProfile } = await sb
        .from('profiles')
        .select('workspace_id')
        .eq('id', userId)
        .single();

      if (memberProfile?.workspace_id !== user.id) {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Cannot remove user from another workspace' }) };
      }

      const { error } = await sb.auth.admin.deleteUser(userId);
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: `Unknown action: ${action}` }) };

  } catch (e) {
    console.error('admin-users error:', e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
