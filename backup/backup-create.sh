#!/bin/bash
pg_dump -h localhost -U postgres -F c knowledge-base -f /root/knowledge-base/backup/database.backup
