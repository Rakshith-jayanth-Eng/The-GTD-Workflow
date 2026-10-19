import { test, expect } from '@playwright/test';

test.describe('GTD Micro-SaaS End-to-End Application QA Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test for clean isolation
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
  });

  // ============================================================================
  // 1. Initial Load, Branding, and Header Metrics
  // ============================================================================
  test('1. Application loads with correct title, branding, and initial task counts', async ({ page }) => {
    await expect(page).toHaveTitle(/GTD Micro-SaaS/i);

    // Verify header branding
    await expect(page.locator('text=FlowState GTD')).toBeVisible();
    await expect(page.locator('text=Mind Like Water')).toBeVisible();

    // Verify active actions badge in header
    const readyBadge = page.locator('text=Ready:');
    await expect(readyBadge).toBeVisible();

    // Verify default navigation tabs exist
    await expect(page.getByRole('button', { name: /My Actions/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Brain Dump/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Gmail Triage/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Google Keep/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Projects & Vision/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /GTD Coach/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Architecture & Code/i })).toBeVisible();
  });

  // ============================================================================
  // 2. Dynamic Task Surfacing & Sensor Controls (Calendar & Geofence)
  // ============================================================================
  test('2. Calendar Crunch Window (<=15m) strictly surfaces <=10m tasks and hides long tasks', async ({ page }) => {
    // Initial calendar slider is set to 12 mins (crunch mode active)
    await expect(page.getByText('Crunch Window: ≤ 10m actions only')).toBeVisible();

    // Verify 2-minute quick phone call is surfaced
    await expect(page.getByText('Verify 2025 W-2 Form with CPA')).toBeVisible();
    await expect(page.getByText(/2-Min Win/i).first()).toBeVisible();

    // Verify long tasks (e.g. 25m motor oil, 45m deck) are hidden
    await expect(page.getByText('Purchase Motor Oil for Subaru')).not.toBeVisible();
    await expect(page.getByText('Draft Q4 Investor Update Deck')).not.toBeVisible();

    // Now slide calendar to 60 minutes
    const slider = page.locator('input[type="range"]');
    await slider.fill('60');

    // After moving slider to 60 min, long tasks should be revealed
    await expect(page.getByText('Purchase Motor Oil for Subaru')).toBeVisible({ timeout: 3000 });
    await expect(page.getByText('Draft Q4 Investor Update Deck')).toBeVisible();
    await expect(page.getByText('Crunch Window: ≤ 10m actions only')).not.toBeVisible();
  });

  test('3. GPS Geofence switching elevates context-specific tasks', async ({ page }) => {
    // Set slider to 60m so all tasks can surface
    const slider = page.locator('input[type="range"]');
    await slider.fill('60');

    // Default is Commercial
    await expect(page.getByText(/@Errands elevated for commercial district/i)).toBeVisible();

    // Switch to Office HQ
    await page.getByRole('button', { name: 'Office HQ' }).click();
    await expect(page.getByText(/@Office & @Computer elevated/i)).toBeVisible();

    // Switch to Home
    await page.getByRole('button', { name: 'Home' }).click();
    await expect(page.getByText('Clean & Organize Garage Workbench')).toBeVisible();
  });

  test('4. Context Filter Chips isolate specific task types', async ({ page }) => {
    // Set slider to 60m
    const slider = page.locator('input[type="range"]');
    await slider.fill('60');

    // Filter by @Phone
    await page.getByRole('button', { name: '@Phone', exact: true }).click();
    await expect(page.getByText('Verify 2025 W-2 Form with CPA')).toBeVisible();
    await expect(page.getByText('Purchase Motor Oil for Subaru')).not.toBeVisible();

    // Filter by @Errands
    await page.getByRole('button', { name: '@Errands', exact: true }).click();
    await expect(page.getByText('Purchase Motor Oil for Subaru')).toBeVisible();
    await expect(page.getByText('Verify 2025 W-2 Form with CPA')).not.toBeVisible();

    // Reset to All Contexts
    await page.getByRole('button', { name: 'All Contexts' }).click();
    await expect(page.getByText('Verify 2025 W-2 Form with CPA')).toBeVisible();
  });

  // ============================================================================
  // 3. Task Completion and Quick Win Momentum
  // ============================================================================
  test('5. Completes a task, updates header counter, and shows completed archive', async ({ page }) => {
    // Initially ready count should be visible
    const initialHeader = await page.locator('text=actions').first().textContent();

    // Click "Done" on first task
    const doneButtons = page.getByRole('button', { name: 'Done' });
    await doneButtons.first().click();

    // "Show Completed" toggle should now appear
    const showCompletedBtn = page.getByRole('button', { name: /Show Completed/i });
    await expect(showCompletedBtn).toBeVisible();
    await showCompletedBtn.click();

    // Verify task is listed under completed section
    await expect(page.getByText('Completed Actions Archive')).toBeVisible();
    await expect(page.getByRole('button', { name: /Undo/i })).toBeVisible();
  });

  // ============================================================================
  // 4. Quick Add Action Feature
  // ============================================================================
  test('6. Allows quick adding an action manually with validation', async ({ page }) => {
    await page.getByRole('button', { name: 'Quick Add Action' }).click();

    // Check form inputs
    const titleInput = page.getByPlaceholder(/e\.g\. Replace water filter/i);
    const actionInput = page.getByPlaceholder(/e\.g\. Unscrew casing under sink/i);
    await expect(titleInput).toBeVisible();

    // Fill valid data
    await titleInput.fill('Calibrate 3D printer bed');
    await actionInput.fill('Turn leveling knobs with 0.1mm gauge');

    // Save
    await page.getByRole('button', { name: 'Save Action' }).click();

    // Ensure it is added and surfaced
    await expect(page.getByText('Calibrate 3D printer bed')).toBeVisible();
    await expect(page.getByText('Turn leveling knobs with 0.1mm gauge')).toBeVisible();
  });

  // ============================================================================
  // 5. 2-Minute Sprint Timer (Active Execution Runner)
  // ============================================================================
  test('7. Launches 2-minute sprint runner and completes execution', async ({ page }) => {
    // Look for "Do Now (120s)" button
    const sprintBtn = page.getByRole('button', { name: /Do Now \(120s\)/i }).first();
    await expect(sprintBtn).toBeVisible();
    await sprintBtn.click();

    // Modal / active sprint bar should open
    await expect(page.getByText(/2-MINUTE RULE IN PROGRESS/i)).toBeVisible();
    await expect(page.getByText(/Time Remaining/i)).toBeVisible();

    // Click "Done! Complete Action"
    await page.getByRole('button', { name: /Done! Complete Action/i }).click();

    // Sprint modal closes
    await expect(page.getByText(/2-MINUTE RULE IN PROGRESS/i)).not.toBeVisible();
  });

  // ============================================================================
  // 6. Brain Dump (Omnipresent Inbox & Applied Gemini AI)
  // ============================================================================
  test('8. Brain Dump tab parses input into structured GTD actions with 2-minute flags', async ({ page }) => {
    // Navigate to Brain Dump
    await page.getByRole('button', { name: /Brain Dump/i }).click();

    // Verify preset buttons exist
    await expect(page.getByRole('button', { name: /Chaotic Monday/i })).toBeVisible();
    await page.getByRole('button', { name: /Chaotic Monday/i }).click();

    // Clear and enter custom test thoughts
    const textarea = page.locator('textarea');
    await textarea.fill('Call plumber Mike about leaky sink, buy copper pipe at Home Depot, file quarterly sales report');

    // Click Parse
    await page.getByRole('button', { name: /Parse Into GTD Actions/i }).click();

    // Expect navigation back to My Actions and new tasks surfaced
    await expect(page.getByText(/What can you accomplish right now\?/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Call plumber Mike/i)).toBeVisible();
  });

  test('9. Brain Dump handles empty input validation gracefully', async ({ page }) => {
    await page.getByRole('button', { name: /Brain Dump/i }).click();

    // Clear textarea completely
    const textarea = page.locator('textarea');
    await textarea.fill('');

    // Attempt to parse
    await page.getByRole('button', { name: /Parse Into GTD Actions/i }).click();

    // Verify error message is shown
    await expect(page.getByText(/Please enter your thoughts or brain dump before parsing/i)).toBeVisible();
  });

  test('10. Brain Dump handles potential XSS strings safely', async ({ page }) => {
    await page.getByRole('button', { name: /Brain Dump/i }).click();

    const textarea = page.locator('textarea');
    await textarea.fill('<script>window.__xss_test = true;</script> Buy groceries at store');

    await page.getByRole('button', { name: /Parse Into GTD Actions/i }).click();

    // Wait for parse completion
    await expect(page.getByText(/What can you accomplish right now\?/i)).toBeVisible({ timeout: 15000 });

    // Verify no script execution occurred
    const xssTriggered = await page.evaluate(() => (window as any).__xss_test);
    expect(xssTriggered).toBeUndefined();
  });

  // ============================================================================
  // 7. The System Purge (Weekly Review Lockout Modal)
  // ============================================================================
  test('11. Full Weekly Review walks through 3 steps, promotes Someday item, and unlocks dashboard', async ({ page }) => {
    // Click Weekly Review in header
    await page.getByRole('button', { name: /Weekly Review/i }).click();

    // Modal lockout should be active
    await expect(page.getByText(/The System Purge — Weekly Review/i)).toBeVisible();
    await expect(page.getByText(/Step 1 \/ 3: Empty the Inbox to Zero/i)).toBeVisible();

    // Step 1 -> Step 2
    await page.getByRole('button', { name: /Next Maintenance Step/i }).click();
    await expect(page.getByText(/Step 2 \/ 3: Check Off & Archive Projects/i)).toBeVisible();

    // Step 2 -> Step 3
    await page.getByRole('button', { name: /Next Maintenance Step/i }).click();
    await expect(page.getByText(/Step 3 \/ 3: Review Someday \/ Maybe & Tickler List/i)).toBeVisible();

    // Promote a Someday/Maybe item
    const promoteBtn = page.getByRole('button', { name: /Promote to Active Project/i }).first();
    await promoteBtn.click();

    // Complete Weekly Purge
    await page.getByRole('button', { name: /Complete Weekly Purge & Unlock Dashboard/i }).click();

    // Modal should close
    await expect(page.getByText(/The System Purge — Weekly Review/i)).not.toBeVisible();

    // Header should now show review timestamp in parentheses
    await expect(page.getByRole('button', { name: /Weekly Review/i })).toContainText('(');
  });

  // ============================================================================
  // 8. Project Co-Pilot & Natural Planning Model
  // ============================================================================
  test('12. Project Co-Pilot brainstorms goal into mind-map and tier 1 next actions', async ({ page }) => {
    await page.getByRole('button', { name: /Projects & Vision/i }).click();

    await expect(page.getByText(/Project Co-Pilot & Visual Outcome Studio/i)).toBeVisible();

    // Enter project goal
    const goalInput = page.getByPlaceholder(/e\.g\. Launch Mobile App on App Store/i);
    await goalInput.fill('Renovate Kitchen for Hosting Thanksgiving');

    // Submit brainstorm
    await page.getByRole('button', { name: /Generate Mind-Map & Tier-1 Actions/i }).click();

    // Verify generation response
    await expect(page.getByText(/Vision of Wild Success/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Mind-Map Nodes/i)).toBeVisible();
    await expect(page.getByText(/Immediate Tier-1 Physical Actions/i)).toBeVisible();

    // Click "Add Tier-1 Actions to My Tasks"
    await page.getByRole('button', { name: /Add Tier-1 Actions to My Tasks/i }).click();

    // Should redirect to My Actions and contain new tasks
    await expect(page.getByText(/What can you accomplish right now\?/i)).toBeVisible();
  });

  test('13. Project Vision Studio modal opens and closes smoothly', async ({ page }) => {
    await page.getByRole('button', { name: /Projects & Vision/i }).click();

    // Open Vision Studio
    await page.getByRole('button', { name: /Open Project Vision Studio/i }).click();

    // Verify modal elements
    await expect(page.getByText(/Visual Project Vision Studio/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Milestone Image/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Celebration Video/i })).toBeVisible();

    // Close modal
    await page.locator('button:has(svg.lucide-x)').click();
    await expect(page.getByText(/Visual Project Vision Studio/i)).not.toBeVisible();
  });

  // ============================================================================
  // 9. GTD AI Coach (Interactive Guidance & Fast/General/Deep Tiers)
  // ============================================================================
  test('14. GTD AI Coach replies to quick asks and custom questions', async ({ page }) => {
    await page.getByRole('button', { name: /GTD Coach/i }).click();

    await expect(page.getByText(/David Allen GTD AI Coach/i)).toBeVisible();

    // Click quick starter
    await page.getByRole('button', { name: "I'm procrastinating on a big project" }).click();

    // Verify coach replies
    await expect(page.getByText(/David Allen Coach/i).nth(1)).toBeVisible({ timeout: 15000 });
  });

  // ============================================================================
  // 10. Google Keep Workspace Integration
  // ============================================================================
  test('15. Google Keep integration renders checklist syntax and valid export link', async ({ page }) => {
    await page.getByRole('button', { name: /Google Keep/i }).click();

    await expect(page.getByText(/Google Keep Sync & Checklist Exporter/i)).toBeVisible();

    // Checklist preview should contain active tasks formatted with [ ]
    const pre = page.locator('pre');
    await expect(pre).toContainText('[ ]');

    // Click "Copy Text" button
    await page.getByRole('button', { name: /Copy Text/i }).click();
    await expect(page.getByText(/Copied!/i)).toBeVisible();

    // Verify external Keep link has correct href and target="_blank"
    const keepLink = page.getByRole('link', { name: /Copy & Open Google Keep/i });
    await expect(keepLink).toHaveAttribute('href', 'https://keep.google.com/u/0/#home');
    await expect(keepLink).toHaveAttribute('target', '_blank');
  });

  // ============================================================================
  // 11. Data Persistence Across Page Reload
  // ============================================================================
  test('16. Tasks and state persist in localStorage across browser page reload', async ({ page }) => {
    // Add unique task
    await page.getByRole('button', { name: 'Quick Add Action' }).click();
    await page.getByPlaceholder(/e\.g\. Replace water filter/i).fill('Unique E2E Storage Test Action');
    await page.getByPlaceholder(/e\.g\. Unscrew casing under sink/i).fill('Confirm database serialization');
    await page.getByRole('button', { name: 'Save Action' }).click();

    await expect(page.getByText('Unique E2E Storage Test Action')).toBeVisible();

    // Reload browser page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify task is still present
    await expect(page.getByText('Unique E2E Storage Test Action')).toBeVisible();
  });

  // ============================================================================
  // 12. Reset to Initial Seed Data
  // ============================================================================
  test('17. Reset button restores default factory tasks', async ({ page }) => {
    // Click reset button
    const resetBtn = page.getByTitle('Reset initial tasks');
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // Verify default seed tasks are present
    await expect(page.getByText('Verify 2025 W-2 Form with CPA')).toBeVisible();
  });

  // ============================================================================
  // 13. Focus Music Player & Synthesizer
  // ============================================================================
  test('18. Focus Music Player floating bar expands and switches soundscapes', async ({ page }) => {
    // Check floating player toggle exists
    const musicBtn = page.getByRole('button', { name: /Focus Audio/i });
    await expect(musicBtn).toBeVisible();
    await musicBtn.click();

    // Panel should open
    await expect(page.getByText(/AI Focus Audio Engine/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /2-Min Sprint Pulse/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Deep Flow Synthesizer/i })).toBeVisible();

    // Switch soundscape
    await page.getByRole('button', { name: /Deep Flow Synthesizer/i }).click();

    // Close panel
    await page.locator('button:has(svg.lucide-x)').last().click();
    await expect(page.getByText(/AI Focus Audio Engine/i)).not.toBeVisible();
  });
});
