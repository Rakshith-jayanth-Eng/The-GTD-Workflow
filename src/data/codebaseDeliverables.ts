/**
 * Production-ready Codebase Deliverables and Architecture Specs
 * for GTD Micro-SaaS (Flutter + FastAPI + Google Gemini API)
 */

export interface CodeFile {
  filename: string;
  language: string;
  description: string;
  content: string;
}

export interface ArchitectureSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  files: CodeFile[];
}

export const FLUTTER_DIRECTORY_TREE = `gtd_flutter_client/
├── pubspec.yaml
├── lib/
│   ├── main.dart
│   ├── core/
│   │   ├── constants/
│   │   │   ├── app_colors.dart
│   │   │   └── gtd_contexts.dart
│   │   ├── network/
│   │   │   ├── api_client.dart
│   │   │   └── api_endpoints.dart
│   │   ├── sensors/
│   │   │   ├── calendar_sensor_service.dart
│   │   │   ├── location_sensor_service.dart
│   │   │   └── context_evaluator.dart
│   │   └── theme/
│   │       └── app_theme.dart
│   ├── models/
│   │   ├── gtd_task.dart
│   │   ├── project_model.dart
│   │   └── context_state.dart
│   └── features/
│       ├── inbox/
│       │   ├── presentation/
│       │   │   ├── omnipresent_inbox_sheet.dart
│       │   │   └── audio_dictation_button.dart
│       │   └── providers/
│       │       └── inbox_provider.dart
│       ├── dynamic_surfacing/
│       │   ├── presentation/
│       │   │   ├── dynamic_task_surfacing_widget.dart
│       │   │   ├── context_chip_bar.dart
│       │   │   └── task_action_card.dart
│       │   └── providers/
│       │       └── surfaced_tasks_provider.dart
│       ├── weekly_review/
│       │   ├── presentation/
│       │   │   ├── weekly_review_lockout_modal.dart
│       │   │   ├── step_empty_inbox.dart
│       │   │   ├── step_completed_projects.dart
│       │   │   └── step_someday_maybe.dart
│       │   └── providers/
│       │       └── weekly_review_state_notifier.dart
│       └── project_copilot/
│           ├── presentation/
│           │   ├── project_brainstorm_sheet.dart
│           │   └── mind_map_graph_widget.dart
│           └── providers/
│               └── project_copilot_provider.dart
└── test/
    ├── dynamic_surfacing_test.dart
    └── weekly_review_test.dart`;

export const PYTHON_FASTAPI_DIRECTORY_TREE = `gtd_backend_fastapi/
├── Dockerfile
├── requirements.txt
├── .env.example
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── security.py
│   │   └── logging.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── inbox.py
│   │   ├── triage.py
│   │   └── project.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── gemini_client.py
│   │   ├── nlp_parser_service.py
│   │   └── project_copilot_service.py
│   └── api/
│       ├── __init__.py
│       ├── router.py
│       └── endpoints/
│           ├── __init__.py
│           ├── inbox.py
│           ├── projects.py
│           └── health.py
└── tests/
    ├── test_inbox_parser.py
    └── test_project_copilot.py`;

