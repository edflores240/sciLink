
CREATE TABLE location (
    id SERIAL PRIMARY KEY,
    location_id INT,
    location_name VARCHAR(255),
    role_id INT NULL
);


INSERT INTO location (location_id, location_name) VALUES
(144, 'Albert Park'),
(145, 'Alexandra'),
(146, 'Alfred Nicolas Gardens'),
(147, 'Anakie'),
(148, 'Anglesea'),
(149, 'Anglesea Do Not Use'),
(150, 'Apollo Bay'),
(127348, 'Bacchus Marsh Depot'),
(151, 'Bacchus Marsh Office'),
(152, 'Bairnsdale'),
(135695, 'Bairnsdale (Depot)'),
(153, 'Ballarat'),
(127349, 'Balook Depot'),
(154, 'Beaufort'),
(155, 'Beechworth'),
(156, 'Benalla'),
(157, 'Bendigo'),
(158, 'Bendoc'),
(127350, 'Blackbird Depot'),
(263, 'Bourke Street'),
(142, 'Bourke Street - OLD'),
(22186, 'Box Hill'),
(159, 'Braeside Park'),
(135687, 'Bright (Depot)'),
(160, 'Bright (Office)'),
(135696, 'Brimbank (Depot)'),
(161, 'Brimbank Park'),
(162, 'Brimbank Park -Ctl Ro'),
(127351, 'Buchan Depot'),
(163, 'Buchan Office'),
(164, 'Burnley'),
(165, 'Bushy Park (Depot)'),
(166, 'Cann River'),
(130975, 'Cape Conran (Office)'),
(167, 'Casterton'),
(168, 'Castlemaine'),
(10395, 'Cohuna'),
(10374, 'Cohuna (OLD)'),
(169, 'Colac'),
(135697, 'Colac (Depot)'),
(170, 'Coolart'),
(171, 'Creswick'),
(224, 'Dandenong Ranges Botanic Garden'),
(172, 'Dargo'),
(127352, 'Deddick (Depot)'),
(173, 'Dharnya Centre'),
(174, 'Dunkeld'),
(127353, 'Echuca Depot'),
(175, 'Echuca Office'),
(176, 'Erica'),
(177, 'Ferntree Gully'),
(178, 'Forrest'),
(179, 'Foster (Depot)'),
(135699, 'Foster (Office)'),
(135698, 'Foster Primary (Depot)'),
(180, 'French Island'),
(181, 'Gabo Island'),
(182, 'Geelong Do Not Use'),
(183, 'Gembrook'),
(127354, 'Halls Gap Depot'),
(184, 'Halls Gap Office'),
(127355, 'Hattah Kulkyne Depot'),
(185, 'Hattah Kulkyne Office'),
(186, 'Heyfield'),
(187, 'Hopetoun (Office)'),
(188, 'Horsham'),
(189, 'Inglewood'),
(135700, 'Inverloch (Office & Depot)'),
(190, 'Irymple'),
(191, 'Kerang (Office)'),
(192, 'Kinglake'),
(135701, 'Kinglake (Depot)'),
(119588, 'Knoxfield'),
(127358, 'Lake Eildon Depot'),
(193, 'Lake Eildon Office'),
(23092, 'Launching Way'),
(194, 'Lavers Hill'),
(195, 'Loch Sport'),
(196, 'Lorne'),
(197, 'Lysterfield'),
(198, 'Macarthur Depot'),
(199, 'Macedon'),
(127359, 'Mallacoota Depot'),
(200, 'Mallacoota Office'),
(201, 'Mansfield'),
(202, 'Maroondah'),
(135702, 'Maroondah (Office and Depot)'),
(203, 'Maryborough'),
(204, 'Marysville'),
(205, 'Mildura'),
(135703, 'Morwell (Depot)'),
(121468, 'Mount Eccles'),
(206, 'Mt Beauty'),
(207, 'Mt Buffalo'),
(127360, 'Nathalia Depot'),
(208, 'Nathalia Office'),
(209, 'Natimuk'),
(210, 'National WSC'),
(211, 'Nelson'),
(212, 'Nhill'),
(16423, 'Nicholson Street'),
(213, 'Nyerimilang'),
(214, 'Olinda'),
(127361, 'Omeo Depot'),
(215, 'Omeo Office'),
(216, 'Orbost'),
(135704, 'Orbost (Depot)'),
(217, 'Organ Pipes'),
(302, 'Parks Victoria'),
(9260, 'Patterson River'),
(218, 'Plenty Gorge'),
(219, 'Point Cook'),
(130972, 'Point Hicks Lighthouse'),
(127397, 'Point Nepean Depot'),
(9261, 'Point Nepean Office'),
(220, 'Port Campbell'),
(135705, 'Port Campbell (Depot)'),
(135694, 'Port Welshpool (Depot)'),
(127362, 'Portland Depot'),
(221, 'Portland Office'),
(143, 'Queen St'),
(222, 'Queenscliff'),
(135706, 'Queenscliff Depot'),
(424, 'Rainbow'),
(223, 'Redcliffs'),
(10375, 'Robinvale'),
(225, 'Rosebud'),
(226, 'Sale'),
(227, 'San Remo'),
(135707, 'San Remo Depot'),
(135708, 'Seawinds (Depot)'),
(228, 'Serendip'),
(229, 'Shepherd Road'),
(230, 'Shepparton - Do Not Use'),
(10376, 'Shepparton Depot'),
(231, 'Silvan'),
(232, 'Speed'),
(233, 'St Arnaud'),
(234, 'State Coal Mine'),
(235, 'Stawell'),
(127363, 'Swan Hill Depot'),
(236, 'Swan Hill Office'),
(237, 'Tallangatta'),
(238, 'Tidal River'),
(135709, 'Tower Hill (Depot)'),
(239, 'Traralgon'),
(135710, 'Traralgon (Depot)'),
(23090, 'Twelve Apostles Kiosk'),
(240, 'Underbool'),
(241, 'Upper Yarra'),
(242, 'Wail'),
(135711, 'Wangaratta (Depot)'),
(243, 'Wangaratta Office'),
(244, 'Warrandyte'),
(245, 'Warrnambool'),
(246, 'Werribee Park'),
(247, 'Werrimull'),
(248, 'Westerfolds'),
(249, 'Whitfield'),
(250, 'William Ricketts'),
(251, 'Williamstown'),
(252, 'Wilsons Promontory Lightstation'),
(253, 'Wodonga'),
(254, 'Wonthaggi'),
(255, 'Woodlands'),
(256, 'Woori Yallock'),
(257, 'Wyperfeld'),
(423, 'Yaapeet'),
(258, 'Yanakie'),
(135712, 'Yanakie (Depot)'),
(259, 'Yarra Bend'),
(260, 'Yarram (Office)'),
(261, 'Yarrawonga'),
(262, 'You Yangs Depot'),
(127364, 'You Yangs Office'),
(1, 'Work from Home'),
(2, 'Other Agency Office'),
(3, 'F&E Deployment'),
(4, 'Remote Location');




