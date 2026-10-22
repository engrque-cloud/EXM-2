# Exam Management System (EMS)

An enterprise-grade academic exam management platform enabling Exam Controllers to schedule date sheets, teachers to receive 10-day advance upload alerts and submit papers, QA checkers to review and approve question papers, automatic invigilation Duty Roster assignment, Principal bottleneck tracking with exam call controls, and student date sheet and result portals.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design choices were confirmed during requirement clarification and will guide the implementation:

- **Confirmed Decision 1 (Role Switching)**: Quick role-switcher with pre-configured demo personas (Admin/Controller, Principal, QA Checker, Teacher, Student) alongside an account registration and approval workflow.
- **Confirmed Decision 2 (10-Day Notification & Simulation)**: Interactive alerts paired with an integrated Date Simulator tool, allowing users and evaluators to advance system time and trigger the exact 10-day paper upload countdown, overdue warnings, and duty confirmations.
- **Confirmed Decision 3 (Academic Scope & Grading)**: Multi-department relational structure pre-seeded with English, Mathematics, and Computer Science (Semesters 1 through 8 each), utilizing credit-hour weighted GPA and standard letter grading (A, B, C, D, F).

---

## 1. Overview & Core Concept

### What It Does
The Exam Management System orchestrates the complete lifecycle of university examinations:
1. **Curriculum & User Administration**: Relational hierarchy linking Departments $\rightarrow$ Sessions $\rightarrow$ Semesters 1–8 $\rightarrow$ Papers/Courses $\rightarrow$ Faculty & Students. Admin approves or rejects new user registrations.
2. **Date Sheet Scheduling**: Exam Controller assigns dates, exam timings, venues, and designated teachers for each paper.
3. **10-Day Deadline Engine & Notification System**: Teachers receive proactive alerts 10 days before their scheduled exam date to upload draft examination papers.
4. **QA Quality Audit & Duty Roster**: QA Checkers audit submitted papers for syllabus coverage and formatting, either approving or rejecting with remarks. Approving a paper automatically locks the teacher's invigilation duty into the confirmed **Duty Roster**.
5. **Principal Bottleneck Inspector**: Visual pipeline tracking every paper's exact status (Pending Teacher, Stuck in QA Review, Approved, Exam Called, Results Submitted). The Principal issues the official **Call for Exam** once ready.
6. **Results & Transcripts**: Teachers input and submit student exam marks after exam completion, calculating GPAs and publishing transcripts for students.
7. **Student Portal**: Students inspect their personalized date sheets, room allotments, and academic grade sheets.

### Target Personas
- **Admin / Exam Controller & Assistant**: Master scheduling, user approvals, department & session management, and institutional calendar.
- **Principal**: Executive oversight, paper pipeline bottleneck diagnostics, and official exam calls.
- **QA Checker**: Academic syllabus compliance and question paper rigor review.
- **Teacher**: Question paper submission, invigilation duty calendar, and post-exam grading.
- **Student**: Schedule lookup, admit card verification, and grade transcript viewing.

---

## 2. User Experience & Visual Design

### Key User Flows
- **Flow 1: Role Navigation & Date Simulator**: Top navigation bar houses an executive role switcher and an interactive "Simulation Clock" modal where users can warp the current date forward to trigger 10-day alerts or post-exam grading states.
- **Flow 2: Date Sheet Creation (Admin / Controller)**:
  - Step 1: Select Department (English, Math, CS) and Semester (1 to 8).
  - Step 2: Choose Paper/Course and assign Lead Teacher and Hall.
  - Step 3: Set Exam Date. System records the entry and initiates the 10-day notification trigger.
- **Flow 3: Teacher Paper Upload & 10-Day Alert**:
  - Teacher receives an alert badge and banner ("Exam in $\le 10$ days: Paper upload required").
  - Upload modal allows attaching paper text/questions, marking scheme, and coverage checklist.
- **Flow 4: QA Quality Audit & Duty Confirmation**:
  - QA Checker views submitted papers in a side-by-side review deck.
  - QA clicks "Approve" (or "Reject with Notes").
  - On approval, the system transitions paper status to `QA_APPROVED` and confirms the teacher's slot on the **Duty Roster**.
