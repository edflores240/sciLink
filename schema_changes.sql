--hi


-- CREATE VIEW leave_balances AS
-- SELECT
--     person_id,
--     SUM(time_flexi) AS flexi_balance,
--     SUM(time_til) AS til_balance,
--     SUM(rwe_day) AS rdo_balance,
--     SUM(time_leave) AS total_leave,
--     SUM(time_overtime) AS total_overtime
-- FROM
--     ts_timesheet_t
-- GROUP BY
--      person_id,
-- 	 username;




-- Create a table for user metadata
-- -- Create a table for user metadataxx`
-- CREATE TABLE ts_user_t (
--     user_id INT PRIMARY KEY,
--     role_id INT,
--     first_name VARCHAR(255),
--     last_name VARCHAR(255),
--     middle_name VARCHAR(255),
--     birth_date TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(id)
-- );
-- INSERT INTO ts_user_t (user_id, role_id, first_name, last_name, middle_name, birth_date)
-- VALUES (1, 1, 'John', 'Doe', 'Smith', '1990-05-15');



-- Create a table for staff hierarchy
-- CREATE TABLE staff_hierarchy (
--     user_id INT,
--     manager_id INT,
--     FOREIGN KEY (user_id) REFERENCES users(id),
--     FOREIGN KEY (manager_id) REFERENCES users(id),
--     PRIMARY KEY (user_id, manager_id)
-- );



-- -- Intermediate Table for Many-to-Many Relationship
-- CREATE TABLE IF work_schedule (
--   "id" serial PRIMARY KEY,
--   "schedule_day" varchar(255)[],
--   "paid_hours" numeric(5,2),
--   "start_date" timestamp,
--   "end_date" timestamp
-- );

-- ALTER TABLE work_schedule
-- ALTER COLUMN "paid_hours" TYPE varchar(255)[] USING "paid_hours"::varchar(255)[];



-- INSERT INTO work_schedule ("schedule_day", "paid_hours", "start_date", "end_date")
-- VALUES ('{Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday}', 7.60, '2023-12-31 18:31:18', '2024-12-31 18:31:28');


-- CREATE TABLE user_work_schedule (
--   "user_id" int4 NOT NULL,
--   "schedule_id" int4 NOT NULL DEFAULT 1,
--   "next_pay_date" date,
--   "payment_status" int2,
--   "total_work_hours" int4,
--   PRIMARY KEY ("user_id", "schedule_id")
-- );









-- CREATE TABLE "notification" (
--   "notification_id" int NOT NULL PRIMARY KEY,
--   "title" varchar(255) NOT NULL,
--   "message" text NOT NULL,
--   "sender_id" int NOT NULL,
--   "receiver_id" int NOT NULL,
--   "read_status" bool DEFAULT false,
--   "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
--   "updated_at" timestamptz,
--   "timesheet_id" int,
--   "sender_message" text,
--   "sender_title" varchar(255),
--   "notification_type" varchar(255),
--   "sender_read_status" bool,
--   "receiver_read_status" bool
-- );


-- CREATE TABLE "issues" (
--   "issue_code" varchar(255),
--   "issue_type" varchar(255),
--   "issue_message" text,
--   "issue_id" serial PRIMARY KEY
-- );

-- INSERT INTO "issues" VALUES ('issue1', 'non-check', 'The Variance is Greater than 2', 1);
-- INSERT INTO "issues" VALUES ('issue2', 'check', 'The Total hours is less than 4 hours', 2);
-- INSERT INTO "issues" VALUES ('issue3', 'check', 'The Total hours is greater than 11 hours', 3);
-- INSERT INTO "issues" VALUES ('issue4', 'check', 'The User work more than 10 days in a row', 4);
-- INSERT INTO "issues" VALUES ('issue5', 'check', 'The User work more than 7 days in a row', 5);


--   CREATE TABLE "ts_issue" (  
--     "ts_id" int4, 
--     "issue_code" varchar(255) 
--   )

  






-- CREATE TABLE "user_work_schedule" (
--   "user_id" int4 NOT NULL,
--   "schedule_id" int4 DEFAULT 0,
--   "disable_til" bool DEFAULT false,
--   "disable_flexi" bool DEFAULT false,
--   "disable_rdo" bool DEFAULT false
-- );



-- CREATE TABLE "work_schedule" (
--   "id" int4 NOT NULL DEFAULT nextval('work_schedule_id_seq'::regclass),
--   "schedule_day" varchar(255)[] COLLATE "pg_catalog"."default",
--   "paid_hours" varchar(255)[] COLLATE "pg_catalog"."default",
--   "start_date" timestamp(6),
--   "end_date" timestamp(6)
-- )
-- ;

-- -- ----------------------------
-- -- Records of work_schedule
-- -- ----------------------------
-- INSERT INTO "work_schedule" VALUES (1, '{Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday}', '{0,7.60,7.60,4.0,4.0,7.6,0,0,7.60,7.60,7.60,7.60,7.60,0}', '2023-12-31 18:31:18', '2024-12-31 18:31:28');
-- INSERT INTO "work_schedule" VALUES (0, '{Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday}', '{0,0,0,0,0,0,0,0,0,0,0,0,0,0}', '2009-12-27 23:25:32', '2070-12-27 23:26:18');




















-- CREATE TABLE notification (
--     notification_id SERIAL PRIMARY KEY,
--     title VARCHAR(255) NOT NULL,
--     message TEXT NOT NULL,
--     sender_id INT NOT NULL,
--     receiver_id INT NOT NULL,
--     read_status BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP WITH TIME ZONE
-- );


-- Recipient Table
-- CREATE TABLE recipient (
--     id SERIAL PRIMARY KEY,
--     user_id INT NOT NULL,
--     manager_id INT,
--     notification_id INT NOT NULL,
--     seen BOOLEAN DEFAULT FALSE,
--     FOREIGN KEY (user_id) REFERENCES users(id),
--     FOREIGN KEY (manager_id) REFERENCES users(id),
--     FOREIGN KEY (notification_id) REFERENCES notification(notification_id)
-- );

-- ALTER TABLE notification
-- ADD COLUMN timesheet_id INT,
-- ADD CONSTRAINT notification_timesheet_id_fkey FOREIGN KEY (timesheet_id) REFERENCES timesheets(id) ON DELETE SET NULL ON UPDATE NO ACTION;





CREATE TABLE "organizations" (
  "org_name" varchar(255),
  "org_description" text,
  "org_id" SERIAL NOT NULL
);

INSERT INTO "organizations" VALUES ('Org 1', 'The Org 1', 1);
INSERT INTO "organizations" VALUES ('Org 2', 'The Org 2', 2);



ALTER TABLE personelle
ADD COLUMN org_id INT;

ALTER TABLE activities 
ADD COLUMN org_id INT;

ALTER TABLE location
ADD COLUMN org_id INT;

ALTER TABLE notification
ADD COLUMN archive bool DEFAULT FALSE;
UPDATE notification SET archive = FALSE;



