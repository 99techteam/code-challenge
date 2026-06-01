import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Task from '../../components/Task'
import { t } from '../../lib/i18n'
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './solutions'
import solutionPreview from './problem1_solution.png'

type FormValues = {
  n: string
  method: 'a' | 'b' | 'c'
}

type Result = {
  n: number
  value: number
  method: 'a' | 'b' | 'c'
}

const METHODS = [
  {
    id: 'a' as const,
    label: 'A — Gaussian formula',
    description: 'Closed-form: n × (n + 1) / 2',
    complexity: 'O(1)',
    fn: sum_to_n_a,
    path: 'src/problems/problem1/solutions.ts',
    line: 2,
  },
  {
    id: 'b' as const,
    label: 'B — Iterative loop',
    description: 'Accumulates with a for-loop from 1 to n',
    complexity: 'O(n)',
    fn: sum_to_n_b,
    path: 'src/problems/problem1/solutions.ts',
    line: 8,
  },
  {
    id: 'c' as const,
    label: 'C — Recursion',
    description: 'Reduces: sum(n) = n + sum(n − 1)',
    complexity: 'O(n)',
    fn: sum_to_n_c,
    path: 'src/problems/problem1/solutions.ts',
    line: 17,
  },
]

export default function Problem1() {
  const [result, setResult] = useState<Result | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit = (data: FormValues) => {
    const n = Number(data.n)
    const method = METHODS.find((m) => m.id === data.method)!
    setResult({ n, value: method.fn(n), method: data.method })
  }

  const onReset = () => {
    reset()
    setResult(null)
  }

  const resultMethod = result ? METHODS.find((m) => m.id === result.method)! : null

  return (
    <div className="problem-content">
      <Task title="Problem 1 — Sum to N">
        <p>Provide 3 unique implementations of the following function in JavaScript.</p>
        <p>Input: n - any integer. Assuming this input will always produce a result lesser than Number.MAX_SAFE_INTEGER.</p>
        <p>Output: return - summation to n, i.e. sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15.</p>
        <pre>
          <code>{`var sum_to_n_a = function(n) { // your code here };
var sum_to_n_b = function(n) { // your code here };
var sum_to_n_c = function(n) { // your code here };`}</code>
        </pre>
      </Task>

      {/* solution preview */}
      <div className="mb-8 max-w-lg">
        <h3 className="m-0 mb-3 text-xs font-bold uppercase tracking-widest text-[var(--text-h)]">
          Solution Preview
        </h3>
        <img
          src={solutionPreview}
          alt="Problem 1 solution code"
          className="w-full rounded-xl border border-[var(--border)]"
        />
      </div>

      <form
        className="flex flex-col gap-6 max-w-lg"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* n input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--text-h)]" htmlFor="n">
            {t('form.n_label')}
          </label>
          <input
            id="n"
            type="number"
            placeholder={t('form.n_placeholder')}
            className={[
              'w-40 px-3 py-2 rounded-lg border bg-[var(--bg)] text-[var(--text-h)] text-sm',
              'transition focus:outline-none focus:ring-2',
              errors.n
                ? 'border-red-500 focus:ring-red-200'
                : 'border-[var(--border)] focus:border-[var(--accent)] focus:ring-[var(--accent-bg)]',
            ].join(' ')}
            {...register('n', {
              required: t('validation.required'),
              validate: {
                integer: (v) =>
                  Number.isInteger(Number(v)) || t('validation.integer'),
                maxSafe: (v) => {
                  const n = Number(v)
                  const res = (n * (n + 1)) / 2
                  return res < Number.MAX_SAFE_INTEGER || t('validation.max_safe')
                },
              },
            })}
          />
          {errors.n && (
            <span className="text-xs text-red-500">{errors.n.message}</span>
          )}
        </div>

        {/* method radio */}
        <fieldset className="flex flex-col gap-1.5 border-0 p-0 m-0">
          <legend className="text-sm font-semibold text-[var(--text-h)] mb-1.5">
            {t('form.method_label')}
          </legend>
          <div className="flex flex-col gap-2">
            {METHODS.map((m) => (
              <label
                key={m.id}
                className={[
                  'grid grid-cols-[auto_1fr_auto] grid-rows-2 items-center gap-x-2.5',
                  'px-3.5 py-3 border rounded-lg cursor-pointer transition',
                  result?.method === m.id
                    ? 'border-[var(--accent)] bg-[var(--accent-bg)]'
                    : 'border-[var(--border)] hover:border-[var(--accent-border)] hover:bg-[var(--accent-bg)]',
                ].join(' ')}
              >
                <input
                  type="radio"
                  value={m.id}
                  className="row-span-2 accent-[var(--accent)] w-4 h-4 cursor-pointer"
                  {...register('method', {
                    required: t('validation.method_required'),
                  })}
                />
                <span className="text-sm font-semibold text-[var(--text-h)]">
                  {m.label}
                </span>
                <span className="row-span-2 self-center text-xs font-bold tracking-wide text-[var(--accent)] bg-[var(--accent-bg)] rounded px-2 py-0.5">
                  {m.complexity}
                </span>
                <span className="text-xs text-[var(--text)]">{m.description}</span>
              </label>
            ))}
          </div>
          {errors.method && (
            <span className="text-xs text-red-500">{errors.method.message}</span>
          )}
        </fieldset>

        {/* actions */}
        <div className="flex gap-2.5">
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold cursor-pointer transition hover:shadow-[0_4px_12px_var(--accent-border)]"
          >
            {t('form.submit')}
          </button>
          <button
            type="button"
            className="px-5 py-2 rounded-lg border border-[var(--border)] text-[var(--text)] text-sm font-semibold cursor-pointer transition hover:bg-[var(--code-bg)]"
            onClick={onReset}
          >
            {t('form.reset')}
          </button>
        </div>
      </form>

      {/* result */}
      {result && resultMethod && (
        <div className="mt-7 p-5 border border-[var(--border)] rounded-xl max-w-lg flex flex-col gap-2.5">
          <h3 className="m-0 text-xs font-bold uppercase tracking-widest text-[var(--text-h)]">
            {t('result.heading')}
          </h3>
          <p className="m-0 font-mono text-xl font-bold text-[var(--accent)]">
            {t('result.expression', { n: result.n, value: result.value })}
          </p>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs text-[var(--text)]">{t('result.reference')}</span>
            <code className="text-xs text-[var(--text-h)]">
              {resultMethod.path}:{resultMethod.line}
            </code>
          </div>
        </div>
      )}
    </div>
  )
}
