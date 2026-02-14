export type Difficulty = 'easy' | 'medium' | 'hard';

export interface AnswerOption {
  id: string;
  text: string;
}

export interface Snippet {
  id: string;
  code: string;
  question: string;
  answers: AnswerOption[];
  correctAnswerId: string;
  /** Shown in explanation bottom sheet after answering */
  explanation?: string;
}

/** Used to match userStore.selectedStack for daily challenge filtering */
export type PackLanguage = 'TypeScript' | 'React' | 'Go' | 'Python' | 'General';

export interface QuizPack {
  id: string;
  icon: string;
  color: string;
  title: string;
  description: string;
  isLocked: boolean;
  difficulty: Difficulty;
  language: PackLanguage;
  tags?: string[];
  snippets: Snippet[];
}

export interface DailyChallenge {
  id: string;
  title: string;
  packId: string;
  snippetId: string;
}

export interface TopicMasteryItem {
  name: string;
  mastered: boolean;
}

export interface RankInfo {
  level: number;
  name: string;
  description: string;
  progress: number; // 0-1 towards next rank
  xp: number;
  xpForNextRank: number;
}

const baseQuizPacks: QuizPack[] = [
  {
    id: 'ts-generics',
    icon: 'terminal',
    color: '#e9fb61',
    isLocked: false,
    title: 'TypeScript Generics',
    description:
      'Deepen your understanding of TypeScript generics with real-world examples and tricky edge cases.',
    difficulty: 'easy',
    language: 'TypeScript',
    snippets: [
      {
        id: 'ts-gen-1',
        question: 'What is the correct way to declare a generic function in TypeScript?',
        code: 'function identity/* ? */(value /* ? */) {\n  return value;\n}',
        answers: [
          {
            id: 'a',
            text: 'function identity<T>(value: T): T',
          },
          {
            id: 'b',
            text: 'function<T> identity(value): T',
          },
          {
            id: 'c',
            text: 'generic identity<T>(value: T)',
          },
          {
            id: 'd',
            text: 'fn identity<T>(value: T): T',
          },
        ],
        correctAnswerId: 'a',
        explanation: 'In TypeScript, generic type parameters are declared in angle brackets right after the function name: function identity<T>(value: T): T. This allows the function to work with any type while preserving it.',
      },
      {
        id: 'ts-gen-2',
        question: 'How can you restrict a generic type parameter to objects with an id field?',
        code: 'function getId/* ? */(value /* ? */) {\n  return value.id;\n}',
        answers: [
          {
            id: 'a',
            text: 'function getId<T>(value: T): string',
          },
          {
            id: 'b',
            text: 'function getId<T extends { id: string }>(value: T): string',
          },
          {
            id: 'c',
            text: 'function getId(value: { id: string }): string',
          },
          {
            id: 'd',
            text: 'function getId<T implements { id: string }>(value: T): string',
          },
        ],
        correctAnswerId: 'b',
      },
    ],
  },
  {
    id: 'rust-ownership',
    icon: 'sparkles',
    color: '#61fb8f',
    isLocked: true,
    title: 'Rust Ownership',
    description:
      'Practice Rust ownership, borrowing, and lifetimes with small, focused snippets.',
    difficulty: 'hard',
    language: 'General',
    tags: ['Rust'],
    snippets: [
      {
        id: 'rust-own-1',
        question: 'Why does this code fail to compile?',
        code: 'let s = String::from(\"hello\");\nlet s2 = s;\nprintln!(\"{} {}\", s, s2);',
        answers: [
          {
            id: 'a',
            text: 'Because println! can only take one String argument.',
          },
          {
            id: 'b',
            text: 'Because s was moved into s2 and can no longer be used.',
          },
          {
            id: 'c',
            text: 'Because String does not implement Display.',
          },
          {
            id: 'd',
            text: 'Because s must be mutable.',
          },
        ],
        correctAnswerId: 'b',
        explanation:
          'Incrementing a shared variable (counter++) without synchronization (e.g. locks or atomic operations) is a classic race condition: multiple threads can read the same value, increment, and write back, losing updates.',
      },
    ],
  },
  {
    id: 'react-hooks',
    icon: 'wrench',
    color: '#61fbfb',
    isLocked: true,
    title: 'React Hooks',
    description:
      'Avoid common pitfalls with useState, useEffect, and custom hooks.',
    difficulty: 'easy',
    language: 'React',
    snippets: [
      {
        id: 'react-hooks-1',
        question: 'What is the main rule of hooks that this snippet violates?',
        code: 'if (someCondition) {\n  const [count, setCount] = useState(0);\n}\n',
        answers: [
          {
            id: 'a',
            text: 'Hooks can only be used inside async functions.',
          },
          {
            id: 'b',
            text: 'Hooks must be called at the top level of a component.',
          },
          {
            id: 'c',
            text: 'Hooks cannot use destructuring.',
          },
          {
            id: 'd',
            text: 'Hooks must be called in event handlers.',
          },
        ],
        correctAnswerId: 'b',
        explanation:
          'Hooks must be called in the same order every render. Calling useState inside a conditional breaks that rule and can lead to inconsistent state and bugs.',
      },
      {
        id: 'react-hooks-2',
        question: 'Which dependency list prevents stale data when "query" changes?',
        code: 'useEffect(() => {\n  fetchData(query);\n}, /* ? */)',
        answers: [
          {
            id: 'a',
            text: '[]',
          },
          {
            id: 'b',
            text: '[query]',
          },
          {
            id: 'c',
            text: '[fetchData]',
          },
          {
            id: 'd',
            text: 'No dependency array',
          },
        ],
        correctAnswerId: 'b',
        explanation:
          'If the effect depends on query, query must be included in the dependency array so React reruns the effect when query changes.',
      },
    ],
  },
  {
    id: 'system-design',
    icon: 'gear',
    color: '#6163fb',
    isLocked: false,
    title: 'System Design',
    description:
      'High-level design questions around scalability, consistency, and trade-offs.',
    difficulty: 'hard',
    language: 'General',
    tags: ['System Design'],
    snippets: [
      {
        id: 'sys-design-1',
        question: 'Which consistency model fits this pseudocode best?',
        code: '// write\nput(\"cart:123\", updatedCart)\n\n// read\nget(\"cart:123\")',
        answers: [
          {
            id: 'a',
            text: 'Strong consistency',
          },
          {
            id: 'b',
            text: 'Eventual consistency',
          },
          {
            id: 'c',
            text: 'Causal consistency',
          },
          {
            id: 'd',
            text: 'Session consistency',
          },
        ],
        correctAnswerId: 'b',
      },
    ],
  },
  {
    id: 'concurrency',
    icon: 'cloud',
    color: '#bd61fb',
    isLocked: false,
    title: 'Concurrency',
    description:
      'Reason about race conditions, deadlocks, and synchronization primitives.',
    difficulty: 'medium',
    language: 'General',
    tags: ['Concurrency'],
    snippets: [
      {
        id: 'concurrency-1',
        question: 'What bug is most likely in this pseudocode?',
        code: 'counter++ // shared across threads without synchronization',
        answers: [
          {
            id: 'a',
            text: 'Memory leak',
          },
          {
            id: 'b',
            text: 'Race condition',
          },
          {
            id: 'c',
            text: 'Deadlock',
          },
          {
            id: 'd',
            text: 'Off-by-one error',
          },
        ],
        correctAnswerId: 'b',
      },
    ],
  },
  {
    id: 'go-interfaces',
    icon: 'book',
    color: '#fb6192',
    isLocked: true,
    title: 'Go Interfaces',
    description:
      'Understand how Go interfaces and implicit implementation work.',
    difficulty: 'medium',
    language: 'Go',
    snippets: [
      {
        id: 'go-iface-1',
        question: 'Why does this code compile even without an explicit implements keyword?',
        code: 'type Reader interface {\n  Read(p []byte) (n int, err error)\n}\n\ntype File struct{}\n\nfunc (f *File) Read(p []byte) (n int, err error) {\n  return 0, nil\n}\n',
        answers: [
          {
            id: 'a',
            text: 'Because File is a struct, not a class.',
          },
          {
            id: 'b',
            text: 'Because Go uses implicit interface satisfaction.',
          },
          {
            id: 'c',
            text: 'Because interfaces are only documentation in Go.',
          },
          {
            id: 'd',
            text: 'Because Reader has no methods.',
          },
        ],
        correctAnswerId: 'b',
      },
    ],
  },
  {
    id: 'dotnet-basics',
    icon: 'bell',
    color: '#fbb361',
    isLocked: true,
    title: '.NET Basics',
    description:
      'C# syntax, async/await, and memory management fundamentals.',
    difficulty: 'easy',
    language: 'General',
    tags: ['.Net'],
    snippets: [
      {
        id: 'dotnet-1',
        question: 'What does the async keyword guarantee by itself?',
        code: 'public async Task<int> GetValueAsync() {\n  return 42;\n}',
        answers: [
          {
            id: 'a',
            text: 'That the method will run on a background thread.',
          },
          {
            id: 'b',
            text: 'That the method will always be non-blocking.',
          },
          {
            id: 'c',
            text: 'That the method can use the await keyword inside.',
          },
          {
            id: 'd',
            text: 'That the method returns immediately with default value.',
          },
        ],
        correctAnswerId: 'c',
      },
    ],
  },
  {
    id: 'ts-async-patterns',
    icon: 'bolt',
    color: '#d8fb61',
    isLocked: false,
    title: 'TypeScript Async Patterns',
    description: 'Promises, async/await, and safe async typing.',
    difficulty: 'medium',
    language: 'TypeScript',
    snippets: [
      {
        id: 'ts-async-1',
        question: 'What should be the return type of an async function returning a number?',
        code: 'async function getValue() {\n  return 42;\n}',
        answers: [
          { id: 'a', text: 'number' },
          { id: 'b', text: 'Promise<number>' },
          { id: 'c', text: 'Task<number>' },
          { id: 'd', text: 'Async<number>' },
        ],
        correctAnswerId: 'b',
      },
      {
        id: 'ts-async-2',
        question: 'How do you type an array of promises of strings?',
        code: 'const jobs: /* ? */ = [fetchName(), fetchTitle()];',
        answers: [
          { id: 'a', text: 'Promise<string[]>' },
          { id: 'b', text: 'Promise<string>[]' },
          { id: 'c', text: 'string[]' },
          { id: 'd', text: 'Array<string>' },
        ],
        correctAnswerId: 'b',
      },
    ],
  },
  {
    id: 'ts-advanced-types',
    icon: 'flame',
    color: '#c8fb61',
    isLocked: false,
    title: 'TypeScript Advanced Types',
    description: 'Conditional and mapped types for robust APIs.',
    difficulty: 'hard',
    language: 'TypeScript',
    snippets: [
      {
        id: 'ts-hard-1',
        question: 'What does this conditional type resolve to when T is string?',
        code: 'type ToArray<T> = T extends any ? T[] : never;\ntype X = ToArray<string>',
        answers: [
          { id: 'a', text: 'string[]' },
          { id: 'b', text: 'never' },
          { id: 'c', text: 'Array<any>' },
          { id: 'd', text: 'unknown[]' },
        ],
        correctAnswerId: 'a',
      },
      {
        id: 'ts-hard-2',
        question: 'Why is keyof { [k: string]: boolean } equal to string | number?',
        code: 'type K = keyof { [k: string]: boolean }',
        answers: [
          { id: 'a', text: 'Because keys are only strings.' },
          { id: 'b', text: 'Because JavaScript coerces numeric keys to strings.' },
          { id: 'c', text: 'Because keyof always returns number.' },
          { id: 'd', text: 'Because index signatures disallow strings.' },
        ],
        correctAnswerId: 'b',
      },
    ],
  },
  {
    id: 'react-state-patterns',
    icon: 'sparkles',
    color: '#61fbe9',
    isLocked: false,
    title: 'React State Patterns',
    description: 'State updates and effect dependencies.',
    difficulty: 'medium',
    language: 'React',
    snippets: [
      {
        id: 'react-med-1',
        question: 'Why is functional update preferred here?',
        code: 'setCount(count + 1);\nsetCount(count + 1);',
        answers: [
          { id: 'a', text: 'No reason, both are always identical.' },
          { id: 'b', text: 'It avoids stale state when batching updates.' },
          { id: 'c', text: 'It makes setState synchronous.' },
          { id: 'd', text: 'It disables rerenders.' },
        ],
        correctAnswerId: 'b',
      },
      {
        id: 'react-med-2',
        question: 'Which dependency list is correct if effect uses userId and token?',
        code: 'useEffect(() => {\n  loadUser(userId, token);\n}, /* ? */)',
        answers: [
          { id: 'a', text: '[]' },
          { id: 'b', text: '[userId]' },
          { id: 'c', text: '[userId, token]' },
          { id: 'd', text: '[loadUser]' },
        ],
        correctAnswerId: 'c',
      },
    ],
  },
  {
    id: 'react-performance',
    icon: 'gauge',
    color: '#61fbc7',
    isLocked: false,
    title: 'React Performance',
    description: 'Memoization and render optimization decisions.',
    difficulty: 'hard',
    language: 'React',
    snippets: [
      {
        id: 'react-hard-1',
        question: 'When is useMemo most useful?',
        code: 'const value = useMemo(() => heavyCompute(data), [data]);',
        answers: [
          { id: 'a', text: 'For every value, even cheap ones.' },
          { id: 'b', text: 'For expensive derived values recalculated often.' },
          { id: 'c', text: 'To avoid all rerenders.' },
          { id: 'd', text: 'To replace useEffect.' },
        ],
        correctAnswerId: 'b',
      },
      {
        id: 'react-hard-2',
        question: 'What is a common pitfall with React.memo?',
        code: 'const Child = React.memo(function Child({ onClick }) { /* ... */ });',
        answers: [
          { id: 'a', text: 'It never rerenders under any condition.' },
          { id: 'b', text: 'Unstable function props can still trigger rerenders.' },
          { id: 'c', text: 'It only works in class components.' },
          { id: 'd', text: 'It increases state size.' },
        ],
        correctAnswerId: 'b',
      },
    ],
  },
  {
    id: 'go-basics',
    icon: 'drop',
    color: '#fb71a0',
    isLocked: false,
    title: 'Go Basics',
    description: 'Core Go syntax and language behavior.',
    difficulty: 'easy',
    language: 'Go',
    snippets: [
      {
        id: 'go-easy-1',
        question: 'How do you declare and initialize a variable in Go using type inference?',
        code: '/* ? */ name = \"dev\"',
        answers: [
          { id: 'a', text: 'let name = \"dev\"' },
          { id: 'b', text: 'name := \"dev\"' },
          { id: 'c', text: 'var := name \"dev\"' },
          { id: 'd', text: 'name <- \"dev\"' },
        ],
        correctAnswerId: 'b',
      },
      {
        id: 'go-easy-2',
        question: 'What is the zero value of an int in Go?',
        code: 'var count int\nfmt.Println(count)',
        answers: [
          { id: 'a', text: 'nil' },
          { id: 'b', text: 'undefined' },
          { id: 'c', text: '0' },
          { id: 'd', text: '1' },
        ],
        correctAnswerId: 'c',
      },
    ],
  },
  {
    id: 'go-concurrency',
    icon: 'shuffle',
    color: '#fb6186',
    isLocked: false,
    title: 'Go Concurrency',
    description: 'Goroutines, channels, and synchronization.',
    difficulty: 'hard',
    language: 'Go',
    snippets: [
      {
        id: 'go-hard-1',
        question: 'What happens if you send to an unbuffered channel with no receiver?',
        code: 'ch := make(chan int)\nch <- 1',
        answers: [
          { id: 'a', text: 'Program panics immediately.' },
          { id: 'b', text: 'Send blocks until a receiver is ready.' },
          { id: 'c', text: 'Send is dropped.' },
          { id: 'd', text: 'Channel auto-buffers.' },
        ],
        correctAnswerId: 'b',
      },
      {
        id: 'go-hard-2',
        question: 'Why might this cause a data race?',
        code: 'var count int\ngo func() { count++ }()\ngo func() { count++ }()',
        answers: [
          { id: 'a', text: 'Goroutines cannot modify integers.' },
          { id: 'b', text: 'Concurrent writes without synchronization are unsafe.' },
          { id: 'c', text: 'count must be a pointer.' },
          { id: 'd', text: 'Go always serializes goroutines.' },
        ],
        correctAnswerId: 'b',
      },
    ],
  },
  {
    id: 'python-basics',
    icon: 'paperplane',
    color: '#f9d457',
    isLocked: false,
    title: 'Python Basics',
    description: 'Fundamental Python behavior and syntax.',
    difficulty: 'easy',
    language: 'Python',
    snippets: [
      {
        id: 'py-easy-1',
        question: 'What is the output type of range(5)?',
        code: 'x = range(5)\nprint(type(x))',
        answers: [
          { id: 'a', text: 'list' },
          { id: 'b', text: 'tuple' },
          { id: 'c', text: 'range' },
          { id: 'd', text: 'iterator' },
        ],
        correctAnswerId: 'c',
      },
      {
        id: 'py-easy-2',
        question: 'How do you create a list with values 1, 2, 3?',
        code: 'nums = /* ? */',
        answers: [
          { id: 'a', text: '(1, 2, 3)' },
          { id: 'b', text: '[1, 2, 3]' },
          { id: 'c', text: '{1, 2, 3}' },
          { id: 'd', text: '<1, 2, 3>' },
        ],
        correctAnswerId: 'b',
      },
    ],
  },
  {
    id: 'python-iterators',
    icon: 'book',
    color: '#e8c44f',
    isLocked: false,
    title: 'Python Iterators',
    description: 'Comprehensions, iterables, and generators.',
    difficulty: 'medium',
    language: 'Python',
    snippets: [
      {
        id: 'py-med-1',
        question: 'What does this list comprehension produce?',
        code: '[x * 2 for x in [1, 2, 3]]',
        answers: [
          { id: 'a', text: '[1, 2, 3]' },
          { id: 'b', text: '[2, 4, 6]' },
          { id: 'c', text: '[1, 4, 9]' },
          { id: 'd', text: '(2, 4, 6)' },
        ],
        correctAnswerId: 'b',
      },
      {
        id: 'py-med-2',
        question: 'What is yielded first by this generator?',
        code: 'def g():\n  for i in range(3):\n    yield i',
        answers: [
          { id: 'a', text: '1' },
          { id: 'b', text: '2' },
          { id: 'c', text: '0' },
          { id: 'd', text: 'None' },
        ],
        correctAnswerId: 'c',
      },
    ],
  },
  {
    id: 'python-async',
    icon: 'moon',
    color: '#d9b844',
    isLocked: false,
    title: 'Python Async',
    description: 'Async/await and event loop behavior.',
    difficulty: 'hard',
    language: 'Python',
    snippets: [
      {
        id: 'py-hard-1',
        question: 'What is required to run this coroutine?',
        code: 'async def work():\n  return 1',
        answers: [
          { id: 'a', text: 'Call work() directly and it executes fully.' },
          { id: 'b', text: 'Use await inside an event loop (e.g. asyncio.run).' },
          { id: 'c', text: 'Coroutines run automatically at import time.' },
          { id: 'd', text: 'Use threading.Thread on the coroutine object.' },
        ],
        correctAnswerId: 'b',
      },
      {
        id: 'py-hard-2',
        question: 'Why can CPU-bound work still block async code?',
        code: 'async def handler():\n  heavy_cpu_work()\n  await io_call()',
        answers: [
          { id: 'a', text: 'async always runs CPU work in parallel threads.' },
          { id: 'b', text: 'CPU work can block the event loop if not offloaded.' },
          { id: 'c', text: 'await prevents any blocking automatically.' },
          { id: 'd', text: 'Python forbids CPU operations in async functions.' },
        ],
        correctAnswerId: 'b',
      },
    ],
  },
  {
    id: 'ts-practice-lab',
    icon: 'hammer',
    color: '#c5fb61',
    isLocked: false,
    title: 'TypeScript Practice Lab',
    description: 'Extra TypeScript drills for testing larger daily pools.',
    difficulty: 'easy',
    language: 'TypeScript',
    snippets: [
      {
        id: 'ts-lab-1',
        question: 'Which type allows exactly "on" or "off"?',
        code: 'type Mode = /* ? */',
        answers: [
          { id: 'a', text: 'string' },
          { id: 'b', text: '"on" | "off"' },
          { id: 'c', text: 'boolean' },
          { id: 'd', text: 'any' },
        ],
        correctAnswerId: 'b',
      },
      {
        id: 'ts-lab-2',
        question: 'How do you define an optional property?',
        code: 'type User = { name: string; age/* ? */: number }',
        answers: [
          { id: 'a', text: '!' },
          { id: 'b', text: '*' },
          { id: 'c', text: '?' },
          { id: 'd', text: '&' },
        ],
        correctAnswerId: 'c',
      },
      {
        id: 'ts-lab-3',
        question: 'What is the type of this constant?',
        code: 'const score = 10 as const',
        answers: [
          { id: 'a', text: 'number' },
          { id: 'b', text: '10' },
          { id: 'c', text: 'readonly number' },
          { id: 'd', text: 'any' },
        ],
        correctAnswerId: 'b',
      },
    ],
  },
  {
    id: 'ts-runtime-traps',
    icon: 'triangle',
    color: '#affb61',
    isLocked: false,
    title: 'TypeScript Runtime Traps',
    description: 'Harder TS cases that appear often in interviews.',
    difficulty: 'hard',
    language: 'TypeScript',
    snippets: [
      {
        id: 'ts-traps-1',
        question: 'Why can this fail at runtime despite typing?',
        code: 'const user = JSON.parse(raw) as { name: string };\nconsole.log(user.name.toUpperCase());',
        answers: [
          { id: 'a', text: 'Type assertions do not validate runtime data.' },
          { id: 'b', text: 'JSON.parse always returns null.' },
          { id: 'c', text: 'toUpperCase is not valid for strings.' },
          { id: 'd', text: 'as keyword performs runtime checks.' },
        ],
        correctAnswerId: 'a',
      },
      {
        id: 'ts-traps-2',
        question: 'What does never indicate in exhaustive checks?',
        code: 'const assertNever = (x: never) => x;',
        answers: [
          { id: 'a', text: 'The code always returns undefined.' },
          { id: 'b', text: 'A branch should be unreachable if all cases are handled.' },
          { id: 'c', text: 'The function can accept any value.' },
          { id: 'd', text: 'The variable is nullable.' },
        ],
        correctAnswerId: 'b',
      },
      {
        id: 'ts-traps-3',
        question: 'What is the safest type for unknown API payloads?',
        code: 'const payload: /* ? */ = await fetchJson();',
        answers: [
          { id: 'a', text: 'any' },
          { id: 'b', text: 'unknown' },
          { id: 'c', text: 'object' },
          { id: 'd', text: 'never' },
        ],
        correctAnswerId: 'b',
      },
    ],
  },
  {
    id: 'react-ui-foundations',
    icon: 'square',
    color: '#61fbdb',
    isLocked: false,
    title: 'React UI Foundations',
    description: 'More easy React questions for broad testing.',
    difficulty: 'easy',
    language: 'React',
    snippets: [
      {
        id: 'react-ui-1',
        question: 'How do you render a list with stable keys?',
        code: 'items.map(item => <Row key={/* ? */} item={item} />)',
        answers: [
          { id: 'a', text: 'Math.random()' },
          { id: 'b', text: 'item.id' },
          { id: 'c', text: 'array index always' },
          { id: 'd', text: 'Date.now()' },
        ],
        correctAnswerId: 'b',
      },
      {
        id: 'react-ui-2',
        question: 'What should JSX return from a component?',
        code: 'function Card() {\n  return /* ? */\n}',
        answers: [
          { id: 'a', text: 'A single React node or fragment' },
          { id: 'b', text: 'Only strings' },
          { id: 'c', text: 'Only arrays' },
          { id: 'd', text: 'Only null' },
        ],
        correctAnswerId: 'a',
      },
      {
        id: 'react-ui-3',
        question: 'How do you conditionally render a badge?',
        code: '{isNew /* ? */ <Badge /> }',
        answers: [
          { id: 'a', text: '??' },
          { id: 'b', text: '&&' },
          { id: 'c', text: '||' },
          { id: 'd', text: '::' },
        ],
        correctAnswerId: 'b',
      },
    ],
  },
  {
    id: 'react-effects-lab',
    icon: 'pulse',
    color: '#61fbb4',
    isLocked: false,
    title: 'React Effects Lab',
    description: 'Medium React effect and state management drills.',
    difficulty: 'medium',
    language: 'React',
    snippets: [
      {
        id: 'react-eff-1',
        question: 'When should you return a cleanup from useEffect?',
        code: 'useEffect(() => {\n  const id = setInterval(tick, 1000);\n  return /* ? */\n}, [])',
        answers: [
          { id: 'a', text: 'Only in class components' },
          { id: 'b', text: 'When effect sets subscriptions/timers that must be disposed' },
          { id: 'c', text: 'Never, React handles it all' },
          { id: 'd', text: 'Only with useMemo' },
        ],
        correctAnswerId: 'b',
      },
      {
        id: 'react-eff-2',
        question: 'Why use useCallback for event handlers sometimes?',
        code: 'const onPress = useCallback(() => save(id), [id]);',
        answers: [
          { id: 'a', text: 'It avoids creating every function forever' },
          { id: 'b', text: 'It can help memoized children avoid rerenders' },
          { id: 'c', text: 'It makes code synchronous' },
          { id: 'd', text: 'It replaces useState' },
        ],
        correctAnswerId: 'b',
      },
      {
        id: 'react-eff-3',
        question: 'What is the main risk of omitting dependencies?',
        code: 'useEffect(() => {\n  sendMetric(userId);\n}, [])',
        answers: [
          { id: 'a', text: 'Faster rerenders only' },
          { id: 'b', text: 'Stale closures and outdated values' },
          { id: 'c', text: 'TypeScript compile error always' },
          { id: 'd', text: 'No risk at all' },
        ],
        correctAnswerId: 'b',
      },
    ],
  },
  {
    id: 'go-practice-lab',
    icon: 'cube',
    color: '#fb6178',
    isLocked: false,
    title: 'Go Practice Lab',
    description: 'Extra Go medium questions to reduce repeats.',
    difficulty: 'medium',
    language: 'Go',
    snippets: [
      {
        id: 'go-lab-1',
        question: 'What does make([]int, 3) create?',
        code: 'nums := make([]int, 3)',
        answers: [
          { id: 'a', text: 'nil slice with capacity 3' },
          { id: 'b', text: 'slice length 3 filled with zeros' },
          { id: 'c', text: 'array length 3' },
          { id: 'd', text: 'map with 3 entries' },
        ],
        correctAnswerId: 'b',
      },
      {
        id: 'go-lab-2',
        question: 'How do you check if a key exists in a map?',
        code: 'value, ok := myMap["id"]',
        answers: [
          { id: 'a', text: 'The second value indicates presence.' },
          { id: 'b', text: 'Maps throw when key is missing.' },
          { id: 'c', text: 'ok is always true.' },
          { id: 'd', text: 'Use len(myMap["id"]).' },
        ],
        correctAnswerId: 'a',
      },
      {
        id: 'go-lab-3',
        question: 'What keyword starts a goroutine?',
        code: '/* ? */ doWork()',
        answers: [
          { id: 'a', text: 'spawn' },
          { id: 'b', text: 'async' },
          { id: 'c', text: 'go' },
          { id: 'd', text: 'thread' },
        ],
        correctAnswerId: 'c',
      },
    ],
  },
  {
    id: 'python-practice-lab',
    icon: 'sun.max',
    color: '#d7b642',
    isLocked: false,
    title: 'Python Practice Lab',
    description: 'Extra Python medium drills for daily challenge testing.',
    difficulty: 'medium',
    language: 'Python',
    snippets: [
      {
        id: 'py-lab-1',
        question: 'What does dict.get("x", 0) return when key is missing?',
        code: 'count = data.get("x", 0)',
        answers: [
          { id: 'a', text: 'Raises KeyError' },
          { id: 'b', text: 'None' },
          { id: 'c', text: '0' },
          { id: 'd', text: 'False' },
        ],
        correctAnswerId: 'c',
      },
      {
        id: 'py-lab-2',
        question: 'What is the result of "3" * 2 in Python?',
        code: 'print("3" * 2)',
        answers: [
          { id: 'a', text: '6' },
          { id: 'b', text: '"33"' },
          { id: 'c', text: 'TypeError' },
          { id: 'd', text: '["3", "3"]' },
        ],
        correctAnswerId: 'b',
      },
      {
        id: 'py-lab-3',
        question: 'Which statement creates a set?',
        code: 'items = /* ? */',
        answers: [
          { id: 'a', text: '{1, 2, 3}' },
          { id: 'b', text: '[1, 2, 3]' },
          { id: 'c', text: '(1, 2, 3)' },
          { id: 'd', text: '{"a": 1}' },
        ],
        correctAnswerId: 'a',
      },
    ],
  },
];

