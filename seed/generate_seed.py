#!/usr/bin/env python3
"""
Generate realistic, messy test data for Nausica.

Writes seed/seed_partN_of_M.sql and seed/cleanup.sql. Paste each part into the
Supabase SQL Editor in order. cleanup.sql removes the test users and their
entries (prompts are kept: the app needs one per day anyway).

Test users are Gmail plus-addresses on OWNER_EMAIL, so magic-link logins for
any of them land in that inbox.

    python3 seed/generate_seed.py
    python3 seed/generate_seed.py --users 60 --seed 7
"""
import argparse
import json
import math
import random
import re
import uuid
from collections import Counter
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import bcrypt

OWNER_EMAIL = "benjamin.mcinnes9@gmail.com"
SEED_TAG = "nausica-test-seed"
TEST_PASSWORD = "NausicaTest!2026"

FIRST_DAY = date(2026, 4, 1)
TODAY = date(2026, 11, 8)
PROMPTS_UNTIL = date(2026, 12, 15)
NOW = datetime(2026, 11, 9, 3, 0, tzinfo=timezone.utc)  # Nov 8, 7pm Pacific

TZS = ["America/Los_Angeles", "America/Vancouver", "America/Toronto", "America/New_York",
       "America/Chicago", "Europe/London", "Australia/Sydney", "America/Denver"]

FIRST = """Maya Jonah Iris Felix Noor Silas Wren Theo Ada Rumi Elio June Kai Clara Ezra Lina Otis
Mira Arlo Sana Hugo Lila Remy Nia Cyrus Esme Ravi Tess Nico Leila Jude Anya Milo Zara Oren
Faye Idris Cleo Ansel Priya Bea Tomas Hana Luca Vera Dev Ines Sami Rosa Omar Pia Kofi Lucia""".split()
LAST = """Hart Moreno Quinn Sato Abbott Reyes Lund Okoye Brandt Kaur Novak Ellis Fujita Marsh
Delgado Wolfe Haddad Byrne Lindgren Achebe Park Costa Varga Mbeki Vance Rahim Sorensen""".split()

# ---------------------------------------------------------------- prompts
PROMPTS = """What are you quietly proud of that no one else knows about?
Describe a moment this week where time felt different.
What would you do with one hour completely alone and unobserved?
What belief have you changed your mind on in the last year?
Write about something you keep meaning to say but haven't.
What does your ideal ordinary day look like?
What are you avoiding right now, and why?
What's a small thing that made today better?
Who do you miss, and what would you tell them?
What did you learn about yourself this month?
Describe a smell that takes you somewhere else.
What are you holding onto that you could let go of?
What would your younger self be surprised by?
When did you last feel completely at ease?
What's taking up too much space in your head?
Write a letter to someone you'll never send it to.
What does rest actually look like for you?
What are you looking forward to, even a little?
Describe the room you're in right now.
What's a habit you're trying to build, and how's it going?
What's something you've been too hard on yourself about?
What did you notice today that you usually overlook?
If this week had a title, what would it be?
What's a conversation you keep replaying?
What do you want more of in your life?
What do you want less of?
Write about a place that feels like home.
What's something you're curious about lately?
What are you grateful for that you rarely mention?
Describe your energy today in three words, then explain.
What would you do if you weren't afraid of looking foolish?
What's a recent mistake you've made peace with?
What does success mean to you right now?
Who has shaped you more than they know?
What's the kindest thing someone has done for you recently?
What's a song that matches your mood today?
What are you pretending not to know?
What do you need to hear today?
Describe a perfect meal and who you'd share it with.
What's a question you wish someone would ask you?
What boundaries do you need to set?
What are you most uncertain about right now?
Write about the last time you laughed hard.
What's something you've outgrown?
What part of your routine would you keep forever?
What's one thing you'd tell a friend going through what you are?
When do you feel most like yourself?
What drains you, and what refills you?
What's a memory you return to often?
What would you like to be remembered for?
What did today ask of you?
What are you building, slowly?
What feels unfinished?
Describe your morning in detail.
What do you wish you'd done differently this week?
What is your body trying to tell you?
What's a risk you're glad you took?
What does your inner critic sound like lately?
What do you admire in people you love?
What made you feel small recently, and what made you feel big?
What are three things you can control today?
Write about a stranger you still think about.
What's your relationship with your phone like right now?
What would a slower version of your life look like?
Where do you feel stuck?
Describe a version of you five years from now.
What's a tradition you want to keep or start?
What season are you in, emotionally?
What surprised you today?
What's the most honest thing you can say right now?
What are you waiting for permission to do?
What did you used to love doing that you stopped?
What is enough?
Write about your hands and what they've done today.
What's a compliment you've never forgotten?
What scares you about change?
What brings you back to yourself after a bad day?
What's something you've been putting off for months?
Describe the view from your window.
What would you say to the person you were a year ago?
What are you proud of from this week, however small?
What are you tired of explaining?
What's a lesson you keep having to relearn?
Write about a friendship that changed you.
What does your ideal weekend look like?
What are you overthinking?
What feels heavy, and what feels light?
What would you do with a free day tomorrow?
What do you want to remember about this year?
What's something you forgive yourself for?
How have you been talking to yourself lately?
What would make tomorrow a good day?
What do you know now that you didn't before?
What does home mean to you this year?
What did you let go of today?
What's the best advice you ignored?
What are you hungry for, not food?
Where did your attention go today?
Write about a time you surprised yourself.
What are you learning to accept?
What's the story you tell about yourself, and is it true?
What would you like more courage for?
What's one thing you'd change about how you spend your evenings?
What are you carrying for someone else?
What makes you feel calm?
What would you say if you knew no one would judge you?
What are you outgrowing right now?
What gives your days meaning?
Write about weather, and how it's affecting you.
What's a goal you quietly abandoned?
What do you need to start, stop, and continue?
What does your future self need from you today?
What's the last thing you made with your own hands?
Write about someone who made you laugh this week.
What's a fear you've gotten smaller?
What did you do today purely for yourself?
What would your friends say you're good at?
What do you keep coming back to?
Write about an ordinary object that matters to you.
What does a good apology look like to you?
How are you, really?""".strip().split("\n")

