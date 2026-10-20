import type { MDXComponents } from "mdx/types";

// MDX styles document prose only. Live UI examples always use SpecView.
const components: MDXComponents = {
  h1: (props) => (
    <h1
      className="mb-6 text-4xl font-semibold tracking-tight sm:text-5xl"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="mb-4 mt-12 text-2xl font-semibold tracking-tight"
      {...props}
    />
  ),
  h3: (props) => <h3 className="mb-3 mt-8 text-xl font-semibold" {...props} />,
  p: (props) => <p className="my-4 leading-8 text-ink/80" {...props} />,
  a: (props) => (
    <a
      className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-4"
      {...props}
    />
  ),
  ul: (props) => (
    <ul className="my-4 list-disc space-y-2 pl-6 leading-7" {...props} />
  ),
  ol: (props) => (
    <ol className="my-4 list-decimal space-y-2 pl-6 leading-7" {...props} />
  ),
  pre: (props) => (
    <pre
      className="my-6 overflow-x-auto rounded-2xl bg-ink p-5 text-sm leading-7 text-white"
      {...props}
    />
  ),
  code: (props) => <code className="font-mono text-[0.9em]" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="my-6 border-l-4 border-signal pl-5 text-ink/70"
      {...props}
    />
  ),
};
export function useMDXComponents(): MDXComponents {
  return components;
}