const MIN_SNIPPETS_PER_PACK = 25;

type AutoTrack =
  | 'typescript'
  | 'react'
  | 'go'
  | 'python'
  | 'rust'
  | 'system'
  | 'dotnet'
  | 'general';

const TRACK_TOPICS: Record<AutoTrack, string[]> = {
  typescript: [
    'generic constraints',
    'discriminated unions',
    'narrowing unknown',
    'readonly tuple behavior',
    'mapped type remapping',
    'conditional type inference',
    'keyof and indexed access',
    'utility type composition',
    'type guards',
    'never exhaustiveness checks',
  ],
  react: [
    'effect dependency safety',
    'stale closure prevention',
    'memoization boundaries',
    'state normalization',
    'list key stability',
    'render splitting',
    'custom hook contract',
    'event handler identity',
    'derived state pitfalls',
    'component composition',
  ],
  go: [
    'interface satisfaction',
    'error wrapping',
    'context cancellation',
    'goroutine lifecycle',
    'channel close semantics',
    'select default usage',
    'pointer receiver behavior',
    'slice capacity growth',
    'map read safety',
    'defer ordering',
  ],
  python: [
    'iterator consumption',
    'generator laziness',
    'async task gathering',
    'context manager usage',
    'dict mutation safety',
    'truthy/falsy edge cases',
    'default argument traps',
    'list comprehension scope',
    'exception narrowing',
    'dataclass defaults',
  ],
  rust: [
    'ownership transfer',
    'borrow checker constraints',
    'mutable aliasing rules',
    'lifetime annotation meaning',
    'match exhaustiveness',
    'Result propagation',
    'Option unwrapping strategy',
    'iterator borrowing',
    'trait bound design',
    'move vs clone',
  ],
  system: [
    'cache invalidation strategy',
    'idempotency guarantees',
    'queue retry policy',
    'read/write consistency',
    'horizontal scaling boundary',
    'backpressure handling',
    'hot partition mitigation',
    'circuit breaker behavior',
    'event ordering',
    'observability signal selection',
  ],
  dotnet: [
    'nullable reference checks',
    'async/await deadlock avoidance',
    'LINQ materialization timing',
    'dependency injection lifetimes',
    'record immutability',
    'Task cancellation',
    'middleware ordering',
    'exception filter behavior',
    'value vs reference semantics',
    'IEnumerable deferred execution',
  ],
  general: [
    'algorithmic complexity tradeoff',
    'boundary condition validation',
    'error-first thinking',
    'pure function design',
    'state transition clarity',
    'input normalization',
    'defensive programming',
    'side effect isolation',
    'testability improvements',
    'refactor safety',
  ],
};