export const GEMINI_PROMPTS_AND_SCHEMAS = {
  inboxParser: {
    title: "1. The Omnipresent Inbox & Triage Engine (NLP Parser)",
    systemInstruction: `You are the master Triage and NLP Processing Engine of a production Getting Things Done (GTD) Micro-SaaS application.
Your objective is to ingest chaotic, spoken, or hastily typed user brain dumps and deconstruct them into an array of atomic, rigorously structured GTD tasks.

OPERATIONAL PRINCIPLES:
1. ATOMIC EXTRACTION:
   Break compound or rambling sentences into separate individual tasks. Never combine distinct responsibilities into one task.

2. THE NEXT PHYSICAL ACTION DOCTRINE (David Allen GTD):
   Translate ambiguous or vague input phrases into explicit, physical next actions.
   - Bad: "Car maintenance" -> Good: "Call Joe's Auto Repair at 555-0192 to schedule 50k-mile brake inspection"
   - Bad: "Taxes" -> Good: "Log into Gusto portal and download 2025 Form W-2 PDF"
   - Bad: "Dentist" -> Good: "Open dental clinic booking link to reserve Thursday morning teeth cleaning"

3. 2-MINUTE RULE EVALUATION (is_under_two_minutes):
   - Set is_under_two_minutes = true IF AND ONLY IF the physical next action can realistically be completed by an average human in 120 seconds or less.
   - Quick confirmations, 1-line emails, booking via saved bookmarks, or filing a folder are <= 2 minutes.
   - Drafting proposals, detailed calculations, or multi-step errands are > 2 minutes.

4. CONTEXT-AWARE BUCKETING:
   Assign exactly ONE primary physical context from this canonical enumeration:
   - @Phone: Requires placing or answering a voice call or sending SMS.
   - @Computer: Requires keyboard, screen, browser, code editor, or desktop software.
   - @Errands: Requires leaving the building, driving, shopping, or in-person pickup.
   - @Office: Requires physical presence at the workplace/desk equipment.
   - @Home: Requires being at home (chores, domestic repairs, personal files).
   - @Anywhere: Low friction, can be read or thought through anywhere (e.g. review a 1-page note).

5. DURATION & ENERGY ESTIMATION:
   - duration_minutes: Realistic positive integer in minutes.
   - energy_level: Exactly one of "low", "medium", "high".

6. ITEM TYPE TAXONOMY:
   - next_action: Concrete actionable item.
   - project: Outcome requiring more than 1 distinct physical action.
   - waiting_for: Delegated item pending external response.
   - someday_maybe: Idea or aspirational item to store for weekly review.`,
    pythonSchema: `from typing import List, Literal
from pydantic import BaseModel, Field

class ParsedGTDTask(BaseModel):
    id: str = Field(description="Deterministic or random UUID string for task tracking")
    raw_input: str = Field(description="The source snippet or clause from the user's brain dump")
    title: str = Field(description="Concise, punchy task headline (under 8 words)")
    next_physical_action: str = Field(
        description="The imperative physical action verb phrase describing the immediate next step"
    )
    context_tag: Literal["@Phone", "@Computer", "@Errands", "@Office", "@Home", "@Anywhere"] = Field(
        description="GTD physical context required to complete the action"
    )
    is_under_two_minutes: bool = Field(
        description="True if the task takes <= 120 seconds to execute immediately"
    )
    duration_minutes: int = Field(
        ge=1, le=480, description="Estimated duration in minutes"
    )
    energy_level: Literal["low", "medium", "high"] = Field(
        description="Required mental/physical energy"
    )
    item_type: Literal["next_action", "project", "waiting_for", "someday_maybe"] = Field(
        default="next_action", description="GTD inventory classification"
    )
    clarification_reason: str = Field(
        description="Short 1-sentence architectural explanation of the assigned next action and context"
    )

class ParseInboxResponse(BaseModel):
    tasks: List[ParsedGTDTask] = Field(description="List of extracted and triaged GTD tasks")
    total_parsed: int
    quick_two_minute_count: int`
  },
  projectCopilot: {
    title: "6. Project Co-Pilot (Agentic Brainstorming & Mind-Mapping)",
    systemInstruction: `You are the GTD Project Co-Pilot and Strategic Sounding Board Agent.
Your role is to guide the user through David Allen's Natural Planning Model:
1. Define Purpose, Principles & Wild Success Outcome.
2. Brainstorm component nodes and milestones into a visual dependency mind-map.
3. Identify potential friction risks and mitigations.
4. Extract the immediate Tier-1 Next Physical Actions with physical context tags (@Computer, @Phone, etc.) so the user can immediately build momentum.

FORMAT INSTRUCTIONS:
- You must return valid JSON strictly complying with the provided schema.
- The mind_map_nodes must form a directed acyclic tree where each child references its parent_id.
- The tier_1_actions must be immediately actionable (not dependent on unfinished sub-tasks).`,
    pythonSchema: `from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class MindMapNode(BaseModel):
    id: str = Field(description="Node identifier, e.g. 'node-1', 'node-root'")
    label: str = Field(description="Pillar, milestone, or component name")
    category: Literal["pillar", "milestone", "component"] = Field(description="Architectural tier")
    parent_id: Optional[str] = Field(default=None, description="Parent node ID, or None for root")

class RiskMitigation(BaseModel):
    risk: str = Field(description="Identified potential bottleneck or failure mode")
    mitigation: str = Field(description="Proactive preventive procedure or fallback")

class Tier1Action(BaseModel):
    id: str
    title: str
    next_physical_action: str
    context_tag: Literal["@Phone", "@Computer", "@Errands", "@Office", "@Home", "@Anywhere"]
    is_under_two_minutes: bool
    duration_minutes: int
    dependency_node_id: str = Field(description="Which mind map node this kickstarts")

class BrainstormProjectResponse(BaseModel):
    project_id: str
    goal: str
    wild_success_vision: str = Field(description="Narrative depiction of successful completion")
    critical_success_factors: List[str]
    mind_map_nodes: List[MindMapNode]
    risks_and_mitigations: List[RiskMitigation]
    tier_1_actions: List[Tier1Action]`
  }
};

