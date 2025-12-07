# Reset Database Instructions

If you're not seeing students and supervisors in the coordinator portal, you need to reset the database.

## Steps to Reset:

1. **Stop the server** (Ctrl+C if it's running)

2. **Reset the database:**
   ```bash
   npm run reset-db
   ```

3. **Restart the server:**
   ```bash
   npm run dev:full
   ```

This will:
- Delete the existing database
- Create a fresh database with the correct schema
- Initialize with demo data:
  - 4 Students (ENR001, ENR002, ENR003, ENR004) - **without groups** (so you can create groups)
  - 1 Supervisor (SUP001)
  - 1 Coordinator (COORD001)
  - 2 Panel Members (PANEL001, PANEL002)

## After Reset:

1. Login as Coordinator (COORD001 / password123)
2. Go to "Students" page
3. You'll see all 4 students listed
4. Create groups by selecting 2 students each
5. Assign supervisors to groups

## Demo Credentials:

- **Coordinator:** COORD001 / password123
- **Supervisor:** SUP001 / password123
- **Students:** ENR001, ENR002, ENR003, ENR004 / password123
- **Panel:** PANEL001, PANEL002 / password123

