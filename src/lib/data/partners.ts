import 'server-only';
import { cache } from 'react';
import { db } from '@/lib/supabase/admin';
import { FIXTURE_PARTNERS } from './fixtures';
import { fixturesEnabled } from './source';
import { PARTNER_PUBLIC_COLUMNS, type PublicPartner } from './types';

export const getPublishedPartners = cache(async (): Promise<PublicPartner[]> => {
  if (fixturesEnabled()) return FIXTURE_PARTNERS;
  const { data, error } = await db()
    .from('partners')
    .select(PARTNER_PUBLIC_COLUMNS)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw new Error(`partners query failed: ${error.message}`);
  return data ?? [];
});