function getAutoTrack(pack: QuizPack): AutoTrack {
  if (pack.id.includes('react')) return 'react';
  if (pack.id.includes('go-') || pack.language === 'Go') return 'go';
  if (pack.id.includes('python') || pack.language === 'Python') return 'python';
  if (pack.id.includes('rust')) return 'rust';
  if (pack.id.includes('system')) return 'system';
  if (pack.id.includes('dotnet')) return 'dotnet';
  if (pack.id.includes('ts-') || pack.language === 'TypeScript') return 'typescript';
  return pack.language === 'General' ? 'general' : 'general';
}

function makeCodeExample(track: AutoTrack, pack: QuizPack, ordinal: number, topic: string): string {
  const fn = `${pack.id.replace(/-/g, '_')}_${ordinal}`;

  switch (track) {
    case 'python':
      return `def ${fn}(payload):\n    # ${pack.title}: ${topic}\n    return payload\n`;
    case 'go':
      return `func ${fn}(ctx context.Context, input string) (string, error) {\n  // ${pack.title}: ${topic}\n  return input, nil\n}\n`;
    case 'rust':
      return `fn ${fn}(value: String) -> String {\n    // ${pack.title}: ${topic}\n    value\n}\n`;
    case 'react':
      return `function ${fn}({ value }: { value: string }) {\n  // ${pack.title}: ${topic}\n  return <Text>{value}</Text>;\n}\n`;
    case 'dotnet':
      return `public static string ${fn}(string input)\n{\n    // ${pack.title}: ${topic}\n    return input;\n}\n`;
    case 'system':
      return `// ${pack.title}: ${topic}\n// Service A -> Queue -> Worker -> DB\n`;
    case 'typescript':
      return `function ${fn}<T>(value: T): T {\n  // ${pack.title}: ${topic}\n  return value;\n}\n`;
    default:
      return `function ${fn}(value) {\n  // ${pack.title}: ${topic}\n  return value;\n}\n`;
  }
}