export const BACKEND_FASTAPI_CODE = `# ==============================================================================
# File: app/api/endpoints/inbox.py
# Production-ready FastAPI router for GTD Omnipresent Inbox (/parse-inbox)
# ==============================================================================
import os
import uuid
from typing import List, Literal, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

router = APIRouter(prefix="/api/v1", tags=["Inbox & Triage"])

# ------------------------------------------------------------------------------
# Pydantic Schemas
# ------------------------------------------------------------------------------
class ParseInboxRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=3,
        max_length=10000,
        description="Raw unstructured text or transcribed audio brain dump",
        examples=["Need to call plumber for kitchen leak, buy oil filter, finish Q3 slide deck, and check taxes"]
    )
    user_timezone: Optional[str] = Field(default="UTC", description="User IANA timezone")

class ParsedGTDTask(BaseModel):
    id: str = Field(default_factory=lambda: f"task_{uuid.uuid4().hex[:8]}")
    raw_input: str
    title: str
    next_physical_action: str
    context_tag: Literal["@Phone", "@Computer", "@Errands", "@Office", "@Home", "@Anywhere"]
    is_under_two_minutes: bool
    duration_minutes: int
    energy_level: Literal["low", "medium", "high"]
    item_type: Literal["next_action", "project", "waiting_for", "someday_maybe"]
    clarification_reason: str

class ParseInboxResponse(BaseModel):
    tasks: List[ParsedGTDTask]
    total_parsed: int
    quick_two_minute_count: int
    processing_engine: str

# ------------------------------------------------------------------------------
# Gemini Client Dependency
# ------------------------------------------------------------------------------
def get_gemini_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY environment variable is not configured."
        )
    return genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(
            headers={"User-Agent": "aistudio-build"}
        )
    )

# ------------------------------------------------------------------------------
# System Prompt & JSON Schema Specification
# ------------------------------------------------------------------------------
INBOX_TRIAGE_SYSTEM_INSTRUCTION = """
You are the master Triage and NLP Processing Engine of a production Getting Things Done (GTD) Micro-SaaS application.
Your objective is to ingest chaotic, spoken, or hastily typed user brain dumps and deconstruct them into an array of atomic, rigorously structured GTD tasks.

STRICT GTD REQUIREMENTS:
1. ATOMIC EXTRACTION: Separate multiple disjoint obligations into independent tasks.
2. NEXT PHYSICAL ACTION: Convert vague ideas to concrete physical steps (e.g. 'Taxes' -> 'Call CPA to verify Form 1099 receipt').
3. 2-MINUTE RULE: Set is_under_two_minutes=true IF and ONLY IF the task takes <= 120 seconds.
4. CONTEXT BUCKETING: Assign exactly one tag: @Phone, @Computer, @Errands, @Office, @Home, @Anywhere.
5. ESTIMATION: Accurate duration_minutes and energy_level (low, medium, high).
"""

# ------------------------------------------------------------------------------
# Endpoint: POST /parse-inbox
# ------------------------------------------------------------------------------
@router.post(
    "/parse-inbox",
    response_model=ParseInboxResponse,
    status_code=status.HTTP_200_OK,
    summary="Parse unstructured brain dump into triaged GTD tasks"
)
async def parse_inbox(
    payload: ParseInboxRequest,
    client: genai.Client = Depends(get_gemini_client)
) -> ParseInboxResponse:
    try:
        # Prompt Google Gemini 2.5/Flash model using official google-genai SDK
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=f"Parse and triage the following brain dump into atomic GTD items:\\n\\n{payload.text}",
            config=types.GenerateContentConfig(
                system_instruction=INBOX_TRIAGE_SYSTEM_INSTRUCTION,
                temperature=0.2,
                response_mime_type="application/json",
                response_schema=List[ParsedGTDTask],
            )
        )

        if not response.text:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Gemini API returned an empty response string."
            )

        # Validate with Pydantic
        import json
        raw_list = json.loads(response.text)
        tasks = [ParsedGTDTask(**item) for item in raw_list]
        two_min_count = sum(1 for t in tasks if t.is_under_two_minutes)

        return ParseInboxResponse(
            tasks=tasks,
            total_parsed=len(tasks),
            quick_two_minute_count=two_min_count,
            processing_engine="gemini-3.8-flash-genai-v2"
        )

    except json.JSONDecodeError as jde:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse structured JSON from Gemini: {str(jde)}"
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Triage Engine processing error: {str(exc)}"
        )
`;