# ---------------------------------------------------------------- entry text
OPENERS = ["honestly", "ok so", "Hm.", "Not sure where to start.", "This one's hard.", "Easy one.",
           "I almost skipped today.", "Writing this on the bus.", "In bed, can't sleep.",
           "Morning coffee, quiet house.", "Long day.", "ugh.", "Okay.", "Today's prompt hit.",
           "I keep thinking about this.", "Late again lol.", "Lunch break entry.", ""]
BODY = [
    "Work has been a lot lately and I don't think I've admitted that to anyone.",
    "I called my mom today and it was nice, we didn't fight about anything.",
    "I've been walking more and it actually helps, which is annoying because everyone said it would.",
    "I think I'm proud of how I handled the thing with my roommate.",
    "There's this feeling where the afternoon stretches and nothing needs to happen. I want more of that.",
    "I keep starting things and not finishing them. Maybe that's fine? Maybe the starting is the point.",
    "My sister is having a baby in December and I can't stop thinking about it.",
    "I ate lunch outside for the first time in weeks.",
    "I don't really know what I want right now and that scares me less than it used to.",
    "I've been avoiding my inbox like it's going to bite me.",
    "The dog woke me up at 5 and honestly the sunrise was worth it.",
    "Therapy today. A lot came up. I'm still sitting with it.",
    "I used to think being busy meant being important.",
    "Something about rain makes everything feel allowed.",
    "I said yes to something I wanted to say no to. Again.",
    "Made soup. Felt like a real adult for about forty minutes.",
    "I miss my grandpa. He'd have had something funny to say about all this.",
    "I think I've been lonely and calling it independence.",
    "Got some good news today that I'm not ready to share yet.",
    "I read on the train instead of scrolling and felt like a different person.",
    "Everyone at work seems to have it figured out and I'm just... here.",
    "I want to stop apologizing for taking up space.",
    "Ran into an old friend at the grocery store. We said we'd get coffee. We won't.",
    "My hands smell like garlic and I'm happy.",
    "Spent way too long on my phone tonight. Not great.",
    "I finally finished that book. The ending wrecked me.",
    "I keep replaying a dumb thing I said in a meeting. Nobody else remembers it, I'm sure.",
    "I think the answer is just: sleep more. It's always sleep more.",
    "Breakup stuff is still weird. Some days fine, some days not.",
    "I'm trying to be gentler with myself and it feels fake but I'm doing it anyway.",
    "The light in the kitchen at 4pm is my favourite thing about this apartment.",
    "Rent went up. Trying not to spiral.",
    "I signed up for a pottery class!! terrified!!",
    "I don't have a good answer to this one today.",
    "My knee hurts and I'm 29, what is happening.",
    "Had the kind of conversation where you lose track of time. More of those please.",
    "I cried in the car for no reason and then felt better. Bodies are weird.",
    "Today I just did the next thing, and then the next thing. That was enough.",
]
CLOSERS = ["Anyway.", "That's all for today.", "More tomorrow maybe.", "ok bye", "Goodnight.",
           "🙂", "😮‍💨", "💛", "…", "we'll see.", "Grateful, I guess.", "", "", ""]
