import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from './App';

test('renders the accessible swap form in its initial loading state', () => {
  const html = renderToStaticMarkup(<App />);
  expect(html).toContain('Loading reference prices…');
  expect(html).toContain('<fieldset id="swap-fields" disabled="">');
  expect(html).toContain('<legend class="sr-only">Swap details</legend>');
  expect(html).toContain('aria-describedby="amount-error"');
  expect(html).toContain('Reverse token direction');
  expect(html).toContain('No funds will move.');
  expect(html).not.toContain('aria-invalid="true"');
  expect(html).not.toContain('src="https://raw.githubusercontent.com');
});
