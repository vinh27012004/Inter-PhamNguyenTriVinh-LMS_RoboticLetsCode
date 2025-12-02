"""
Custom MySQL backend to bypass MariaDB version check and disable RETURNING
"""
from django.db.backends.mysql.base import DatabaseWrapper as MySQLDatabaseWrapper
from django.db.backends.mysql.features import DatabaseFeatures as MySQLDatabaseFeatures


class DatabaseFeatures(MySQLDatabaseFeatures):
    can_return_columns_from_insert = False
    can_return_rows_from_bulk_insert = False


class DatabaseWrapper(MySQLDatabaseWrapper):
    features_class = DatabaseFeatures
    
    def check_database_version_supported(self):
        """
        Skip version check for MariaDB 10.4
        """
        pass
