---
title: "Profiling parallel apps with TAU & perf"
slug: profiling-tau-perf
date: "2026-01"
tag: writing
readtime: "9 min"
excerpt: "Notes from profiling a parallel C++ application using TAU for high-level traces and Linux perf for hardware counter data — how to find where time is actually spent, and how to visualise it."
draft: false
---

When a parallel application runs slower than expected, the first instinct is to guess. The second instinct is to add timers around the bits you already suspect. Both usually lead to the wrong place. This is about the third approach: actually measuring.

For a university HPC project I had to profile a parallel C++ application, identify runtime bottlenecks, and visualise the results. The toolchain was TAU (Tuning and Analysis Utilities) for high-level instrumentation and Linux `perf` for hardware counter data. Here's what I learned.

## What TAU and perf each give you

**TAU** instruments your application at the function level. It captures wall-clock time, CPU time, and call counts per function across all MPI ranks or OpenMP threads. The output is a profile database you browse in ParaProf or Vampir. Good for answering: *which function is dominating runtime?*

**Linux `perf`** sits closer to the hardware. It reads CPU performance counters — cache misses, branch mispredictions, instructions per cycle — via the kernel's `perf_events` interface. Good for answering: *why is that function slow?*

The two tools complement each other. TAU tells you where time goes; `perf` tells you what the hardware is doing there.

## Instrumenting with TAU

TAU can instrument code at compile time (using the PDT source transformation or a compiler wrapper) or at runtime via sampling. For most cases, the compiler wrapper is easiest:

```bash
# Build with TAU's MPI+OpenMP compiler wrapper
tau_cc.sh  -tau_options="-optShared -optMpi -optOpenMP" myapp.c  -o myapp
tau_cxx.sh -tau_options="-optShared -optMpi -optOpenMP" myapp.cpp -o myapp
```

Set the profiling output directory before running:

```bash
export TAU_PROFILE=1
export PROFILEDIR=./tau_profiles
mpirun -np 8 ./myapp
```

After the run, `./tau_profiles/` contains one `profile.*.*.*` file per MPI rank. Load them into ParaProf:

```bash
paraprof tau_profiles/
```

### Reading the ParaProf flat profile

The flat profile sorts functions by exclusive time (time inside the function, not in its callees). Look for functions where:

- Exclusive time is high — the function itself is slow
- Inclusive time >> Exclusive time — the function calls something expensive

In my case, `compute_stencil()` appeared near the top with high exclusive time. That's where `perf` came in.

## Drilling into hotspots with perf

`perf stat` gives a quick summary of hardware events:

```bash
perf stat -e cache-misses,cache-references,instructions,cycles ./myapp
```

Example output:

```
    1,234,567,890   cache-misses              #   42.3% of all cache refs
    2,918,371,204   cache-references
   18,432,000,000   instructions              #    1.23  insn per cycle
   14,986,432,100   cycles
```

A 42% cache miss rate is very high. Combined with TAU showing `compute_stencil()` as the hotspot, the hypothesis was clear: the stencil computation was thrashing the cache.

### perf record + perf report

For function-level attribution:

```bash
perf record -e cache-misses -g ./myapp
perf report
```

`perf report` opens an interactive TUI showing which functions contribute most to cache misses. The `-g` flag enables call-graph capture so you can see the full call stack at each sample.

### Annotating source with perf annotate

Once you've identified the hot function, `perf annotate` shows which source lines (or assembly instructions) are responsible:

```bash
perf annotate compute_stencil
```

This is where you find whether the issue is a strided memory access pattern, a frequently taken branch, or something else.

## Visualising with Python heatmaps

TAU profiles give per-function exclusive time per MPI rank. To spot load imbalances (one rank doing much more work than others), a heatmap is more readable than a table.

```python
import numpy as np
import matplotlib.pyplot as plt

# Load TAU profile data — simplified example
# In practice, use the tau_profile_parser or pstats2json
ranks = 8
functions = ['compute_stencil', 'mpi_reduce', 'io_write', 'init']
data = np.array([
    [82.3, 4.1, 1.2, 0.3],
    [79.8, 5.2, 1.1, 0.3],
    [83.1, 4.0, 1.3, 0.3],
    [41.2, 3.9, 1.1, 0.3],  # rank 3 is suspiciously fast
    [81.0, 4.3, 1.2, 0.3],
    [80.5, 4.1, 1.4, 0.3],
    [82.7, 3.8, 1.1, 0.3],
    [83.4, 4.2, 1.3, 0.3],
])

fig, ax = plt.subplots(figsize=(8, 5))
im = ax.imshow(data, aspect='auto', cmap='hot_r')
ax.set_xticks(range(len(functions)))
ax.set_xticklabels(functions, rotation=30, ha='right')
ax.set_ylabel('MPI Rank')
ax.set_title('Exclusive time (s) by function and rank')
fig.colorbar(im, ax=ax, label='Seconds')
plt.tight_layout()
plt.savefig('profile_heatmap.png', dpi=150)
```

Rank 3 standing out immediately told us there was a data partition imbalance — one rank received fewer elements and finished early, leaving the others waiting at the `MPI_Reduce` barrier.

## What I changed

After profiling:

1. **Loop reordering** in `compute_stencil()` — changed from row-major to column-major iteration to match memory layout. Cache miss rate dropped from 42% to 8%.
2. **Static load balancing** — the partitioner was dividing elements by index without accounting for non-uniform element sizes. Switching to size-aware partitioning eliminated the rank 3 anomaly.

Runtime dropped by ~34% with both changes applied.

## Takeaways

- Profile before optimising. Every time I've guessed at hotspots without measuring, I've been wrong at least once.
- TAU + perf is a good division of labour: TAU for the application-level view, `perf` for the hardware-level explanation.
- The heatmap is a surprisingly effective presentation tool — one image showed the load imbalance more clearly than any table could.
