export type Activity = {
  activity_id: number;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: number | null;
  created_at: string;
  details: any;
  dismissed?: boolean;
};