TINY = ["tired.", "skip", "idk", ".", "nothing today", "later", "ok", "no.", "busy busy busy",
        "😴", "can't think", "asdfgh", "same as yesterday", "fine", "📝", "test", "hi",
        "Coffee. Rain. Work. Bed."]


def mess(rng, text, style):
    if style["lower"]:
        text = text.lower()
    if style["noperiods"]:
        text = re.sub(r"\.(\s|$)", r"\1", text)
    if rng.random() < style["typo"]:
        words = text.split(" ")
        i = rng.randrange(len(words))
        w = words[i]
        if len(w) > 3:
            j = rng.randrange(1, len(w) - 1)
            words[i] = w[:j] + w[j + 1] + w[j] + w[j + 2:]
        text = " ".join(words)
    if rng.random() < 0.05:
        text = text.replace("so", "sooo", 1).replace("really", "reallyyy", 1)
    return text


def write_entry(rng, style, prompt_text):
    r = rng.random()
    if r < style["tiny"]:
        return rng.choice(TINY)
    n = max(1, int(rng.gauss(style["length"], style["length"] * 0.5)))
    parts = []
    op = rng.choice(OPENERS)
    if op:
        parts.append(op)
    if rng.random() < 0.15:
        kw = re.sub(r"[?.]$", "", prompt_text.split(",")[0]).lower()
        parts.append(rng.choice([f"\"{prompt_text}\" — I don't know.", f"{kw}... let me think.",
                                 "This prompt feels personal lol."]))
    parts += rng.sample(BODY, k=min(n, len(BODY)))
    cl = rng.choice(CLOSERS)
    if cl:
        parts.append(cl)
    sep = "\n\n" if style["paragraphs"] else " "
    if style["paragraphs"]:
        chunks, cur = [], []
        for p in parts:
            cur.append(p)
            if rng.random() < 0.35:
                chunks.append(" ".join(cur)); cur = []
        if cur:
            chunks.append(" ".join(cur))
        text = sep.join(chunks)
    else:
        text = " ".join(parts)
    if rng.random() < 0.04:
        text = "- " + "\n- ".join(rng.sample(BODY, k=rng.randint(3, 5)))
    return mess(rng, text, style).strip() or "."


def word_count(text):
    t = text.strip()
    return len(t.split()) if t else 0


# ---------------------------------------------------------------- helpers
def q(v):
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, int):
        return str(v)
    if isinstance(v, datetime):
        return f"'{v.isoformat()}'::timestamptz"
    if isinstance(v, date):
        return f"'{v.isoformat()}'::date"
    if isinstance(v, (dict, list)):
        return "'" + json.dumps(v).replace("'", "''") + "'::jsonb"
    s = str(v)
    if "\n" in s or "\\" in s:
        # keep every literal on one line so nothing can split it mid-string
        return "E'" + s.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n") + "'"
    return "'" + s.replace("'", "''") + "'"


def values(rows, cols):
    return ",\n  ".join("(" + ", ".join(q(r[c]) for c in cols) + ")" for r in rows)


def plus_email(first, last):
    user, domain = OWNER_EMAIL.split("@")
    return f"{user}+{first.lower()}.{last.lower()}@{domain}"


def days(a, b):
    d = a
    while d <= b:
        yield d
        d += timedelta(days=1)


# ---------------------------------------------------------------- build
ARCHETYPES = [
    # name, share, P(write on a given day), how long they stick around (days, None = still going)
    ("devoted", 0.02, (0.75, 0.95), None),
    ("regular", 0.30, (0.40, 0.75), (30, 150)),
    ("returner", 0.15, (0.30, 0.55), (40, 200)),
    ("dabbler", 0.45, (0.50, 0.90), (2, 14)),
    ("lurker", 0.08, (0.0, 0.0), (0, 0)),  # signed up, never wrote
]


