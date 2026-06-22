"""Allow 'aadhar' as a KYC document_type for India users.

Re-asserts the kyc_documents.document_type CHECK constraint with aadhar
added to the allowed set, alongside the existing VALID_DOC_TYPES in
gateway profile_service.

Revision ID: 0020
Revises: 0019
"""
from alembic import op


revision = "0020"
down_revision = "0019"
branch_labels = None
depends_on = None


ALLOWED_TYPES = [
    "passport", "aadhar", "national_id", "driving_license", "proof_of_address",
    "address_proof", "selfie", "bank_statement", "id_front", "id_back", "other",
]


def upgrade() -> None:
    types_sql = ", ".join(f"'{t}'" for t in ALLOWED_TYPES)
    op.execute("ALTER TABLE kyc_documents DROP CONSTRAINT IF EXISTS kyc_documents_document_type_check;")
    op.execute(
        f"ALTER TABLE kyc_documents ADD CONSTRAINT kyc_documents_document_type_check "
        f"CHECK (document_type IN ({types_sql}));"
    )


def downgrade() -> None:
    prior = [t for t in ALLOWED_TYPES if t != "aadhar"]
    types_sql = ", ".join(f"'{t}'" for t in prior)
    op.execute("ALTER TABLE kyc_documents DROP CONSTRAINT IF EXISTS kyc_documents_document_type_check;")
    op.execute(
        f"ALTER TABLE kyc_documents ADD CONSTRAINT kyc_documents_document_type_check "
        f"CHECK (document_type IN ({types_sql}));"
    )
