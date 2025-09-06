
-- CREATE TABLE block_group(
--         id INTEGER PRIMARY KEY,
--         group_name VARCHAR(255) NOT NULL,
--         is_grayscaled INTEGER DEFAULT 1,
--         is_covered INTEGER DEFAULT 0,
--         is_muted Integer DEFAULT 0,
--         is_activated Integer DEFAULT 0,

--         usage_time_left INTEGER,
--         usage_time_value INTEGER,
--         usage_reset_period VARCHAR(255) NOT NULL,

--         lock_type VARCHAR(255) DEFAULT NULL
-- )
        -- insert into block_group(group_name, is_grayscaled, is_muted, is_activated) VALUES("main", 1, 1, 1);
        -- SELECT * from block_group;

    ALTER TABLE block_group
    DROP COLUMN aiut;
        PRAGMA table_info(block_group);


    UPDATE block_group SET is_activated=1 WHERE group_name='group1'
    SELECT * from block_group
-- CREATE TABLE blocked_sites (
--     target_text text NOT NULL,
--     block_group_id INTEGER NOT NULL REFERENCES block_group(id),
--     PRIMARY KEY (target_text, block_group_id),
--     FOREIGN KEY (block_group_id) REFERENCES block_group(id)
-- );

        -- INSERT into blocked_sites(target_text, block_group_id) VALUES ("jav", 3);
        -- INSERT into blocked_sites(target_text, block_group_id) VALUES ("porn", 3);
        -- INSERT into blocked_sites(target_text, block_group_id) VALUES ("hentai", 3);



        -- INSERT into blocked_sites(target_text, block_group_id) VALUES ("reddit", 1);
        -- INSERT into blocked_sites(target_text, block_group_id) VALUES ("youtube", 1);
        

        -- select * from blocked_sites;

-- SELECT 
--     bs.target_text, bg.is_grayscaled, 
--     bg.is_covered, bg.is_muted, 
--     bg.group_name, bs.block_group_id
-- FROM blocked_sites as bs 
-- INNER JOIN block_group as bg ON 
--     bg.id = bs.block_group_id;


-- UPDATE blocked_sites
-- SET target_text = ' jav '
-- WHERE target_text = 'jav';


-- SELECT bs.target_text FROM blocked_sites AS bs JOIN block_group as bg on bs.block_group_id = bg.id WHERE bs.block_group_id = 1

-- select * from blocked_sites

CREATE TABLE  usage_log (
        id INTEGER PRIMARY KEY,
        base_url TEXT NOT NULL,
        full_url TEXT NOT NULL,
        date_object VARCHAR(255) NOT NULL,
        seconds_elapsed INTEGER
)
-- PRAGMA table_info(usage_log)
-- DROP table usage_log


-- SELECT * from block_group


CREATE TABLE IF NOT EXISTS date_today (
        id INTEGER PRIMARY KEY,
        date_object VARCHAR(255) NOT NULL
)
select * from date_today
drop table date_today

drop table block_group_config

CREATE TABLE block_group_config (
        id INTEGER PRIMARY KEY,
        block_group_id INTEGER NOT NULL REFERENCES block_group(id),
        config_type VARCHAR(255),
        config_data JSON,
        UNIQUE(block_group_id, config_type) ON CONFLICT REPLACE
);

select * from block_group_config
select * from usage_log
select * from block_group
select * from block_group_usage_log
SELECT * from blocked_content
SELECT * from click_count
delete from block_group_config where id = 3
SELECT * from user_options

DROP TABLE IF EXISTS block_group;
DROP TABLE IF EXISTS blocked_content;
DROP TABLE IF EXISTS usage_log;
DROP TABLE IF EXISTS block_group_config;
DROP TABLE IF EXISTS date_today;
DROP TABLE if EXISTS migration;
DROP TABLE block_sites;
DROP TABLE 

CREATE TABLE IF NOT EXISTS block_group(
                id INTEGER PRIMARY KEY,
                group_name VARCHAR(255) NOT NULL,
                is_grayscaled INTEGER DEFAULT 0,
                is_covered INTEGER DEFAULT 0,
                is_muted Integer DEFAULT 0,
                is_activated Integer DEFAULT 0,
				is_blurred INTEGER DEFAULT 0,
                auto_deactivate INTEGER DEFAULT 0,
                restriction_type VARCHAR(255) DEFAULT NULl)

SELECT bg.*, GROUP_CONCAT(
            CASE WHEN bgc.id IS NOT NULL
            THEN json_object(
                    'id', bgc.id,
                    'config_type', bgc.config_type,
                    'config_data', bgc.config_data
            ) END
        ) AS configs_json 
        FROM block_group bg 
        LEFT JOIN block_group_config bgc 
        ON bg.id = bgc.block_group_id
        GROUP BY  bg.id

PRAGMA table_info(block_group);