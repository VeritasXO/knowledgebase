#!/bin/bash
pg_restore -h localhost -U postgres -d knowledge-base --clean --create /root/knowledge-base/backup/database.backup