export const FRONTEND_FLUTTER_SURFACING_CODE = `// ==============================================================================
// File: lib/features/dynamic_surfacing/presentation/dynamic_task_surfacing_widget.dart
// Production-ready Flutter widget for context-aware Dynamic Task Surfacing
// Integrated with device Calendar and GPS Geolocation streams
// ==============================================================================

import 'dart:async';
import 'package:flutter/material.dart';

// --- Data Models ---
enum GTDContext { phone, computer, errands, office, home, anywhere }

extension GTDContextExtension on GTDContext {
  String get tag {
    switch (this) {
      case GTDContext.phone:
        return '@Phone';
      case GTDContext.computer:
        return '@Computer';
      case GTDContext.errands:
        return '@Errands';
      case GTDContext.office:
        return '@Office';
      case GTDContext.home:
        return '@Home';
      case GTDContext.anywhere:
        return '@Anywhere';
    }
  }

  IconData get icon {
    switch (this) {
      case GTDContext.phone:
        return Icons.phone_in_talk;
      case GTDContext.computer:
        return Icons.laptop_chromebook;
      case GTDContext.errands:
        return Icons.shopping_bag_outlined;
      case GTDContext.office:
        return Icons.business_outlined;
      case GTDContext.home:
        return Icons.home_outlined;
      case GTDContext.anywhere:
        return Icons.public_outlined;
    }
  }

  Color get color {
    switch (this) {
      case GTDContext.phone:
        return const Color(0xFF10B981); // Emerald
      case GTDContext.computer:
        return const Color(0xFF3B82F6); // Blue
      case GTDContext.errands:
        return const Color(0xFFF59E0B); // Amber
      case GTDContext.office:
        return const Color(0xFF8B5CF6); // Violet
      case GTDContext.home:
        return const Color(0xFFEC4899); // Pink
      case GTDContext.anywhere:
        return const Color(0xFF6B7280); // Gray
    }
  }
}

class SurfacedTask {
  final String id;
  final String title;
  final String nextPhysicalAction;
  final GTDContext context;
  final int durationMinutes;
  final bool isUnderTwoMinutes;
  final String energyLevel;
  bool isCompleted;

  SurfacedTask({
    required this.id,
    required this.title,
    required this.nextPhysicalAction,
    required this.context,
    required this.durationMinutes,
    required this.isUnderTwoMinutes,
    required this.energyLevel,
    this.isCompleted = false,
  });
}

enum GeofenceZone { commercialArea, corporateOffice, homeResidence, inTransit }

class DeviceSensorContext {
  final int? minutesUntilNextMeeting;
  final String? nextMeetingTitle;
  final GeofenceZone currentZone;
  final double latitude;
  final double longitude;

  const DeviceSensorContext({
    this.minutesUntilNextMeeting,
    this.nextMeetingTitle,
    required this.currentZone,
    required this.latitude,
    required this.longitude,
  });
}

// --- Main Widget ---
class DynamicTaskSurfacingWidget extends StatefulWidget {
  final List<SurfacedTask> allTasks;
  final DeviceSensorContext sensorState;
  final Function(SurfacedTask) onTaskCompleted;
  final Function(SurfacedTask) onTwoMinuteActionExecuted;

  const DynamicTaskSurfacingWidget({
    Key? key,
    required this.allTasks,
    required this.sensorState,
    required this.onTaskCompleted,
    required this.onTwoMinuteActionExecuted,
  }) : super(key: key);

  @override
  State<DynamicTaskSurfacingWidget> createState() =>
      _DynamicTaskSurfacingWidgetState();
}

class _DynamicTaskSurfacingWidgetState extends State<DynamicTaskSurfacingWidget> {
  GTDContext? _manualContextFilter;

  /// Dynamic GTD Surfacing Algorithm:
  /// 1. If calendar meeting is < 15 mins away: Strictly filter out any task > 10 mins.
  /// 2. If GPS geofence matches commercial area: Boost @Errands tasks to top.
  /// 3. If GPS matches corporate office: Boost @Office and @Computer.
  /// 4. Rank items with is_under_two_minutes as instant-wins.
  List<SurfacedTask> get _filteredAndRankedTasks {
    List<SurfacedTask> candidates = List.from(widget.allTasks.where((t) => !t.isCompleted));

    // Rule 1: Time Window Hard Constraint
    final minsToMeeting = widget.sensorState.minutesUntilNextMeeting;
    final bool isCrunchWindow = minsToMeeting != null && minsToMeeting <= 15;

    if (isCrunchWindow) {
      // User has a hard deadline looming; only surface tasks that can be finished in available gap
      candidates = candidates.where((task) => task.durationMinutes <= 10).toList();
    }

    // Rule 2: Manual Filter Override if set
    if (_manualContextFilter != null) {
      candidates = candidates.where((t) => t.context == _manualContextFilter).toList();
    }

    // Rule 3: Dynamic Context Prioritization based on native GPS
    candidates.sort((a, b) {
      int scoreA = 0;
      int scoreB = 0;

      // Geofence match scoring
      if (widget.sensorState.currentZone == GeofenceZone.commercialArea) {
        if (a.context == GTDContext.errands) scoreA += 100;
        if (b.context == GTDContext.errands) scoreB += 100;
      } else if (widget.sensorState.currentZone == GeofenceZone.corporateOffice) {
        if (a.context == GTDContext.office) scoreA += 80;
        if (a.context == GTDContext.computer) scoreA += 60;
        if (b.context == GTDContext.office) scoreB += 80;
        if (b.context == GTDContext.computer) scoreB += 60;
      } else if (widget.sensorState.currentZone == GeofenceZone.homeResidence) {
        if (a.context == GTDContext.home) scoreA += 80;
        if (b.context == GTDContext.home) scoreB += 80;
      }

      // 2-minute instant win priority boost during tight time pockets
      if (isCrunchWindow) {
        if (a.isUnderTwoMinutes) scoreA += 50;
        if (b.isUnderTwoMinutes) scoreB += 50;
      }

      // Shorter duration tasks break ties
      scoreA += (60 - a.durationMinutes.clamp(1, 60));
      scoreB += (60 - b.durationMinutes.clamp(1, 60));

      return scoreB.compareTo(scoreA); // Highest score first
    });

    return candidates;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final sensor = widget.sensorState;
    final tasks = _filteredAndRankedTasks;
    final isTimeRestricted = sensor.minutesUntilNextMeeting != null && sensor.minutesUntilNextMeeting! <= 15;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Sensor Status Banner (Calendar + Geofence HUD)
        _buildSensorHud(context, sensor, isTimeRestricted),

        const SizedBox(height: 12),

        // Context Pills for Quick Manual Filtering
        _buildContextFilterBar(),

        const SizedBox(height: 12),

        // Surfaced Task Count & GTD Rules Indicator
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'SURFACED ACTIONS (\${tasks.length})',
                style: theme.textTheme.labelMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.1,
                  color: Colors.grey[700],
                ),
              ),
              if (isTimeRestricted)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.amber[100],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.amber[600]!),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.timer, size: 14, color: Colors.amber[900]),
                      const SizedBox(width: 4),
                      Text(
                        'Filtered: <= 10m actions only',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.amber[900]),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),

        const SizedBox(height: 8),

        // Task Cards List
        Expanded(
          child: tasks.isEmpty
              ? _buildEmptyState(context, isTimeRestricted)
              : ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  itemCount: tasks.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final task = tasks[index];
                    return _buildTaskCard(context, task, index);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildSensorHud(BuildContext context, DeviceSensorContext sensor, bool isTimeRestricted) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isTimeRestricted ? const Color(0xFFFEF3C7) : const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isTimeRestricted ? const Color(0xFFF59E0B) : const Color(0xFFE5E7EB),
          width: 1.5,
        ),
      ),
      child: Row(
        children: [
          // Geofence Badge
          Expanded(
            child: Row(
              children: [
                Icon(
                  sensor.currentZone == GeofenceZone.commercialArea
                      ? Icons.storefront
                      : sensor.currentZone == GeofenceZone.corporateOffice
                          ? Icons.business
                          : Icons.location_on,
                  size: 20,
                  color: const Color(0xFF1E293B),
                ),
                const SizedBox(width: 8),
                Flexible(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'CURRENT GEOFENCE',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey),
                      ),
                      Text(
                        sensor.currentZone == GeofenceZone.commercialArea
                            ? 'Commercial District (@Errands)'
                            : sensor.currentZone == GeofenceZone.corporateOffice
                                ? 'Office HQ (@Computer)'
                                : 'Home Residence',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const VerticalDivider(width: 20, thickness: 1),

          // Calendar Gap Badge
          Expanded(
            child: Row(
              children: [
                Icon(
                  Icons.calendar_today,
                  size: 18,
                  color: isTimeRestricted ? const Color(0xFFB45309) : const Color(0xFF1E293B),
                ),
                const SizedBox(width: 8),
                Flexible(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'NEXT CALENDAR EVENT',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey),
                      ),
                      Text(
                        sensor.minutesUntilNextMeeting != null
                            ? '\${sensor.minutesUntilNextMeeting}m until "\${sensor.nextMeetingTitle ?? 'Meeting'}"'
                            : 'No immediate conflicts',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: isTimeRestricted ? const Color(0xFFB45309) : Colors.black87,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContextFilterBar() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          FilterChip(
            label: const Text('All Contexts'),
            selected: _manualContextFilter == null,
            onSelected: (_) => setState(() => _manualContextFilter = null),
          ),
          const SizedBox(width: 8),
          ...GTDContext.values.map((ctx) {
            final isSelected = _manualContextFilter == ctx;
            return Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: FilterChip(
                avatar: Icon(ctx.icon, size: 16, color: isSelected ? Colors.white : ctx.color),
                label: Text(ctx.tag),
                selected: isSelected,
                selectedColor: ctx.color,
                labelStyle: TextStyle(
                  color: isSelected ? Colors.white : Colors.black87,
                  fontWeight: FontWeight.w600,
                ),
                onSelected: (val) {
                  setState(() {
                    _manualContextFilter = val ? ctx : null;
                  });
                },
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildTaskCard(BuildContext context, SurfacedTask task, int rank) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border.all(
          color: task.isUnderTwoMinutes ? const Color(0xFF34D399) : Colors.grey[200]!,
          width: task.isUnderTwoMinutes ? 1.5 : 1.0,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row: Context Tag + Duration Badge + 2-min rule flag
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: task.context.color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(task.context.icon, size: 14, color: task.context.color),
                      const SizedBox(width: 4),
                      Text(
                        task.context.tag,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: task.context.color,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '\${task.durationMinutes} min',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black54),
                  ),
                ),
                const Spacer(),
                if (task.isUnderTwoMinutes)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFD1FAE5),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      '⚡ 2-MIN WIN',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF065F46)),
                    ),
                  ),
              ],
            ),

            const SizedBox(height: 10),

            // Task Title
            Text(
              task.title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
            ),

            const SizedBox(height: 4),

            // Next Physical Action (GTD core requirement)
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.arrow_forward_rounded, size: 16, color: Color(0xFF6366F1)),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    task.nextPhysicalAction,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF475569),
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Action Buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (task.isUnderTwoMinutes)
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF059669),
                      side: const BorderSide(color: Color(0xFF059669)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      visualDensity: VisualDensity.compact,
                    ),
                    icon: const Icon(Icons.flash_on, size: 16),
                    label: const Text('Do Now (2m)'),
                    onPressed: () => widget.onTwoMinuteActionExecuted(task),
                  ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F172A),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    visualDensity: VisualDensity.compact,
                  ),
                  icon: const Icon(Icons.check, size: 16),
                  label: const Text('Complete'),
                  onPressed: () => widget.onTaskCompleted(task),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, bool isTimeRestricted) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isTimeRestricted ? Icons.hourglass_bottom : Icons.check_circle_outline,
              size: 56,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              isTimeRestricted
                  ? 'No quick micro-tasks under 10m!'
                  : 'Zero surfaced actions in current context',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              isTimeRestricted
                  ? 'You have a calendar commitment in \${widget.sensorState.minutesUntilNextMeeting} minutes. Rest or prepare for the meeting!'
                  : 'Switch contexts or add items to your Omnipresent Inbox.',
              style: const TextStyle(fontSize: 13, color: Colors.black54),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
`;

