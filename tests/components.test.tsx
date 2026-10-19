import './setup';
import test, { describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

import { DynamicTaskSurfacingSimulator } from '../src/components/DynamicTaskSurfacingSimulator';
import { WeeklyReviewModal } from '../src/components/WeeklyReviewModal';
import { GoogleKeepSection } from '../src/components/GoogleKeepSection';
import { GTDTask } from '../src/components/OmnipresentInboxSection';

const MOCK_TASKS: GTDTask[] = [
  {
    id: 'test-1',
    raw_input: 'call accountant',
    title: 'Call Accountant for W2',
    next_physical_action: 'Dial 555-0199',
    context_tag: '@Phone',
    is_under_two_minutes: true,
    duration_minutes: 2,
    energy_level: 'low',
    item_type: 'next_action',
    completed: false
  },
  {
    id: 'test-2',
    raw_input: 'buy motor oil',
    title: 'Buy Mobil 1 Oil',
    next_physical_action: 'Drive to AutoZone on 4th',
    context_tag: '@Errands',
    is_under_two_minutes: false,
    duration_minutes: 25,
    energy_level: 'medium',
    item_type: 'next_action',
    completed: false
  },
  {
    id: 'test-3',
    raw_input: 'write Q4 deck',
    title: 'Write Q4 Deck',
    next_physical_action: 'Open Google Slides template',
    context_tag: '@Computer',
    is_under_two_minutes: false,
    duration_minutes: 50,
    energy_level: 'high',
    item_type: 'next_action',
    completed: false
  }
];

describe('GTD Frontend Component & Interaction Automated Tests', () => {

  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  // ============================================================================
  // Test 1: Dynamic Task Surfacing & Sensor Filter Logic
  // ============================================================================
  test('Surfaces actions and renders 2-minute quick wins', () => {
    let completedTaskId = '';
    render(
      <DynamicTaskSurfacingSimulator
        tasks={MOCK_TASKS}
        onToggleComplete={(id) => { completedTaskId = id; }}
        onAddTask={() => {}}
      />
    );

    assert.ok(screen.getByText('Call Accountant for W2'));
    assert.ok(screen.getByText(/2-Min Win/i));

    const doneButtons = screen.getAllByText('Done');
    assert.ok(doneButtons.length > 0);
    fireEvent.click(doneButtons[0]);
    assert.ok(completedTaskId.length > 0, 'onToggleComplete should be called with task id');
  });

  test('Calendar Crunch Window: when minutes <= 15, strictly hides tasks > 10m', () => {
    render(
      <DynamicTaskSurfacingSimulator
        tasks={MOCK_TASKS}
        onToggleComplete={() => {}}
        onAddTask={() => {}}
      />
    );

    // Initial state is 12 mins (crunch mode active)
    assert.ok(screen.getByText('Call Accountant for W2'));
    // Long tasks hidden
    assert.equal(screen.queryByText('Buy Mobil 1 Oil'), null);
    assert.equal(screen.queryByText('Write Q4 Deck'), null);
    assert.ok(screen.getByText(/Crunch Window: ≤ 10m actions only/i));
  });

  test('Calendar Relaxed Window: when minutes slider > 15, reveals long tasks', () => {
    const { container } = render(
      <DynamicTaskSurfacingSimulator
        tasks={MOCK_TASKS}
        onToggleComplete={() => {}}
        onAddTask={() => {}}
      />
    );

    const slider = container.querySelector('input[type="range"]');
    assert.ok(slider);
    fireEvent.change(slider, { target: { value: '45' } });

    assert.ok(screen.getByText('Buy Mobil 1 Oil'));
    assert.ok(screen.getByText('Write Q4 Deck'));
  });

  test('GPS Geofence: Commercial District boosts @Errands tasks', () => {
    const { container } = render(
      <DynamicTaskSurfacingSimulator
        tasks={MOCK_TASKS}
        onToggleComplete={() => {}}
        onAddTask={() => {}}
      />
    );

    const slider = container.querySelector('input[type="range"]');
    fireEvent.change(slider!, { target: { value: '60' } });

    const commercialBtn = screen.getByText('Commercial');
    fireEvent.click(commercialBtn);

    assert.ok(screen.getByText(/@Errands elevated for commercial district/i));
  });

  // ============================================================================
  // Test 2: Quick Add Task Form
  // ============================================================================
  test('Allows user to quick add next physical action manually', () => {
    let addedTask: GTDTask | null = null;
    render(
      <DynamicTaskSurfacingSimulator
        tasks={MOCK_TASKS}
        onToggleComplete={() => {}}
        onAddTask={(t) => { addedTask = t; }}
      />
    );

    const quickAddBtn = screen.getByText('Quick Add Action');
    fireEvent.click(quickAddBtn);

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Schedule Oil Change' } });
    fireEvent.change(inputs[1], { target: { value: 'Call Valvoline on Main St' } });

    const saveBtn = screen.getByText('Save Action');
    fireEvent.click(saveBtn);

    assert.ok(addedTask, 'Task must be passed to onAddTask');
    assert.equal(addedTask.title, 'Schedule Oil Change');
    assert.equal(addedTask.next_physical_action, 'Call Valvoline on Main St');
  });

  // ============================================================================
  // Test 3: The System Purge (Weekly Review Modal)
  // ============================================================================
  test('Weekly Review locks dashboard and walks through 3 sequential steps', () => {
    let reviewCompleted = false;
    let promotedTitle = '';

    render(
      <WeeklyReviewModal
        isOpen={true}
        onClose={() => {}}
        inboxTasks={MOCK_TASKS}
        onTasksCleared={() => { reviewCompleted = true; }}
        onPromoteItem={(t) => { promotedTitle = t; }}
      />
    );

    // Step 1: Empty Inbox
    assert.ok(screen.getByText(/Empty the Inbox to Zero/i));
    const nextBtn1 = screen.getByText(/Next Maintenance Step/i);
    fireEvent.click(nextBtn1);

    // Step 2: Completed Projects Audit
    assert.ok(screen.getByText(/Check Off & Archive Projects/i));
    const nextBtn2 = screen.getByText(/Next Maintenance Step/i);
    fireEvent.click(nextBtn2);

    // Step 3: Someday / Maybe
    assert.ok(screen.getByText(/Review Someday \/ Maybe & Tickler List/i));

    const promoteBtns = screen.getAllByText('Promote to Active Project');
    assert.ok(promoteBtns.length > 0);
    fireEvent.click(promoteBtns[0]);
    assert.ok(promotedTitle.length > 0, 'Promoted title should be passed up');

    const finishBtn = screen.getByText(/Complete Weekly Purge & Unlock Dashboard/i);
    fireEvent.click(finishBtn);
    assert.ok(reviewCompleted, 'onTasksCleared should be called');
  });

  // ============================================================================
  // Test 4: Google Keep Checklist Generation
  // ============================================================================
  test('Google Keep: formats active tasks into Keep checklist syntax', () => {
    render(
      <GoogleKeepSection
        tasks={MOCK_TASKS}
        onImportKeepNotes={() => {}}
      />
    );

    const pre = screen.getByText(/GTD Next Physical Actions:/i);
    assert.ok(pre.textContent?.includes('[ ] Call Accountant for W2'));
    assert.ok(pre.textContent?.includes('[ ] Buy Mobil 1 Oil'));
  });
});
