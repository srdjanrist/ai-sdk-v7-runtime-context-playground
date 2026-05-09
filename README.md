# AI SDK v7 Runtime Context Playground

A small Next.js app for hands-on exploration of two new AI SDK v7 features:

- **`runtimeContext`** — request-scoped data forwarded to every step of a
  `streamText` call (and visible inside `prepareStep`).
- **`toolsContext`** — typed, per-tool context delivered to a tool's
  `execute` function via its declared `contextSchema`.

Edit JSON in the left panel, chat in the middle, and watch the backend's
`console.log` output stream into the right panel in real time.

## What's inside

The UI is a three-panel layout:

- **Left — Context Panel.** Two editable JSON textareas (one for
  `runtimeContext`, one for the selected tool's `toolsContext` slice) and a
  `Tools: enabled / disabled` toggle. Edits apply to the *next* message you
  send.
- **Middle — Thread.** A standard `@assistant-ui/react` chat with two
  starter suggestions ("What's the weather in Tokyo?" and "Tell me a fun
  fact about space.").
- **Right — Log Panel.** A resizable pane that streams server-side
  `console.log` lines back to the browser, so you can see the contexts the
  model and tools actually received without leaving the page.

The app ships one demo tool, `get_current_weather`, which declares a
`contextSchema` of `{ weatherApiKey: string }` and logs the key it was
called with — that's the easiest way to see `toolsContext` end-to-end.

## Prerequisites

- **Node 20+** (Next.js 16 / React 19 baseline).
- **npm** — the repo ships `package-lock.json`. `pnpm` or `yarn` will work
  but aren't the lockfile of record.
- An **OpenAI API key** with access to `gpt-5-mini` (or swap the model — see
  [Tweaking the model](#tweaking-the-model)).

## Run it locally

```bash
git clone <this-repo-url>
cd ai-sdk-v7-runtime-context-playground
npm install
cp .env.example .env.local
# then edit .env.local and set OPENAI_API_KEY=sk-...
npm run dev
```

Open <http://localhost:3000>.

Available scripts:

| Script          | Purpose                  |
| --------------- | ------------------------ |
| `npm run dev`   | Start the dev server     |
| `npm run build` | Build the production app |
| `npm run start` | Run the built app        |

## Experimenting with `runtimeContext`

The left panel's top textarea defaults to:

```json
{ "somethingElse": "other-context" }
```

Edit it however you like, send any message, and look at the right Log Panel
— you'll see something like:

```
prepareStep runtimeContext: { somethingElse: "other-context" }
```

That's `app/api/chat/route.ts` reading the value back inside
`prepareStep`. Whatever you type in the JSON box is what arrives at the
server for the next request.

There's one special key the route knows about: `tools`. Set the runtime
context to:

```json
{ "tools": "disabled" }
```

…then ask "What's the weather in Tokyo?". The model won't be able to call
the weather tool — `prepareStep` returns `activeTools: []` when it sees the
flag, and you'll see `tools disabled by runtimeContext.tools === 'disabled'`
in the log. Flip the value back (or use the `Tools: enabled` button) to
restore tool calling.

## Experimenting with `toolsContext`

Pick `get_current_weather` in the tools-context selector and edit its JSON
(default `{ "weatherApiKey": "weather-123" }`). Ask for the weather
somewhere — the tool's `execute` function logs the key it was handed:

```
weather tool api key: <whatever you typed>
```

That's the full path: browser textarea → request body → `streamText({
toolsContext })` → the tool's `execute({ context })` argument, all driven by
the `contextSchema` on the tool definition.

Note: the value is illustrative only. The tool doesn't call any real
weather service — it returns a random number near 72°F.

## Adding your own tool

1. Add an entry to `toolRegistry` in `lib/tools.ts` with `inputSchema`,
   `contextSchema`, an `execute` function, and a `defaultContext`.
2. The Context Panel picks it up automatically — it iterates `toolNames`
   exported from `lib/tools.ts`.
3. If your new tool needs a typed slice of `toolsContext`, extend the cast
   in `app/api/chat/route.ts` where the `toolsContext` shape is asserted.

## Tweaking the model

The model is hard-coded in `app/api/chat/route.ts`:

```ts
model: openai("gpt-5-mini"),
```

Change it to anything your key has access to (`gpt-4o-mini`, etc.). The
runtime/tools context plumbing is model-agnostic.

## Project layout

```
app/
  page.tsx              Three-panel layout, transport wiring, context injection
  api/chat/route.ts     streamText() call wiring runtimeContext / toolsContext / prepareStep
lib/
  tools.ts              Tool registry; each tool declares a contextSchema
  context-store.ts      Zustand store backing the editable JSON panels
  runtime-defaults.ts   Default runtimeContext value
  log-stream.ts         console.log interceptor; ships logs as data-log UI parts
  log-store.ts          Zustand store for the Log Panel
components/
  context-panel.tsx     Left panel UI
  log-panel.tsx         Right panel UI
  assistant-ui/         Thread, message, etc.
```

## Tech stack

- Next.js 16, React 19
- AI SDK 7 (canary), `@ai-sdk/openai` 4 (canary)
- `@assistant-ui/react` for the chat surface
- Zustand for client state
- Tailwind v4 + shadcn/ui + Radix
- Zod 4 for schemas
