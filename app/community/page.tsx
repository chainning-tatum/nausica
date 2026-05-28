import { createClient } from '@/lib/supabase/server'
import CommunityClient from '@/components/CommunityClient'

export default async function CommunityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get all past prompts that have community entries, newest first
  const { data: prompts } = await supabase
    .from('prompts')
    .select('id, text, date')
    .lte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: false })
    .limit(60)

  const promptIds = (prompts || []).map(p => p.id)

  // Get all community entries for those prompts
  const { data: entries } = await supabase
    .from('entries')
    .select('id, content, visibility, word_count, created_at, prompt_id')
    .in('prompt_id', promptIds.length > 0 ? promptIds : ['none'])
    .eq('visibility', 'community')
    .order('created_at', { ascending: false })

  // Group entries by prompt_id
  const entriesByPrompt: Record<string, any[]> = {}
  for (const entry of entries || []) {
    if (!entriesByPrompt[entry.prompt_id]) entriesByPrompt[entry.prompt_id] = []
    entriesByPrompt[entry.prompt_id].push(entry)
  }

  // Only include prompts that have at least one entry
  const promptsWithEntries = (prompts || []).filter(p => (entriesByPrompt[p.id] || []).length > 0)

  return (
    <CommunityClient
      user={user}
      promptsWithEntries={promptsWithEntries}
      entriesByPrompt={entriesByPrompt}
    />
  )
}
