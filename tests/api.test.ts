import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:3000';

describe('GTD Micro-SaaS Server API Automated Test Suite', () => {

  // ============================================================================
  // 1. Health & Server Basic Availability
  // ============================================================================
  test('GET / returns HTTP 200 with HTML entrypoint', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.match(text, /<!doctype html>/i);
  });

  // ============================================================================
  // 2. /api/parse-inbox Endpoint
  // ============================================================================
  describe('POST /api/parse-inbox', () => {
    test('Happy path: parses compound brain dump into structured tasks', async () => {
      const res = await fetch(`${BASE_URL}/api/parse-inbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Need to call electrician Bob about the panel, buy air filter at Target, and finish tax return'
        })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data.tasks), 'Expected tasks to be an array');
      assert.ok(data.tasks.length >= 2, `Expected at least 2 extracted tasks, got ${data.tasks.length}`);

      // Verify task schema properties
      const first = data.tasks[0];
      assert.ok(first.id, 'Task must have an id');
      assert.ok(first.title, 'Task must have a title');
      assert.ok(first.next_physical_action, 'Task must have a next_physical_action');
      assert.ok(first.context_tag, 'Task must have a context_tag');
      assert.match(first.context_tag, /^@(Phone|Computer|Errands|Office|Home|Anywhere)$/, 'Context tag must be valid GTD tag');
      assert.equal(typeof first.is_under_two_minutes, 'boolean', 'is_under_two_minutes must be boolean');
      assert.equal(typeof first.duration_minutes, 'number', 'duration_minutes must be number');
    });

    test('Edge Case: handles single short task', async () => {
      const res = await fetch(`${BASE_URL}/api/parse-inbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'buy organic bananas' })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data.tasks));
      assert.ok(data.tasks.length >= 1);
    });

    test('Invalid Input: rejects empty string with HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/parse-inbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '   ' })
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.ok(data.error);
    });

    test('Invalid Input: rejects missing text field with HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/parse-inbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      assert.equal(res.status, 400);
    });

    test('Boundary: handles very long brain dump without crashing', async () => {
      const longText = 'Call client for feedback, update documentation, review database indexes, buy coffee beans, clean garage, pay electricity bill, schedule dentist appointment, renew car insurance, draft quarterly report. '.repeat(10);

      const res = await fetch(`${BASE_URL}/api/parse-inbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: longText })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data.tasks));
    });
  });

  // ============================================================================
  // 3. /api/search-grounding Endpoint
  // ============================================================================
  describe('POST /api/search-grounding', () => {
    test('Happy path: returns answer and web sources', async () => {
      const res = await fetch(`${BASE_URL}/api/search-grounding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'renew passport requirements 2026',
          taskTitle: 'Renew US Passport'
        })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.answer, 'Must return answer string');
      assert.ok(Array.isArray(data.sources), 'Must return sources array');
    });

    test('Edge Case: handles empty query gracefully with fallback defaults', async () => {
      const res = await fetch(`${BASE_URL}/api/search-grounding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.answer);
    });
  });

  // ============================================================================
  // 4. /api/maps-grounding Endpoint
  // ============================================================================
  describe('POST /api/maps-grounding', () => {
    test('Happy path: returns recommendations and places list', async () => {
      const res = await fetch(`${BASE_URL}/api/maps-grounding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationQuery: 'hardware store and post office',
          errandType: 'drop off package and buy tools'
        })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.recommendation, 'Must return recommendation');
      assert.ok(Array.isArray(data.places), 'Must return places array');
      if (data.places.length > 0) {
        assert.ok(data.places[0].name);
        assert.ok(data.places[0].address);
      }
    });
  });

  // ============================================================================
  // 5. /api/generate-music Endpoint
  // ============================================================================
  describe('POST /api/generate-music', () => {
    test('Generates focus soundtrack for sprint mode', async () => {
      const res = await fetch(`${BASE_URL}/api/generate-music`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focusType: 'sprint' })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.audioUrl, 'Must return audioUrl');
      assert.ok(data.title, 'Must return title');
    });

    test('Generates focus soundtrack for deep_work mode', async () => {
      const res = await fetch(`${BASE_URL}/api/generate-music`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focusType: 'deep_work' })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.audioUrl);
    });
  });

  // ============================================================================
  // 6. /api/chat-coach Endpoint
  // ============================================================================
  describe('POST /api/chat-coach', () => {
    test('Happy path: returns thoughtful GTD coaching reply', async () => {
      const res = await fetch(`${BASE_URL}/api/chat-coach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'I am overwhelmed with 30 unorganized items in my inbox.' }
          ],
          modelTier: 'fast'
        })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.reply, 'Must return reply');
      assert.equal(typeof data.reply, 'string');
    });

    test('Invalid Input: rejects missing messages array with HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/chat-coach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      assert.equal(res.status, 400);
    });
  });

  // ============================================================================
  // 7. /api/brainstorm-project Endpoint
  // ============================================================================
  describe('POST /api/brainstorm-project', () => {
    test('Happy path: generates mind-map and tier 1 actions', async () => {
      const res = await fetch(`${BASE_URL}/api/brainstorm-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: 'Launch GTD Micro-SaaS on Product Hunt',
          context: 'Budget $500, launch in 3 weeks'
        })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.project, 'Must return project object');
      assert.ok(data.project.wild_success_vision, 'Must have wild_success_vision');
      assert.ok(Array.isArray(data.project.mind_map_nodes), 'Must have mind_map_nodes');
      assert.ok(Array.isArray(data.project.tier_1_actions), 'Must have tier_1_actions');
    });

    test('Invalid Input: rejects empty goal with HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/brainstorm-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      assert.equal(res.status, 400);
    });
  });

  // ============================================================================
  // 8. /api/transcribe-audio Endpoint
  // ============================================================================
  describe('POST /api/transcribe-audio', () => {
    test('Happy path: returns transcript for audio base64', async () => {
      const res = await fetch(`${BASE_URL}/api/transcribe-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
          mimeType: 'audio/wav'
        })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(typeof data.transcript === 'string');
    });

    test('Invalid Input: rejects missing audioBase64 with HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/transcribe-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      assert.equal(res.status, 400);
    });
  });

  // ============================================================================
  // 9. /api/generate-image & /api/generate-video Endpoints
  // ============================================================================
  describe('POST /api/generate-image & /api/generate-video', () => {
    test('Generates project milestone visual anchor image', async () => {
      const res = await fetch(`${BASE_URL}/api/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalTitle: 'Company Retreat Lake Tahoe' })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.imageUrl, 'Must return imageUrl');
    });

    test('Generates outcome celebration video', async () => {
      const res = await fetch(`${BASE_URL}/api/generate-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Serene sunrise over mountain cabin retreat', aspectRatio: '16:9' })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.videoUrl, 'Must return videoUrl');
    });
  });
});