- **Flow 5: Principal Pipeline Visualizer & Call for Exam**:
  - Interactive multi-stage visual tracker displaying all scheduled papers across departments.
  - Highlights papers stalled at Teacher Draft ($>10$ days remaining vs overdue) or stalled in QA Review.
  - Principal triggers "Call for Exam" upon paper readiness, authorizing exam execution and unlocking Teacher result uploads.
- **Flow 6: Post-Exam Grading & Student Transcript**:
  - Teacher enters internal, midterm, and final scores for registered students.
  - Automated calculation of Percentage, Grade Point (0.0–4.0), and Letter Grade.
  - Students log in to inspect their verified result cards with GPA/CGPA.

### Visual Identity & Theme
- **Aesthetic Direction**: Academic enterprise workspace adhering to strict anti-slop rules—subtle hairline borders (`border-neutral-200 dark:border-neutral-800`), dense data tables with tabular figures (`tabular-nums`), and zero rounded pill badges for metadata.
- **Color Palette**:
  - Neutral Base (60%): Clean white (`#FFFFFF`) / Slate canvas (`#0F172A`).
  - Structural Surfaces (30%): Soft cool gray cards (`#F8FAFC` / `#1E293B`) with 1px hairline dividers.
  - Semantic Accents (10%): Academic Oxford Blue / Indigo (`#1E40AF` / `#3B82F6`) for primary actions; Emerald (`#16A34A`) for QA approved; Amber (`#D97706`) for 10-day alerts; Crimson (`#DC2626`) for overdue/rejected papers.
- **Typography & Hierarchy**:
  - Display & Headings: `Plus Jakarta Sans` for crisp institutional presence.
  - Body & UI Controls: `DM Sans` for high legibility at 12–14px.
  - Tabular Figures & Codes: Monospace `tabular-nums` for roll numbers, marks, dates, GPAs, and course codes.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Unified Relational In-Memory + LocalStorage Store**
  - *Chosen Approach*: Fully relational TypeScript state engine with normalized tables (`departments`, `sessions`, `semesters`, `courses`, `users`, `dateSheetEntries`, `examPapers`, `dutyRoster`, `examResults`) initialized with rich sample data and saved in browser storage.
  - *Why*: Instant role-switching, zero external API latency, reliable offline capability, and easy state reset.
  - *Alternatives Considered*: Cloud Firestore (unnecessary overhead for demo review; can be connected if user requests full cloud persistence).
- **Decision 2: Interactive Date Simulator Tool**
  - *Chosen Approach*: A non-intrusive floating simulator header allowing the user to view the app today, skip forward 15 days, or set custom dates to verify the 10-day notification logic, exam day trigger, and post-exam grading unlock.
  - *Why*: Directly solves the testing requirement where notifications occur relative to future exam dates.
- **Decision 3: Dedicated Views per Role with Quick Switcher**
  - *Chosen Approach*: Seamless switcher bar at the top with pre-built profiles for Controller, Principal, QA Officer, Faculty Teacher, and Student. Also includes an Admin registration approval queue for testing self-service signups.
  - *Why*: Allows immediate evaluation of every user perspective in seconds without tedious repeated logins.

---

## 4. Technical Architecture & Data Strategy

### System Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Top Navigation & Control                        │
│   [EMS Academic Wordmark]  [Current Date & Time Simulator]  [Role Bar]  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
          ┌──────────────────────────┴──────────────────────────┐
          ▼                                                     ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│     Global State & Persistence   │   │     Academic Relational Model   │
│  - Active Role & Current User   │   │  - Departments (Eng, Math, CS)  │
│  - Simulated System Clock       │   │  - Sessions & Semesters 1 to 8  │
│  - Notification Dispatcher      │   │  - Courses & Faculty Links      │
│  - LocalStorage Synchronization │   │  - Date Sheets & Exam Venues    │
└────────────────┬────────────────┘   └────────────────┬────────────────┘
                 │                                     │
                 └──────────────────┬──────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│  Admin / Controller │   │      Principal      │   │     QA Auditor      │
