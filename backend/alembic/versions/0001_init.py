"""init schema

Revision ID: 0001_init
Revises:
Create Date: 2026-03-05 00:00:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "availability_intervals",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False, autoincrement=True),
        sa.Column("date", sa.Text(), nullable=False),
        sa.Column("start_time", sa.Text(), nullable=False),
        sa.Column("end_time", sa.Text(), nullable=False),
        sa.Column("created_at", sa.Text(), nullable=False),
        sqlite_autoincrement=True,
    )
    op.create_index(
        "ix_availability_intervals_date",
        "availability_intervals",
        ["date"],
        unique=False,
    )

    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False, autoincrement=True),
        sa.Column("booking_reference", sa.Text(), nullable=False),
        sa.Column("interval_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.Text(), nullable=False),
        sa.Column("created_at", sa.Text(), nullable=False),
        sa.Column("canceled_at", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["interval_id"], ["availability_intervals.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("booking_reference", name="uq_bookings_booking_reference"),
        sqlite_autoincrement=True,
    )
    op.create_index("ix_bookings_interval_id", "bookings", ["interval_id"], unique=False)
    op.create_index("ix_bookings_status", "bookings", ["status"], unique=False)
    op.create_index(
        "ux_bookings_active_interval",
        "bookings",
        ["interval_id"],
        unique=True,
        sqlite_where=sa.text("status = 'ACTIVE'"),
    )


def downgrade() -> None:
    op.drop_index("ux_bookings_active_interval", table_name="bookings")
    op.drop_index("ix_bookings_status", table_name="bookings")
    op.drop_index("ix_bookings_interval_id", table_name="bookings")
    op.drop_table("bookings")
    op.drop_index("ix_availability_intervals_date", table_name="availability_intervals")
    op.drop_table("availability_intervals")
