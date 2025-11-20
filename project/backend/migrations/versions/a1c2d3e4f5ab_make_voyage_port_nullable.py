"""make voyage.port_id nullable

Revision ID: a1c2d3e4f5ab
Revises: d8af99aad7d4
Create Date: 2025-11-20 10:15:00

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a1c2d3e4f5ab'
down_revision = 'd8af99aad7d4'
branch_labels = None
depends_on = None

def upgrade():
    # Set voyages.port_id to nullable if column exists
    try:
        op.alter_column('voyages', 'port_id', existing_type=sa.Integer(), nullable=True)
    except Exception:
        # If column doesn't exist (schema drift), skip gracefully
        pass


def downgrade():
    try:
        op.alter_column('voyages', 'port_id', existing_type=sa.Integer(), nullable=False)
    except Exception:
        pass
