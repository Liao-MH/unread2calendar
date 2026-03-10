#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path


VERSION_RE = re.compile(r"^##\s+(v[0-9][^\s]*)\s+-\s+")
COMMIT_HEADER = "### Commit 列表"
BULLET_RE = re.compile(r"^- `(.*)`\s*$")
HASHED_RE = re.compile(r"^([0-9a-f]{7,40})\s+(.+)$")


@dataclass
class Section:
  version: str
  start: int
  end: int


def run_git(repo: Path, *args: str) -> str:
  return subprocess.check_output(
    ["git", "-C", str(repo), *args],
    text=True,
  )


def collect_sections(lines: list[str]) -> list[Section]:
  starts: list[tuple[str, int]] = []
  for idx, line in enumerate(lines):
    match = VERSION_RE.match(line)
    if match:
      starts.append((match.group(1), idx))

  sections: list[Section] = []
  for i, (version, start) in enumerate(starts):
    end = starts[i + 1][1] if i + 1 < len(starts) else len(lines)
    sections.append(Section(version=version, start=start, end=end))
  return sections


def find_commit_block(lines: list[str], section: Section) -> tuple[int, int] | None:
  header_idx = None
  for idx in range(section.start, section.end):
    if lines[idx].strip() == COMMIT_HEADER:
      header_idx = idx
      break
  if header_idx is None:
    return None

  start = header_idx + 1
  end = section.end
  for idx in range(start, section.end):
    if idx > start and lines[idx].startswith("### "):
      end = idx
      break
  return start, end


def parse_bullets(lines: list[str], start: int, end: int) -> list[tuple[int, str]]:
  entries: list[tuple[int, str]] = []
  for idx in range(start, end):
    match = BULLET_RE.match(lines[idx])
    if match:
      entries.append((idx, match.group(1).strip()))
  return entries


def build_subject_index(repo: Path) -> dict[str, list[str]]:
  out: dict[str, list[str]] = {}
  raw = run_git(repo, "log", "--format=%H%x09%s", "--all")
  for line in raw.splitlines():
    if not line.strip():
      continue
    commit_hash, subject = line.split("\t", 1)
    out.setdefault(subject, []).append(commit_hash)
  return out


def normalize_existing(lines: list[str], sections: list[Section], repo: Path) -> None:
  subjects = build_subject_index(repo)
  for section in sections:
    block = find_commit_block(lines, section)
    if not block:
      continue
    start, end = block
    for idx, value in parse_bullets(lines, start, end):
      if HASHED_RE.match(value):
        continue
      matches = subjects.get(value, [])
      if len(matches) == 1:
        lines[idx] = f"- `{matches[0][:7]} {value}`"


def first_hashed_commit(lines: list[str], section: Section) -> str | None:
  block = find_commit_block(lines, section)
  if not block:
    return None
  start, end = block
  for _, value in parse_bullets(lines, start, end):
    match = HASHED_RE.match(value)
    if match:
      return match.group(1)
  return None


def refresh_latest(lines: list[str], sections: list[Section], repo: Path) -> None:
  if len(sections) < 2:
    return
  latest = sections[0]
  previous = sections[1]
  boundary = first_hashed_commit(lines, previous)
  if not boundary:
    raise SystemExit(f"Cannot refresh latest section without a hashed commit in {previous.version}")

  block = find_commit_block(lines, latest)
  if not block:
    raise SystemExit(f"Cannot refresh latest section without `{COMMIT_HEADER}` in {latest.version}")
  start, end = block

  raw = run_git(repo, "log", "--reverse", "--format=%H%x09%s", "HEAD", f"^{boundary}")
  commits: list[str] = []
  for line in raw.splitlines():
    if not line.strip():
      continue
    commit_hash, subject = line.split("\t", 1)
    commits.append(f"- `{commit_hash[:7]} {subject}`")

  if not commits:
    commits = ["- `(no commits found in computed range)`"]

  lines[start:end] = commits


def main() -> int:
  parser = argparse.ArgumentParser(description="Normalize and refresh CHANGELOG commit lists.")
  parser.add_argument("--file", default="docs/CHANGELOG.md", help="Path to CHANGELOG.md")
  parser.add_argument("--repo", default=".", help="Git repo root")
  parser.add_argument("--normalize-existing", action="store_true", help="Prefix existing commit subjects with matching git short hashes")
  parser.add_argument("--refresh-latest", action="store_true", help="Regenerate the newest version's commit list from git history")
  args = parser.parse_args()

  changelog = Path(args.file)
  repo = Path(args.repo)
  lines = changelog.read_text().splitlines()
  sections = collect_sections(lines)

  if args.normalize_existing:
    normalize_existing(lines, sections, repo)
  if args.refresh_latest:
    refresh_latest(lines, sections, repo)

  changelog.write_text("\n".join(lines) + "\n")
  return 0


if __name__ == "__main__":
  raise SystemExit(main())
