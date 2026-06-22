"""Google OAuth — add google_id + auth_provider, make password_hash nullable.

OAuth users sign in via Google and never set a local password, so the
password_hash column is now nullable. google_id stores Google's stable `sub`
claim (unique per Google account) for re-login matching, and auth_provider
records the signup origin (`local` or `google`) for analytics + future
providers.

Revision ID: 0015
Revises: 0014
"""
from alembic import op


revision = "0015"
down_revision = "0014"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS google_id VARCHAR(64) UNIQUE,
        ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(16) NOT NULL DEFAULT 'local';
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_users_google_id ON users (google_id);")
    # Drop the NOT NULL constraint on password_hash so OAuth users (no local
    # password) can be created. Existing rows are unaffected.
    op.execute("ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;")


def downgrade() -> None:
    # Re-imposing NOT NULL on password_hash would crash if any OAuth users
    # exist — fail loudly rather than silently corrupt data.
    op.execute("DROP INDEX IF EXISTS ix_users_google_id;")
    op.execute("""
        ALTER TABLE users
        DROP COLUMN IF EXISTS google_id,
        DROP COLUMN IF EXISTS auth_provider;
    """)
    op.execute("ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;")
