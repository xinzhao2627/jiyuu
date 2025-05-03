
-- CREATE TABLE block_group(
--     id INTEGER PRIMARY KEY,
--     group_name VARCHAR(255),
--     is_grayscaled INTEGER DEFAULT 1,
--     is_covered INTEGER DEFAULT 0,
--     is_muted Integer DEFAULT 0
-- )
        -- insert into block_group(group_name) VALUES("group1");
        -- SELECT * from block_group;

    -- ALTER TABLE block_group
    -- ADD is_activated Integer default 0


-- CREATE TABLE blocked_sites (
--     target_text text,
--     block_group_id INTEGER REFERENCES block_group(id),
--     PRIMARY KEY (target_text, block_group_id),
--     FOREIGN KEY (block_group_id) REFERENCES block_group(id)
-- );

        -- INSERT into blocked_sites(target_text, block_group_id) VALUES ("wuthering", 1);
        -- INSERT into blocked_sites(target_text, block_group_id) VALUES ("reddit.com", 1);
        -- select * from blocked_sites;


