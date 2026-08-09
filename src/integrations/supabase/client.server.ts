// Server-only Supabase service-role client. Never import this module into browser code.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const CANONICAL_SUPABASE_PROJECT_REF = 'oyadomcsptmgudwuxwvq';

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function assertCanonicalSupabaseUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('[Supabase server] SUPABASE_URL is not a valid URL');
  }

  if (
    url.protocol !== 'https:' ||
    url.hostname !== `${CANONICAL_SUPABASE_PROJECT_REF}.supabase.co`
  ) {
    throw new Error(
      `[Supabase server] Backend drift detected. Expected project ${CANONICAL_SUPABASE_PROJECT_REF}`,
    );
  }
  return url.origin;
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }

    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function createSupabaseAdminClient() {
  const configuredUrl = process.env['SUPABASE_URL'];
  const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!configuredUrl || !serviceRoleKey) {
    const missing = [
      ...(!configuredUrl ? ['SUPABASE_URL'] : []),
      ...(!serviceRoleKey ? ['SUPABASE_SERVICE_ROLE_KEY'] : []),
    ];
    throw new Error(
      `[Supabase server] Missing server secret(s): ${missing.join(', ')}`,
    );
  }

  const supabaseUrl = assertCanonicalSupabaseUrl(configuredUrl);
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    global: { fetch: createSupabaseFetch(serviceRoleKey) },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let _supabaseAdmin: ReturnType<typeof createSupabaseAdminClient> | undefined;

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createSupabaseAdminClient>, {
  get(_, prop, receiver) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return Reflect.get(_supabaseAdmin, prop, receiver);
  },
});
