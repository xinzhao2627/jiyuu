
-- CREATE TABLE block_group(
--     id INTEGER PRIMARY KEY,
--     group_name VARCHAR(255) NOT NULL,
--     is_grayscaled INTEGER DEFAULT 1,
--     is_covered INTEGER DEFAULT 0,
--     is_muted Integer DEFAULT 0,
--     is_activated Integer DEFAULT 0,
-- )
        -- insert into block_group(group_name, is_grayscaled, is_muted, is_activated) VALUES("main", 1, 1, 1);
        -- SELECT * from block_group;

    -- ALTER TABLE block_group
    -- ADD is_activated Integer default 0
    -- UPDATE block_group SET is_activated=1 WHERE group_name='group1'
    -- SELECT * from block_group
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

select * from blocked_sites

CREATE TABLE IF NOT EXISTS usage_log (
        id INTEGER PRIMARY KEY,
        web_url TEXT NOT NULL,
        web_content TEXT,
        time_start TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
        time_end TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
        time_total_seconds INTEGER NOT NULL
)

SELECT * from block_group