function getRealWorldAnswers(track: AutoTrack, topic: string): AnswerOption[] {
  switch (track) {
    case 'typescript':
      return [
        { id: 'a', text: `Silence type errors with "as any" to ship ${topic} faster.` },
        { id: 'b', text: `Model ${topic} explicitly with safe narrowing and exhaustive checks.` },
        { id: 'c', text: `Duplicate runtime checks everywhere and ignore type design.` },
        { id: 'd', text: `Turn off strict mode for this module to reduce friction.` },
      ];
    case 'react':
      return [
        { id: 'a', text: `Leave dependency arrays empty and rely on manual refresh.` },
        { id: 'b', text: `Use stable dependencies and cleanup logic to prevent UI drift around ${topic}.` },
        { id: 'c', text: `Store derived values in multiple local states to keep views in sync.` },
        { id: 'd', text: `Trigger state updates inside render for immediate consistency.` },
      ];
    case 'go':
      return [
        { id: 'a', text: `Ignore returned errors so requests stay fast in production.` },
        { id: 'b', text: `Propagate context and explicit errors to make ${topic} observable and safe.` },
        { id: 'c', text: `Spawn goroutines without cancellation and trust process restarts.` },
        { id: 'd', text: `Use shared globals to avoid passing dependencies.` },
      ];
    case 'python':
      return [
        { id: 'a', text: `Catch broad exceptions and continue silently on failures.` },
        { id: 'b', text: `Handle ${topic} with explicit exceptions and deterministic resource cleanup.` },
        { id: 'c', text: `Mutate default function arguments for lightweight caching.` },
        { id: 'd', text: `Rely on implicit truthiness for all data validation.` },
      ];
    case 'rust':
      return [
        { id: 'a', text: `Clone aggressively to bypass borrow checker decisions.` },
        { id: 'b', text: `Design ownership flow explicitly and return Result/Option for ${topic}.` },
        { id: 'c', text: `Use unwrap everywhere in request-handling paths.` },
        { id: 'd', text: `Hide lifetimes behind static references to simplify signatures.` },
      ];
    case 'system':
      return [
        { id: 'a', text: `Scale writes first and postpone consistency strategy until incidents.` },
        { id: 'b', text: `Define SLIs/SLOs and failure boundaries before implementing ${topic}.` },
        { id: 'c', text: `Use one global queue for every workload to simplify ops.` },
        { id: 'd', text: `Treat retries as idempotent without request keys.` },
      ];
    case 'dotnet':
      return [
        { id: 'a', text: `Block on .Result in request pipeline code to simplify async flows.` },
        { id: 'b', text: `Flow CancellationToken and explicit nullability contracts for ${topic}.` },
        { id: 'c', text: `Register all services as singleton to reduce allocations.` },
        { id: 'd', text: `Materialize every LINQ query immediately as a default rule.` },
      ];
    default:
      return [
        { id: 'a', text: `Optimize quickly and postpone correctness checks.` },
        { id: 'b', text: `Prefer explicit, testable behavior with clear boundaries around ${topic}.` },
        { id: 'c', text: `Rely on hidden side effects to reduce boilerplate.` },
        { id: 'd', text: `Treat edge cases as out-of-scope for production paths.` },
      ];
  }
}

