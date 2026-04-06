"""add travel_logs table

Revision ID: a1b2c3d4e5f6
Revises: 63f9df5ac45d
Create Date: 2026-04-06

"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = '63f9df5ac45d'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'travel_logs',
        sa.Column('id',         sa.Integer(),     nullable=False),
        sa.Column('user_id',    sa.Uuid(),         nullable=False),
        sa.Column('city_name',  sa.String(32),    nullable=False),
        sa.Column('province',   sa.String(32),    nullable=False),
        sa.Column('title',      sa.String(128),   nullable=False),
        sa.Column('content',    sa.String(4096),  nullable=False),
        sa.Column('mood',       sa.String(16),    nullable=False, server_default='happy'),
        sa.Column('rating',     sa.Integer(),     nullable=False, server_default='5'),
        sa.Column('visited_at', sa.DateTime(),    nullable=False),
        sa.Column('created_at', sa.DateTime(),    nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_travel_logs_user_id',   'travel_logs', ['user_id'])
    op.create_index('ix_travel_logs_city_name', 'travel_logs', ['city_name'])


def downgrade():
    op.drop_index('ix_travel_logs_city_name', table_name='travel_logs')
    op.drop_index('ix_travel_logs_user_id',   table_name='travel_logs')
    op.drop_table('travel_logs')