│ - Date Sheet Maker  │   │ - Exam Calendar     │   │ - Paper Review Deck │
│ - User Approvals    │   │ - Bottleneck Radar  │   │ - Accept / Reject   │
│ - Duty Roster View  │   │ - Call for Exam     │   │ - Auto-Confirm Duty │
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘
                                    │
                                    ├───────────────────────────────┐
                                    ▼                               ▼
                          ┌───────────────────┐           ┌───────────────────┐
                          │      Teacher      │           │      Student      │
                          │ - 10-Day Alerts   │           │ - Date Sheet View │
                          │ - Paper Uploader  │           │ - Admit Card Slip │
                          │ - Result Grading  │           │ - Semester Grades │
                          └───────────────────┘           └───────────────────┘
```

### Relational Entity Schema
- **`Department`**: `id`, `name` (English, Math, Computer Science), `code`.
- **`Session`**: `id`, `name` (e.g., "Fall 2026", "Spring 2026"), `isCurrent`.
- **`Course/Paper`**: `id`, `code` (e.g., "ENG-101", "MTH-302"), `title`, `departmentId`, `semester` (1–8), `creditHours`.
- **`User`**: `id`, `name`, `email`, `role` (`ADMIN`, `PRINCIPAL`, `QA_CHECKER`, `TEACHER`, `STUDENT`), `departmentId`, `isApproved`, `status` (`ACTIVE`, `PENDING`).
- **`DateSheetEntry`**: `id`, `sessionId`, `departmentId`, `semester`, `courseId`, `assignedTeacherId`, `examDate`, `startTime`, `endTime`, `hallNumber`, `status` (`SCHEDULED`, `CONDUCTED`, `COMPLETED`).
- **`PaperSubmission`**: `id`, `dateSheetEntryId`, `teacherId`, `title`, `contentSummary`, `fileAttachmentName`, `submittedAt`, `qaStatus` (`PENDING_UPLOAD`, `PENDING_QA`, `QA_APPROVED`, `QA_REJECTED`), `qaNotes`, `qaReviewedAt`, `qaReviewerId`.
- **`DutyAssignment`**: `id`, `dateSheetEntryId`, `teacherId`, `role` ("Chief Invigilator" / "Assistant"), `isConfirmed` (true once QA approves paper), `confirmedAt`.
- **`ExamResult`**: `id`, `dateSheetEntryId`, `studentId`, `courseId`, `sessionalMarks`, `midtermMarks`, `finalMarks`, `totalMarks`, `gpa`, `letterGrade`, `submittedByTeacher`, `submittedAt`.

### Implementation Sequence Plan
1. **Core Relational Model & Mock Generator**: Implement TypeScript schemas, robust helper relationships, pre-seeded departments (English, Math, CS Semesters 1–8), default staff, and initial exam schedules.
2. **Notification & 10-Day Countdown Engine**: Logic computing days-until-exam against the simulated date; triggers notifications when $\le 10$ days.
3. **Admin & Exam Controller Dashboard**:
   - Date sheet interactive scheduler (department, semester, paper, teacher, date picker).
   - User approval/rejection queue.
   - Duty roster board.
4. **Teacher Module**:
   - 10-day advance alerts and countdown timers.
   - Question paper submission workspace.
   - Post-exam grading sheet with dynamic GPA calculation.
5. **QA Checker Module**:
   - Audit desk with question paper inspection, acceptance/rejection criteria, and feedback notes.
   - Automatic invigilation duty confirmation into the Duty Roster.
6. **Principal Module**:
   - Paper Visual Bottleneck Inspector (Kanban/funnel showing Teacher delay vs. QA delay vs. Ready).
   - "Call for Exam" trigger unlocking marks uploads.
   - Institutional exam calendar.
7. **Student Portal**:
   - Examination date sheet and venue guide.
   - Semester grade transcripts and GPA summaries.
8. **Top Bar, Date Simulator & Demo Personas**:
   - Header with clean wordmark, instant role toggle, and interactive date warp simulator.
9. **Final Verification**: Build check with `compile_applet` and full workflow run-through.