function createDomainSnippet(pack: QuizPack, ordinal: number): Snippet {
  const track = getAutoTrack(pack);
  const topics = TRACK_TOPICS[track];
  const topic = topics[(ordinal - 1) % topics.length];
  const scenarios = [
    'a payment retry flow',
    'a production incident postmortem',
    'a high-traffic API release',
    'a cache invalidation bug',
    'a race condition reported by users',
    'an onboarding feature rollout',
    'a background worker backlog',
    'a mobile latency regression',
  ];
  const scenario = scenarios[(ordinal - 1) % scenarios.length];
  const question = `${pack.title}: In ${scenario}, what is the best approach for ${topic}?`;

  return {
    id: `${pack.id}-auto-${ordinal}`,
    question,
    code: makeCodeExample(track, pack, ordinal, topic),
    answers: getRealWorldAnswers(track, topic),
    correctAnswerId: 'b',
    explanation:
      `In real systems, ${topic} should be implemented with explicit contracts, observability, and safe failure handling so behavior remains predictable under load.`,
  };
}

function ensurePackHasMinimumSnippets(pack: QuizPack): QuizPack {
  if (pack.snippets.length >= MIN_SNIPPETS_PER_PACK) return pack;

  const ids = new Set(pack.snippets.map((snippet) => snippet.id));
  const snippets = [...pack.snippets];
  let ordinal = 1;

  while (snippets.length < MIN_SNIPPETS_PER_PACK) {
    const candidateId = `${pack.id}-auto-${ordinal}`;
    if (!ids.has(candidateId)) {
      const snippet = createDomainSnippet(pack, ordinal);
      snippets.push(snippet);
      ids.add(candidateId);
    }
    ordinal += 1;
  }

  return {
    ...pack,
    snippets,
  };
}

