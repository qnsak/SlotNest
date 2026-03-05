from __future__ import annotations

from dataclasses import dataclass

from domain.interval.repository import IntervalRepository


@dataclass
class DeleteIntervalCommand:
    interval_id: int


def delete_interval(
    interval_repo: IntervalRepository,
    command: DeleteIntervalCommand,
) -> None:
    interval_repo.delete(command.interval_id)
