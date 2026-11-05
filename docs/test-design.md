# Test Design Guide

How this suite is built and the rules for adding to it. Read this before writing a test.

## 1. Layers (what goes where)
| Layer | Folder | Contains | Must not contain |
|---|---|---|---|
| Tests | `tests/*.spec.ts` | What the shop must do, in plain steps, and the assertions | Selectors, URLs typed by hand, waits |
| Page objects | `pages/` | The locators and actions of one screen; `expectSomething()` methods that wrap assertions about that screen | Test decisions ("this price is right") |
| Component | `pages/components/HeaderMenu.ts` | The header and side menu, written once and used by every page | |
| Fixtures | `fixtures/index.ts` | Page objects on demand, the saved login, `shopWithCart(...)`, `completeOrder(...)` | |
| Data | `data/` | Users, the expected catalogue, form data, the product ids the shop uses | |

A change in the shop's markup should mean one change in a page object, and no change in any test.

## 2. Naming and tags
Every test title has this shape:

```
[TC-034] Reset App State puts the product button back to "Add to cart" [BUG-003] @known-bug
 ^^^^^^   ^ what must be true                                          ^^^^^^^^   ^^^^^^^^^^
 manual    (a sentence, not a method name)                              defect     tags
 case
```

- **`[TC-nnn]`** links the test to a case in the manual suite. `npm run trace` reads these and writes [traceability.md](traceability.md). CI fails if that file is out of date, so the link can never silently rot.
- **`[BUG-nnn]`** links a known-defect test to its defect report in the manual project.
- **Tags** choose what to run: `@smoke` (quick, run on every change), `@regression`, `@a11y`, `@security`, `@keyboard`, `@navigation`, `@known-bug`.
- A test with no manual case simply has no `[TC-]` prefix (extra automated coverage is welcome).

## 3. Known-defect tests (`@known-bug`)
When the manual project finds a real defect, the automated suite records it as a test that states the **correct** behaviour and is marked `test.fail(true, 'BUG-nnn: ...')`:

- While the defect exists the assertion fails, which Playwright reports as an **expected** failure, so CI stays green.
- When someone fixes the defect, the test starts to pass, and Playwright reports "expected to fail, but passed". That is the signal to remove the `test.fail` line; the test then becomes a normal regression test.
- A new failure anywhere else turns CI red.

Never mark a test `test.fail` just to hide a flaky test. If you do not know why it fails, find out first.

## 4. Writing reliable tests
- **Wait for something you can see, not for time.** No `waitForTimeout`. Wait for a locator, a URL or a response. If the page changes a moment after an action, assert on the final state (`expect(...).toHaveText`) and let Playwright retry.
- **The address changes before the page is drawn.** A test that checks the URL and then reads the page can read the old page. Wait for an element that exists only on the new page (see `ProductDetailPage.expectProduct`).
- **To prove something does NOT happen**, wait a short fixed window for the wrong thing instead of asserting instantly (see the empty-cart test in `checkout.spec.ts`).
- **Expected values come from the test or the data, not from the page.** The totals test adds up prices and the 8% tax itself.
- **Set up fast, test slow.** Use `shopWithCart(...)` (writes the cart into the browser's storage) when the cart is only the starting point. Click through the UI when the click is what is being tested.
- **Each test is independent.** A new browser context per test, no shared state, any order.
- **One reason to fail.** A test checks one behaviour. Loops over data create separate tests, each with its own title.

## 5. Adding a test: checklist
1. Is there a manual case? Put its `[TC-nnn]` in the title. Is it a known defect? Add `[BUG-nnn]`, `@known-bug` and `test.fail(...)`.
2. Does a page object method already do the action? Reuse it. If not, add the method to the page object, not to the test.
3. Does it need a new locator? Prefer `getByTestId` (the shop's `data-test` attributes), then role or text; avoid long CSS paths.
4. Run `npm run lint` (zero warnings are allowed) and `npm run typecheck`.
5. Run it three times: `npx playwright test -g "your test" --repeat-each=3`.
6. Run `npm run trace` and commit the updated `docs/traceability.md`.

## 6. What the suite deliberately does not do
- **Visual (screenshot) comparison.** Screenshots differ between operating systems and font rendering, so baselines made on one machine fail on another. The one manual case that needs it (TC-058) stays manual. Layout is checked through measurable facts instead (no horizontal scroll, elements visible).
- **Replace a manual screen-reader check.** Automated scans and keyboard tests catch many accessibility problems but not all, as the cart keyboard defect (BUG-020) showed.
- **Test the shop's server.** It has none worth testing: it is a static practice site.
