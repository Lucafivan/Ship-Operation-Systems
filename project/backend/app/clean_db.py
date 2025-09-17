from flask import Flask
from flask.cli import with_appcontext
import click
from app import db

@click.command('clean-db')
@with_appcontext
def clean_db_command():
    """Drop all tables and recreate them."""
    db.drop_all()
    db.create_all()
    click.echo('Database cleaned: all tables dropped and recreated.')

def register_commands(app: Flask):
    app.cli.add_command(clean_db_command)