def build(n_users, seed):
    rng = random.Random(seed)
    pw_hash = bcrypt.hashpw(TEST_PASSWORD.encode(), bcrypt.gensalt(rounds=10, prefix=b"2a")).decode()

    all_days = list(days(FIRST_DAY, PROMPTS_UNTIL))
    texts = PROMPTS[:]
    rng.shuffle(texts)
    prompts = [{"date": d, "text": texts[i % len(texts)]} for i, d in enumerate(all_days)]
    ptext = {p["date"]: p["text"] for p in prompts}

    names = set()
    while len(names) < n_users:
        names.add((rng.choice(FIRST), rng.choice(LAST)))
    names = sorted(names)
    rng.shuffle(names)

    span = (TODAY - FIRST_DAY).days
    users, entries = [], []
    for first, last in names:
        arch = ARCHETYPES[0] if len(users) < 4 else rng.choices(ARCHETYPES, weights=[a[1] for a in ARCHETYPES])[0]
        kind, _, (plo, phi), stay = arch
        # sign-ups: dense in April, thinning toward now
        x = -math.log(1 - rng.random() * (1 - math.exp(-1 / 0.4))) * 0.4
        signup = FIRST_DAY + timedelta(days=int(x * span))
        if kind == "devoted":
            signup = FIRST_DAY + timedelta(days=rng.randint(0, 60))
        tz = ZoneInfo(rng.choice(TZS))
        hour = rng.choice([7, 8, 12, 21, 22, 23, 23, 0, 1])
        uid = str(uuid.UUID(int=rng.getrandbits(128), version=4))
        signup_at = datetime.combine(signup, time(hour % 24, rng.randint(0, 59)), tz).astimezone(timezone.utc)
        users.append({"id": uid, "email": plus_email(first, last), "created": signup_at, "kind": kind})

        style = {
            "lower": rng.random() < 0.35, "noperiods": rng.random() < 0.15, "typo": rng.random() * 0.4,
            "paragraphs": rng.random() < 0.4, "length": rng.choice([1, 2, 3, 3, 4, 6, 9]),
            "tiny": rng.choice([0.0, 0.03, 0.08, 0.2]),
        }
        share = rng.choice([0.0, 0.0, 0.0, 0.05, 0.2, 0.5, 0.9])
        p_write = rng.uniform(plo, phi)
        end = TODAY if stay is None else min(TODAY, signup + timedelta(days=rng.randint(*stay)))
        gap = None
        if kind == "returner":
            g0 = signup + timedelta(days=rng.randint(10, 60))
            gap = (g0, g0 + timedelta(days=rng.randint(20, 70)))
            end = TODAY if rng.random() < 0.5 else end + timedelta(days=60)
            end = min(end, TODAY)

        streak_energy = 1.0
        for d in days(signup, end):
            if gap and gap[0] <= d <= gap[1]:
                continue
            # gentle fade the longer someone's been around (except devoted)
            age = (d - signup).days
            fade = 1.0 if kind == "devoted" else max(0.2, 1 - age / 220)
            weekend = 0.8 if d.weekday() >= 5 else 1.0
            if rng.random() > p_write * fade * weekend * streak_energy:
                streak_energy = max(0.6, streak_energy - 0.05)
                continue
            streak_energy = min(1.1, streak_energy + 0.02)
            h = hour + rng.choice([-1, 0, 0, 0, 1, 2])
            local = datetime.combine(d, time(0, 0), tz) + timedelta(hours=h, minutes=rng.randint(0, 59))
            created = local.astimezone(timezone.utc)
            if created > NOW:
                continue
            text = write_entry(rng, style, ptext[d])
            updated = created + (timedelta(minutes=rng.randint(1, 600)) if rng.random() < 0.2 else timedelta(seconds=rng.randint(3, 40)))
            entries.append({
                "id": str(uuid.UUID(int=rng.getrandbits(128), version=4)), "user_id": uid, "d": d,
                "content": text, "visibility": "community" if rng.random() < share and len(text) > 15 else "private",
                "word_count": word_count(text), "created_at": created, "updated_at": min(updated, NOW),
            })
    return dict(prompts=prompts, users=users, entries=entries, pw_hash=pw_hash)


