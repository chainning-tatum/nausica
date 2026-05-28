import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import JournalClient from '@/components/JournalClient'

export default async function JournalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: entries } = await supabase
    .from('entries')
    .select('id, content, visibility, word_count, created_at, prompt_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get all prompts for those entries
  const promptIds = [...new Set((entries || []).map(e => e.prompt_id))]
  const { data: prompts } = await supabase
    .from('prompts')
    .select('id, text, date')
    .in('id', promptIds.length > 0 ? promptIds : ['none'])

  const promptMap = Object.fromEntries((prompts || []).map(p => [p.id, p]))

  return <JournalClient entries={entries || []} promptMap={promptMap} />
}
