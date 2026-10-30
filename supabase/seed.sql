insert into suppliers(id,code,name,owner) values
 ('10000000-0000-4000-8000-000000000001','HARBOUR','Harbour Packaging Demo','Morgan'),
 ('10000000-0000-4000-8000-000000000002','HARBOUR-AU','Harbour Packaging Australia Demo','Lee'),
 ('10000000-0000-4000-8000-000000000003','SOUTH','Southland Components Demo','Unassigned') on conflict do nothing;
insert into notes(id,supplier_id,actor,note,due_date) values
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Demo operator','Obtain credit note CN-33 source document',current_date-5),
 ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003','Demo operator','No statement received this month',current_date-3) on conflict do nothing;