# ---------------------------------------------------------------- render
def render(d, limit=450_000):
    header = f"""-- Nausica test data, generated {datetime.now(timezone.utc):%Y-%m-%d %H:%M} UTC
-- {len(d['users'])} users, {len(d['entries'])} entries, daily prompts {FIRST_DAY} to {PROMPTS_UNTIL}
-- (existing prompts are kept; only missing dates are filled).
-- Every test user can log in with password {TEST_PASSWORD}, or by magic link
-- (it lands in {OWNER_EMAIL}).
"""
    stmts = []
    stmts.append(f"""do $$ begin
  if exists (select 1 from auth.users where raw_app_meta_data->>'seed' = '{SEED_TAG}') then
    raise exception 'Test data is already loaded. Run cleanup.sql first.';
  end if;
end $$;
""")
    stmts.append("-- Prompts for every missing day\ninsert into public.prompts (date, text) values\n  "
                 + values(d["prompts"], ["date", "text"]) + "\non conflict (date) do nothing;\n")
    au = [{"instance_id": "00000000-0000-0000-0000-000000000000", "id": u["id"], "aud": "authenticated",
           "role": "authenticated", "email": u["email"], "encrypted_password": d["pw_hash"],
           "email_confirmed_at": u["created"], "last_sign_in_at": u["created"],
           "raw_app_meta_data": {"provider": "email", "providers": ["email"], "seed": SEED_TAG},
           "raw_user_meta_data": {}, "created_at": u["created"], "updated_at": u["created"],
           "confirmation_token": "", "recovery_token": "", "email_change": "", "email_change_token_new": ""}
          for u in d["users"]]
    cols = list(au[0])
    stmts.append(f"insert into auth.users ({', '.join(cols)}) values\n  " + values(au, cols) + ";\n")
    ids = [{"id": str(uuid.uuid5(uuid.NAMESPACE_URL, "nausica-identity:" + u["id"])), "user_id": u["id"],
            "provider_id": u["id"], "provider": "email",
            "identity_data": {"sub": u["id"], "email": u["email"], "email_verified": True},
            "last_sign_in_at": u["created"], "created_at": u["created"], "updated_at": u["created"]}
           for u in d["users"]]
    cols = list(ids[0])
    stmts.append(f"insert into auth.identities ({', '.join(cols)}) values\n  " + values(ids, cols) + ";\n")

    # word_count is a generated column in the database, so it is never inserted
    ecols = ["id", "user_id", "d", "content", "visibility", "created_at", "updated_at"]
    E = d["entries"]
    for i in range(0, len(E), 300):
        stmts.append(
            "insert into public.entries (id, user_id, prompt_id, content, visibility, created_at, updated_at)\n"
            "select v.id::uuid, v.user_id::uuid, p.id, v.content, v.visibility, v.created_at, v.updated_at\n"
            f"from (values\n  {values(E[i:i + 300], ecols)}\n) as v(id, user_id, d, content, visibility, created_at, updated_at)\n"
            "join public.prompts p on p.date = v.d;\n")
    stmts.append(f"""select (select count(*) from auth.users where raw_app_meta_data->>'seed' = '{SEED_TAG}') as test_users,
       (select count(*) from public.entries e join auth.users u on u.id = e.user_id
         where u.raw_app_meta_data->>'seed' = '{SEED_TAG}') as test_entries,
       (select count(*) from public.prompts) as prompts_total;
""")

    groups, cur = [], ""
    for st in stmts:
        if cur and len(cur) + len(st) > limit:
            groups.append(cur); cur = ""
        cur += st + "\n"
    groups.append(cur)
    n = len(groups)
    return [header + f"-- PART {i} OF {n}. Run the parts in order.\n"
            + ("" if i == 1 else "-- If an earlier part failed, run cleanup.sql and start again from part 1.\n")
            + "\nbegin;\n\n" + g + "commit;\n" for i, g in enumerate(groups, 1)]


CLEANUP = f"""-- Nausica: remove the test users and all of their entries.
-- Only matches users tagged '{SEED_TAG}'. Prompts are left in place on purpose:
-- the app needs a prompt for each day, and real entries may already use them.

begin;

delete from public.entries
  where user_id in (select id from auth.users where raw_app_meta_data->>'seed' = '{SEED_TAG}');
delete from auth.identities
  where user_id in (select id from auth.users where raw_app_meta_data->>'seed' = '{SEED_TAG}');
delete from auth.users where raw_app_meta_data->>'seed' = '{SEED_TAG}';

select 'done' as status;

commit;
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--users", type=int, default=60)
    ap.add_argument("--seed", type=int, default=20261108)
    a = ap.parse_args()
    d = build(a.users, a.seed)
    here = Path(__file__).parent
    for f in here.glob("seed_part*.sql"):
        f.unlink()
    parts = render(d)
    for i, p in enumerate(parts, 1):
        (here / f"seed_part{i}_of_{len(parts)}.sql").write_text(p)
    (here / "cleanup.sql").write_text(CLEANUP)

    E = d["entries"]
    print(f"users {len(d['users'])}  entries {len(E)}  prompts {len(d['prompts'])}  parts {len(parts)}")
    print("archetypes:", dict(Counter(u["kind"] for u in d["users"])))
    print("entries by month:", dict(sorted(Counter(e["d"].strftime("%Y-%m") for e in E).items())))
    print("community share:", round(sum(e["visibility"] == "community" for e in E) / len(E), 2),
          " median words:", sorted(e["word_count"] for e in E)[len(E) // 2],
          " max words:", max(e["word_count"] for e in E))
    print("entries today:", sum(e["d"] == TODAY for e in E))


if __name__ == "__main__":
    main()