export const FRONTEND_FLUTTER_WEEKLY_REVIEW_CODE = `// ==============================================================================
// File: lib/features/weekly_review/presentation/weekly_review_lockout_modal.dart
// Production-ready Flutter modal locking the dashboard for the 3-step GTD Purge
// ==============================================================================

import 'package:flutter/material.dart';

enum ReviewStep { emptyInbox, auditCompletedProjects, reviewSomedayMaybe }

class WeeklyReviewWizardModal extends StatefulWidget {
  final VoidCallback onReviewCompleted;
  final VoidCallback onDismissLockout;

  const WeeklyReviewWizardModal({
    Key? key,
    required this.onReviewCompleted,
    required this.onDismissLockout,
  }) : super(key: key);

  @override
  State<WeeklyReviewWizardModal> createState() => _WeeklyReviewWizardModalState();
}

class _WeeklyReviewWizardModalState extends State<WeeklyReviewWizardModal> {
  ReviewStep _currentStep = ReviewStep.emptyInbox;

  // Step 1: Inbox items to purge
  final List<String> _inboxItems = [
    'Voice note from Tuesday: client feedback on UX',
    'Receipt for flight to SF',
    'Scattered note: check new database backup policy',
  ];

  // Step 2: Active & completed projects
  final List<Map<String, dynamic>> _projects = [
    {'name': 'Launch GTD Micro-SaaS MVP', 'status': 'In Progress', 'completedActions': 14},
    {'name': 'Annual Tax Filing 2025', 'status': 'Ready to Close', 'completedActions': 6},
    {'name': 'Office Ergonomic Setup', 'status': 'Completed', 'completedActions': 4},
  ];

  // Step 3: Someday / Maybe list
  final List<String> _somedayMaybeList = [
    'Learn Swift UI for visionOS',
    'Organize garage woodworking workshop',
    'Plan 2-week trip to Japan in autumn',
    'Publish GTD case study on Substack',
  ];

  void _nextStep() {
    setState(() {
      if (_currentStep == ReviewStep.emptyInbox) {
        _currentStep = ReviewStep.auditCompletedProjects;
      } else if (_currentStep == ReviewStep.auditCompletedProjects) {
        _currentStep = ReviewStep.reviewSomedayMaybe;
      } else {
        widget.onReviewCompleted();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Dialog.fullscreen(
      child: Scaffold(
        backgroundColor: const Color(0xFF0F172A), // Dark focus mode
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Row(
            children: const [
              Icon(Icons.shield_outlined, color: Color(0xFF38BDF8)),
              SizedBox(width: 8),
              Text(
                'THE SYSTEM PURGE (WEEKLY REVIEW)',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1.2),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: widget.onDismissLockout,
              child: const Text('Exit Lockout', style: TextStyle(color: Colors.white54)),
            ),
          ],
        ),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Step Progress Indicator
                _buildProgressHeader(),

                const SizedBox(height: 24),

                // Active Step Content
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF334155)),
                    ),
                    child: _buildCurrentStepBody(),
                  ),
                ),

                const SizedBox(height: 20),

                // Wizard Navigation Buttons
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (_currentStep != ReviewStep.emptyInbox)
                      OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white70,
                          side: const BorderSide(color: Colors.white24),
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                        ),
                        onPressed: () {
                          setState(() {
                            if (_currentStep == ReviewStep.reviewSomedayMaybe) {
                              _currentStep = ReviewStep.auditCompletedProjects;
                            } else {
                              _currentStep = ReviewStep.emptyInbox;
                            }
                          });
                        },
                        child: const Text('Back'),
                      )
                    else
                      const SizedBox.shrink(),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0284C7),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: Icon(
                        _currentStep == ReviewStep.reviewSomedayMaybe
                            ? Icons.done_all
                            : Icons.arrow_forward,
                      ),
                      label: Text(
                        _currentStep == ReviewStep.reviewSomedayMaybe
                            ? 'Complete System Purge'
                            : 'Mark Step Clean & Next',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      onPressed: _nextStep,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProgressHeader() {
    int stepNumber = _currentStep == ReviewStep.emptyInbox
        ? 1
        : _currentStep == ReviewStep.auditCompletedProjects
            ? 2
            : 3;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Phase $stepNumber of 3: \${_getStepTitle(_currentStep)}',
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        const SizedBox(height: 6),
        Text(
          _getStepSubtext(_currentStep),
          style: const TextStyle(fontSize: 14, color: Colors.white60),
        ),
        const SizedBox(height: 14),
        LinearProgressIndicator(
          value: stepNumber / 3.0,
          backgroundColor: const Color(0xFF334155),
          valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF38BDF8)),
          minHeight: 6,
          borderRadius: BorderRadius.circular(3),
        ),
      ],
    );
  }

  String _getStepTitle(ReviewStep step) {
    switch (step) {
      case ReviewStep.emptyInbox:
        return 'Empty the Inbox to Zero';
      case ReviewStep.auditCompletedProjects:
        return 'Check Off Completed Projects';
      case ReviewStep.reviewSomedayMaybe:
        return 'Review Someday/Maybe & Tickler List';
    }
  }

  String _getStepSubtext(ReviewStep step) {
    switch (step) {
      case ReviewStep.emptyInbox:
        return 'Clarify every scrap of paper, digital note, and pending brain dump into next physical actions.';
      case ReviewStep.auditCompletedProjects:
        return 'Celebrate finished projects, archive documentation, and ensure every active project has at least 1 next action.';
      case ReviewStep.reviewSomedayMaybe:
        return 'Incubate future dreams. Promote ideas whose time has arrived into active projects, or purge obsolete wishes.';
    }
  }

  Widget _buildCurrentStepBody() {
    switch (_currentStep) {
      case ReviewStep.emptyInbox:
        return ListView(
          children: [
            Row(
              children: [
                const Icon(Icons.inbox, color: Colors.amber),
                const SizedBox(width: 8),
                Text(
                  'Pending Unprocessed Items (\${_inboxItems.length})',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ],
            ),
            const Divider(color: Colors.white12, height: 24),
            ..._inboxItems.map(
              (item) => Card(
                color: const Color(0xFF0F172A),
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  leading: const Icon(Icons.subdirectory_arrow_right, color: Colors.white54),
                  title: Text(item, style: const TextStyle(color: Colors.white)),
                  trailing: IconButton(
                    icon: const Icon(Icons.check_circle_outline, color: Color(0xFF10B981)),
                    onPressed: () {
                      setState(() {
                        _inboxItems.remove(item);
                      });
                    },
                  ),
                ),
              ),
            ),
          ],
        );

      case ReviewStep.auditCompletedProjects:
        return ListView(
          children: [
            Row(
              children: [
                const Icon(Icons.fact_check_outlined, color: Color(0xFF38BDF8)),
                const SizedBox(width: 8),
                const Text(
                  'Active & Completed Projects',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ],
            ),
            const Divider(color: Colors.white12, height: 24),
            ..._projects.map(
              (proj) => Card(
                color: const Color(0xFF0F172A),
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  title: Text(proj['name'], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  subtitle: Text('Status: \${proj['status']} • \${proj['completedActions']} actions completed', style: const TextStyle(color: Colors.white54)),
                  trailing: proj['status'] == 'Ready to Close'
                      ? ElevatedButton(
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
                          onPressed: () {
                            setState(() {
                              proj['status'] = 'Archived';
                            });
                          },
                          child: const Text('Archive Project'),
                        )
                      : const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.white30),
                ),
              ),
            ),
          ],
        );

      case ReviewStep.reviewSomedayMaybe:
        return ListView(
          children: [
            Row(
              children: [
                const Icon(Icons.lightbulb_outline, color: Colors.purpleAccent),
                const SizedBox(width: 8),
                const Text(
                  'Someday / Maybe Incubator',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ],
            ),
            const Divider(color: Colors.white12, height: 24),
            ..._somedayMaybeList.map(
              (idea) => Card(
                color: const Color(0xFF0F172A),
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  leading: const Icon(Icons.star_border, color: Colors.purpleAccent),
                  title: Text(idea, style: const TextStyle(color: Colors.white)),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Promoted to Active Project: \$idea')),
                          );
                        },
                        child: const Text('Promote to Project', style: TextStyle(color: Color(0xFF38BDF8))),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        );
    }
  }
}
`;