export const quizPacks: QuizPack[] = baseQuizPacks.map(ensurePackHasMinimumSnippets);

export const dailyChallenge: DailyChallenge = {
  id: 'daily-memory-leak',
  title: 'Fix the Memory Leak',
  packId: 'concurrency',
  snippetId: 'concurrency-1',
};

/** Resolve a snippet by id and its pack. For use in quiz/[id] and elsewhere. */
export function getSnippetWithPackById(snippetId: string): { snippet: Snippet; pack: QuizPack } | null {
  for (const pack of quizPacks) {
    const snippet = pack.snippets.find((s) => s.id === snippetId);
    if (snippet) return { snippet, pack };
  }
  return null;
}

/** All snippets flattened for fallback / general pick */
export function getAllSnippets(): { snippet: Snippet; pack: QuizPack }[] {
  return quizPacks.flatMap((pack) =>
    pack.snippets.map((snippet) => ({ snippet, pack }))
  );
}

export const topicMastery: TopicMasteryItem[] = [
  { name: 'Python', mastered: true },
  { name: 'C++', mastered: true },
  { name: 'JavaScript', mastered: false },
  { name: 'Java', mastered: false },
];

export const initialRank: RankInfo = {
  level: 1,
  name: 'Script Kiddie',
  description:
    'You have a basic understanding of programming concepts but lack practical experience. Focus on completing beginner-friendly challenges and building small projects to gain hands-on experience.',
  progress: 0,
  xp: 0,
  xpForNextRank: 100,
};

