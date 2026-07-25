---
title: Schedules
description: Define how often monitors run.
order: 7
---

# Schedules

Schedules control the frequency of monitor checks. They can be reused across many monitors.

## Create a Schedule

When creating or editing a monitor, open the schedule dropdown and choose **Create new schedule** to add a schedule.

![Create schedule](/img/uptime-o/schedules-01-create.png)

Common intervals include:

- `30s` for critical endpoints
- `1m` for production services
- `5m` for lower-priority checks

## Apply a Schedule

When creating or editing a monitor, select the schedule from the dropdown. The assigned agent will run the monitor at that interval.

## Best Practices

- Use shorter intervals only for endpoints that can handle the load.
- Align schedules with your SLO measurement windows.
- Avoid creating many unique schedules when a shared one will do.
