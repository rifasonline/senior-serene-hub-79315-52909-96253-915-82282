-- Add priority and status enums for tasks
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');

-- Add new columns to daily_tasks table
ALTER TABLE daily_tasks 
ADD COLUMN priority task_priority NOT NULL DEFAULT 'medium',
ADD COLUMN status task_status NOT NULL DEFAULT 'pending',
ADD COLUMN deadline timestamp with time zone,
ADD COLUMN title text NOT NULL DEFAULT '';

-- Update existing tasks to have consistent status based on completed field
UPDATE daily_tasks 
SET status = CASE 
  WHEN completed = true THEN 'completed'::task_status 
  ELSE 'pending'::task_status 
END;

-- Create index for better query performance
CREATE INDEX idx_daily_tasks_status ON daily_tasks(status);
CREATE INDEX idx_daily_tasks_elderly_status ON daily_tasks(elderly_id, status);