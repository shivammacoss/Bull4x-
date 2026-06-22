"""Email case-insensitive uniqueness — DB-level guarantee.

Application code already normalizes emails to lowercase at the boundary
(Pydantic validators on RegisterRequest / LoginRequest / EmployeeIn /
AdminLoginRequest), and lookups use LOWER(email). This migration adds the
DB-level safety net so even direct-SQL inserts cannot create case-collision
duplicates like 'User@x.com' + 'user@x.com'.

Steps:
  1. Detect any existing case-collision groups; fail loudly if present so an
     admin can merge/delete duplicates before the migration runs.
  2. Backfill: lowercase every existing email row (idempotent).
  3. Create UNIQUE INDEX on LOWER(email).

Revision ID: 0016
Revises: 0015
"""
from alembic import op


revision = "0016"
down_revision = "0015"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1) Refuse to apply if existing data has case-collisions — those need
    #    manual resolution (merge balances, delete dupes, etc.) before we can
    #    enforce uniqueness.
    op.execute("""
        DO $$
        DECLARE
            collision_count INT;
        BEGIN
            SELECT COUNT(*) INTO collision_count FROM (
                SELECT LOWER(email)
                FROM users
                WHERE email IS NOT NULL
                GROUP BY LOWER(email)
                HAVING COUNT(*) > 1
            ) AS dups;

            IF collision_count > 0 THEN
                RAISE EXCEPTION
                  'Cannot apply case-insensitive email index: % case-collision group(s) exist in users.email. '
                  'Run this query, merge/delete the duplicates, then retry: '
                  'SELECT LOWER(email) AS lc, array_agg(id) AS ids, array_agg(email) AS emails '
                  'FROM users GROUP BY LOWER(email) HAVING COUNT(*) > 1;',
                  collision_count;
            END IF;
        END $$;
    """)

    # 2) Backfill — normalize all rows. No-op for rows already lowercase.
    op.execute("""
        UPDATE users
        SET email = LOWER(email)
        WHERE email IS NOT NULL AND email <> LOWER(email);
    """)

    # 3) DB-level case-insensitive uniqueness.
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email_lower
        ON users (LOWER(email));
    """)


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ux_users_email_lower;")