-- ACTIVITIES MANAGEMENT SCHEMA:
/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : PostgreSQL
 Source Server Version : 160002 (160002)
 Source Host           : localhost:5432
 Source Catalog        : ntimes
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 160002 (160002)
 File Encoding         : 65001

 Date: 08/04/2024 19:34:39
*/


-- ----------------------------
-- Table structure for activities
-- ----------------------------
DROP TABLE IF EXISTS "public"."activities";
CREATE TABLE "public"."activities" (
  "id" int4 NOT NULL DEFAULT nextval('activities_id_seq'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "programs" int4[],
  "percentages" numeric(5,2)[],
  "status" "public"."status_enum" NOT NULL DEFAULT 'user_defined'::status_enum,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "user_id" int4
)
;

-- ----------------------------
-- Records of activities
-- ----------------------------
INSERT INTO "public"."activities" VALUES (1, 'Activity Name', '{615,665}', '{60.00,40.00}', 'user_defined', '2024-04-05 06:21:36.943327', '2024-04-05 06:21:36.943327', 1);
INSERT INTO "public"."activities" VALUES (6, 'Activity 2', '{515,555}', '{30.00,70.00}', 'user_defined', '2024-04-06 07:09:35.502979', '2024-04-06 07:09:35.502979', 1);
INSERT INTO "public"."activities" VALUES (7, 'Activty 3', '{414,424}', '{50.00,50.00}', 'emergency', '2024-04-06 07:10:32.519919', '2024-04-06 07:10:32.519919', 1);

-- ----------------------------
-- Primary Key structure for table activities
-- ----------------------------
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");

