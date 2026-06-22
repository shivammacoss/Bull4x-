"""Add users.book_type — 'A' (LP routed) or 'B' (internal).

The User model carries book_type for per-user routing between the A-book
(LP-routed) and B-book (internal matching). Without this column, every
auth query that selects User.* (login, register, demo-login) fails with
UndefinedColumnError.

Revision ID: 0019
Revises: 0018
"""
from alembic import op


revision = "0019"
down_revision = "0018"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS book_type VARCHAR(1) NOT NULL DEFAULT 'B';
    """)


def downgrade() -> None:
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS book_type;")
