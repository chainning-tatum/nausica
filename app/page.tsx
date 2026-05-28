import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HomeClient from '@/components/HomeClient'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get today's prompt
  const today = new Date().toISOString().split('T')[0]
  const { data: prompt } = await supabase
    .from('prompts')
    .select('*')
    .eq('date', today)
    .single()

  // Get user's entry for today if logged in
  let userEntry = null
  if (user && prompt) {
    const { data } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('prompt_id', prompt.id)
      .single()
    userEntry = data
  }

  // Get public entries for today's prompt
  let publicEntries: any[] = []
  if (prompt) {
    const { data } = await supabase
      .from('entries')
      .select('id, content, visibility, word_count, created_at, user_id')
      .eq('prompt_id', prompt.id)
      .in('visibility', ['community'])
      .order('created_at', { ascending: false })
      .limit(50)
    publicEntries = data || []
  }

  return (
    <HomeClient
      user={user}
      prompt={prompt}
      userEntry={userEntry}
      publicEntries={publicEntries}
    />
  )
}
