-- Stack of custom prompt rules per brand. Each rule = { id, label, prompt, enabled, appliesTo }.
-- Rules merge into AI generation alongside posting_instructions.
alter table workspace_brands
  add column if not exists custom_rules jsonb default '[]'::jsonb;
