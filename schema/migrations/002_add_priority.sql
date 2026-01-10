-- Add priority column to tasks table
-- Priority levels: 'low', 'medium', 'high'

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';

-- Create index for priority filtering
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
